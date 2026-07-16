import { useState, useRef, useEffect, useId } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, Sparkles, X } from 'lucide-react'

const API_URL = '/chat'
const RATE_LIMIT_MESSAGE = 'Aaron Intelligence is temporarily rate limited. Please wait a moment and try again.'
const SERVICE_UNAVAILABLE_MESSAGE = 'Aaron Intelligence is temporarily unavailable. Please try again shortly.'
const GENERIC_ERROR_MESSAGE = 'Sorry, I encountered an error while generating a response. Please try again in a moment.'

const isRateLimitDetail = (value) => {
  const message = String(value || '').toLowerCase()
  return (
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('rate_limit') ||
    message.includes('quota') ||
    message.includes('resource_exhausted') ||
    message.includes('too many requests')
  )
}

const normalizeSources = (sources) => {
  if (!Array.isArray(sources)) return []
  return sources.filter(source => (
    source &&
    typeof source.id === 'string' &&
    /^S[1-9]\d*$/.test(source.id) &&
    typeof source.title === 'string' &&
    typeof source.section === 'string'
  ))
}

function SourceDisclosure({ sources }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sourceListId = useId()
  const toggleSources = () => setIsExpanded(expanded => !expanded)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleSources()
    }
  }

  return (
    <div className="mt-2 border-t border-gray-700 pt-2 text-xs">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={sourceListId}
        onClick={toggleSources}
        onKeyDown={handleKeyDown}
        className="text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ctp-accent)]"
      >
        Sources ({sources.length})
      </button>
      {isExpanded ? (
        <ul id={sourceListId} className="mt-2 space-y-1.5 text-gray-300">
          {sources.map(source => (
            <li key={source.id}>
              <span className="font-medium text-gray-100">{source.title}</span>
              {source.section !== source.title ? ` — ${source.section}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Chat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Aaron Intelligence, the AI representative of Aaron. Feel free to ask questions about Aaron.'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedInput }),
      })

      if (!response.ok) {
        let detail = ''
        try {
          const errorData = await response.json()
          detail = errorData.detail || ''
        } catch {
          detail = ''
        }

        const error = new Error(detail || `HTTP error! status: ${response.status}`)
        error.status = response.status
        error.detail = detail
        throw error
      }

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: normalizeSources(data.sources),
      }])
    } catch (err) {
      const isRateLimited = err.status === 429 || isRateLimitDetail(err.detail || err.message)
      const isUnavailable = err.status === 503
      const message = isRateLimited
        ? RATE_LIMIT_MESSAGE
        : isUnavailable
          ? SERVICE_UNAVAILABLE_MESSAGE
          : GENERIC_ERROR_MESSAGE

      setError(message)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <section
      aria-labelledby="aaron-chat-title"
      className="fixed bottom-24 right-6 z-50 w-[320px] h-[400px] flex flex-col rounded-2xl overflow-hidden bg-gray-950 text-gray-100 shadow-2xl shadow-black/50 border border-[var(--ctp-accent)]"
    >
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--ctp-surface0)] bg-gray-900/80">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ctp-base)] shadow-lg">
          <Sparkles aria-hidden="true" className="w-4 h-4 text-[var(--ctp-accent)]" />
        </div>
        <div className="flex-1">
          <h1 id="aaron-chat-title" className="text-sm font-semibold tracking-tight text-white">Aaron Intelligence "AI"</h1>
          <p className="text-[10px] text-gray-400">AI representative</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ctp-accent)]"
        >
          <X aria-hidden="true" className="w-4 h-4" />
        </button>
      </header>

      <main aria-busy={isLoading} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--ctp-base)] flex items-center justify-center shadow-lg">
                  <Bot aria-hidden="true" className="w-3.5 h-3.5 text-[var(--ctp-accent)]" />
                </div>
              )}

              <div
                className={`min-w-0 max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 border border-[var(--ctp-surface0)] text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none break-words [overflow-wrap:anywhere]
                    prose-p:leading-relaxed prose-p:mb-1 prose-p:mt-0
                    prose-headings:mt-2 prose-headings:mb-1
                    prose-ul:my-1 prose-ol:my-1
                    prose-li:my-0.5
                    prose-code:text-blue-300 prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:border prose-pre:border-[var(--ctp-surface0)] prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-xs
                    prose-blockquote:border-l-[var(--ctp-surface0)] prose-blockquote:text-gray-300
                    prose-a:break-words prose-a:overflow-wrap-anywhere">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.sources?.length > 0 ? (
                      <SourceDisclosure sources={msg.sources} />
                    ) : null}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                  <User aria-hidden="true" className="w-3.5 h-3.5 text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div role="status" aria-live="polite" className="flex gap-2.5 justify-start">
              <span className="sr-only">Aaron Intelligence is preparing a response.</span>
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--ctp-base)] flex items-center justify-center shadow-lg">
                <Bot aria-hidden="true" className="w-3.5 h-3.5 text-[var(--ctp-accent)]" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-800 border border-[var(--ctp-accent)]">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-[var(--ctp-surface0)] bg-gray-900/80 px-4 py-3">
        {error && (
          <div id="chat-error" role="alert" aria-live="assertive" className="mb-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <label htmlFor="chat-message" className="sr-only">Message Aaron Intelligence</label>
          <input
            id="chat-message"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            maxLength={1000}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'chat-error' : undefined}
            className="flex-1 bg-gray-800 border border-[var(--ctp-surface0)] rounded-xl px-3 py-2.5 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--ctp-accent)] focus:border-[var(--ctp-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isLoading || !input.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg border border-[var(--ctp-accent)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ctp-accent)] disabled:shadow-none ${
              input.trim()
                ? 'bg-[var(--ctp-base)] text-white shadow-lg'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            <Send aria-hidden="true" className="w-4 h-4 text-[var(--ctp-accent)]" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-gray-500 text-center">
          Responses are generated from a knowledge base.
        </p>
      </footer>
    </section>
  )
}

export default Chat
