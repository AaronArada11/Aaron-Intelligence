import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Chat from './Chat'


const response = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(body),
})

const submitQuestion = async (question = 'Where does Aaron study?') => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Message Aaron Intelligence'), question)
  await user.click(screen.getByRole('button', { name: 'Send message' }))
  return user
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Chat', () => {
  it('renders answers without a sources disclosure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(200, {
      answer: 'Aaron studies at FEU Tech.',
      outcome: 'answered',
      request_id: 'request-1',
      sources: [],
    }))
    render(<Chat onClose={vi.fn()} />)

    await submitQuestion()

    expect(await screen.findByText('Aaron studies at FEU Tech.')).toBeInTheDocument()
    expect(screen.queryByText(/^Sources/)).not.toBeInTheDocument()
  })

  it('shows only valid sources in a keyboard-accessible disclosure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(200, {
      answer: 'Aaron studies at FEU Tech.',
      outcome: 'answered',
      request_id: 'request-2',
      sources: [
        { id: 'S1', title: 'Education', section: 'FEU Institute of Technology' },
        { id: 'invalid', title: 'Internal file.md', section: 'score=0.9' },
      ],
    }))
    render(<Chat onClose={vi.fn()} />)
    const user = await submitQuestion()

    const disclosure = await screen.findByText('Sources (1)')
    disclosure.focus()
    await user.keyboard('{Enter}')

    expect(disclosure).toHaveFocus()
    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Education')).toBeVisible()
    expect(screen.getByText(/FEU Institute of Technology/)).toBeVisible()
    expect(screen.queryByText('Internal file.md')).not.toBeInTheDocument()
  })

  it.each([
    [429, 'Aaron Intelligence is temporarily rate limited. Please wait a moment and try again.'],
    [503, 'Aaron Intelligence is temporarily unavailable. Please try again shortly.'],
  ])('renders a distinct friendly message for HTTP %s', async (status, expected) => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(status, { detail: 'temporary' }))
    render(<Chat onClose={vi.fn()} />)

    await submitQuestion()

    await waitFor(() => expect(screen.getAllByText(expected).length).toBeGreaterThan(0))
    expect(screen.getByLabelText('Message Aaron Intelligence')).toHaveAttribute(
      'aria-describedby',
      'chat-error',
    )
  })

  it('provides named controls and closes with Escape', async () => {
    const onClose = vi.fn()
    render(<Chat onClose={onClose} />)

    expect(screen.getByRole('button', { name: 'Close chat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
