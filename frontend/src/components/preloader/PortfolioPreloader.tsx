import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './portfolio-preloader.css'

const DEFAULT_STORAGE_KEY = 'aaron-portfolio:preloader-complete'
const PRELOADER_DURATION_MS = 600
const PRELOADER_EXIT_DURATION_MS = 150
const PRELOADER_ACTIVE_DURATION_MS = PRELOADER_DURATION_MS - PRELOADER_EXIT_DURATION_MS

const BOOT_MESSAGES = [
  'Loading portfolio interface...',
  'Preparing project previews...',
  'Applying saved theme...',
  'Preparing portfolio assistant...',
  'Portfolio ready.',
] as const

type PreloaderPhase = 'loading' | 'exiting'

export interface PortfolioPreloaderProps {
  disabled?: boolean
  storageKey?: string
  onComplete?: () => void
}

function hasCompletedSession(storageKey: string) {
  if (typeof window === 'undefined') return true

  try {
    return window.sessionStorage.getItem(storageKey) === 'true'
  } catch {
    return false
  }
}

function markSessionComplete(storageKey: string) {
  try {
    window.sessionStorage.setItem(storageKey, 'true')
  } catch {
    // The experience still works when storage is unavailable.
  }
}

function formatProgressBar(progress: number) {
  const totalBlocks = 20
  const boundedProgress = Math.min(Math.max(progress, 0), 100)
  const filledBlocks = Math.round((boundedProgress / 100) * totalBlocks)

  return `${'█'.repeat(filledBlocks)}${'░'.repeat(totalBlocks - filledBlocks)}`
}

function getBootLines(progress: number) {
  const totalCharacters = BOOT_MESSAGES.reduce(
    (total, message) => total + message.length,
    0,
  )
  let remainingCharacters = Math.ceil(totalCharacters * progress)
  const lines: string[] = []

  for (const message of BOOT_MESSAGES) {
    if (remainingCharacters <= 0) break

    const visibleCharacters = Math.min(remainingCharacters, message.length)
    lines.push(message.slice(0, visibleCharacters))
    remainingCharacters -= visibleCharacters
  }

  return lines
}

export function PortfolioPreloader({
  disabled = false,
  storageKey = DEFAULT_STORAGE_KEY,
  onComplete,
}: PortfolioPreloaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(
    () => !disabled && !hasCompletedSession(storageKey),
  )
  const [phase, setPhase] = useState<PreloaderPhase>('loading')
  const [bootLines, setBootLines] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  const progressBar = formatProgressBar(progress)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isVisible) return undefined

    const root = document.documentElement
    const body = document.body
    const portfolio = document.getElementById('portfolio-content')
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousOverscrollBehavior = body.style.overscrollBehavior

    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    portfolio?.setAttribute('inert', '')
    portfolio?.setAttribute('aria-hidden', 'true')

    return () => {
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      body.style.overscrollBehavior = previousOverscrollBehavior
      portfolio?.removeAttribute('inert')
      portfolio?.removeAttribute('aria-hidden')
      body.removeAttribute('data-portfolio-preloader')
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return undefined

    document.body.setAttribute(
      'data-portfolio-preloader',
      phase === 'exiting' ? 'leaving' : 'active',
    )

    return () => {
      document.body.removeAttribute('data-portfolio-preloader')
    }
  }, [isVisible, phase])

  useEffect(() => {
    if (!isVisible) return undefined

    let cancelled = false
    let animationFrameId: number | undefined
    let exitTimeoutId: number | undefined
    let completionTimeoutId: number | undefined

    const complete = () => {
      if (cancelled) return
      markSessionComplete(storageKey)
      setIsVisible(false)
      onCompleteRef.current?.()
    }

    const beginExit = () => {
      if (cancelled) return
      setPhase('exiting')
    }

    exitTimeoutId = window.setTimeout(beginExit, PRELOADER_ACTIVE_DURATION_MS)
    completionTimeoutId = window.setTimeout(complete, PRELOADER_DURATION_MS)

    if (prefersReducedMotion) {
      setBootLines([...BOOT_MESSAGES])
      setProgress(100)
    } else {
      const startedAt = performance.now()

      const update = (now: number) => {
        if (cancelled) return

        const elapsed = Math.min(
          Math.max((now - startedAt) / PRELOADER_ACTIVE_DURATION_MS, 0),
          1,
        )
        const eased = 1 - Math.pow(1 - elapsed, 4)

        setProgress(Math.round(eased * 100))
        setBootLines(getBootLines(elapsed))

        if (elapsed < 1) {
          animationFrameId = window.requestAnimationFrame(update)
        }
      }

      animationFrameId = window.requestAnimationFrame(update)
    }

    return () => {
      cancelled = true
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId)
      }
      if (exitTimeoutId !== undefined) {
        window.clearTimeout(exitTimeoutId)
      }
      if (completionTimeoutId !== undefined) {
        window.clearTimeout(completionTimeoutId)
      }
    }
  }, [isVisible, prefersReducedMotion, storageKey])

  if (!isVisible) return null

  const screenReaderStatus =
    phase === 'exiting' || progress === 100
      ? 'Portfolio ready. Opening site.'
      : 'Loading Aaron Arada\'s portfolio.'

  return (
    <div
      className={`portfolio-preloader ${phase === 'exiting' ? 'portfolio-preloader--exiting' : ''}`}
      role="status"
      aria-label="Loading Aaron Arada's portfolio"
      data-phase={phase}
    >
      <span className="sr-only" aria-live="polite">
        {screenReaderStatus}
      </span>

      <div className="portfolio-preloader__scanlines" aria-hidden="true" />
      <div className="portfolio-preloader__vignette" aria-hidden="true" />

      <div className="portfolio-preloader__shell">
        <main className="portfolio-preloader__stage" aria-hidden="true">
          <div
            className={`portfolio-preloader__access-title ${
              progress === 100 ? 'portfolio-preloader__access-title--complete' : ''
            }`}
          >
            Portfolio Ready
          </div>

          <div className="portfolio-preloader__progress-system">
            <div className="portfolio-preloader__progress-bar">[{progressBar}]</div>
            <div className="portfolio-preloader__percentage">
              {String(progress).padStart(3, ' ')}%
            </div>

            <div className="portfolio-preloader__boot-log">
              {BOOT_MESSAGES.map((message, index) => {
                const typedLine = bootLines[index] ?? ''
                const isCurrentLine = index === bootLines.length - 1
                  && typedLine !== message

                return (
                  <div className="portfolio-preloader__boot-line" key={message}>
                    <span>{typedLine}</span>
                    {isCurrentLine && <span className="portfolio-preloader__cursor" />}
                  </div>
                )
              })}
            </div>

            <div className="portfolio-preloader__launch-status">
              {progress === 100 ? 'Launching Portfolio...' : '\u00A0'}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
