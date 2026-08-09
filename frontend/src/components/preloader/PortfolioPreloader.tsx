import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './portfolio-preloader.css'

const DEFAULT_STORAGE_KEY = 'aaron-portfolio:preloader-complete'

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
  const filledBlocks = Math.round((progress / 100) * totalBlocks)

  return `${'█'.repeat(filledBlocks)}${'░'.repeat(totalBlocks - filledBlocks)}`
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
  const assetsLoadedRef = useRef(document.readyState === 'complete')
  const onCompleteRef = useRef(onComplete)
  const progressBar = formatProgressBar(progress)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (document.readyState === 'complete') {
      assetsLoadedRef.current = true
      return undefined
    }

    const handlePageLoad = () => {
      assetsLoadedRef.current = true
    }

    window.addEventListener('load', handlePageLoad, { once: true })
    return () => window.removeEventListener('load', handlePageLoad)
  }, [])

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
    const timeoutIds = new Set<number>()
    const animationFrameIds = new Set<number>()

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        const timeoutId = window.setTimeout(() => {
          timeoutIds.delete(timeoutId)
          resolve()
        }, duration)
        timeoutIds.add(timeoutId)
      })

    const animateProgress = (from: number, to: number, duration: number) =>
      new Promise<void>((resolve) => {
        const startedAt = performance.now()

        const update = (now: number) => {
          if (cancelled) {
            resolve()
            return
          }

          const elapsed = Math.min((now - startedAt) / duration, 1)
          const eased = 1 - Math.pow(1 - elapsed, 4)
          setProgress(Math.round(from + (to - from) * eased))

          if (elapsed < 1) {
            const frameId = window.requestAnimationFrame(update)
            animationFrameIds.add(frameId)
          } else {
            resolve()
          }
        }

        const frameId = window.requestAnimationFrame(update)
        animationFrameIds.add(frameId)
      })

    const typeBootMessage = async (message: string, lineIndex: number) => {
      setBootLines((current) => [...current, ''])

      for (let characterIndex = 0; characterIndex < message.length; characterIndex += 1) {
        if (cancelled) return

        const character = message[characterIndex]
        setBootLines((current) => {
          const next = [...current]
          next[next.length - 1] += character
          return next
        })

        const naturalVariance = (character.charCodeAt(0) + lineIndex + characterIndex) % 7
        const punctuationPause = character === '.' ? 14 : 0
        await wait(5 + naturalVariance + punctuationPause)
      }
    }

    const complete = async () => {
      if (cancelled) return

      setPhase('exiting')
      await wait(prefersReducedMotion ? 160 : 340)
      if (cancelled) return

      markSessionComplete(storageKey)
      setIsVisible(false)
      onCompleteRef.current?.()
    }

    const runReducedSequence = async () => {
      setBootLines([...BOOT_MESSAGES])
      setProgress(100)
      await wait(300)
      await complete()
    }

    const runSequence = async () => {
      setBootLines([])
      setProgress(0)

      for (let index = 0; index < BOOT_MESSAGES.length; index += 1) {
        await typeBootMessage(BOOT_MESSAGES[index], index)
        setProgress(Math.round(((index + 1) / BOOT_MESSAGES.length) * 32))
        await wait(46 + ((index * 17) % 28))
      }

      if (cancelled) return

      if (assetsLoadedRef.current) {
        await animateProgress(32, 100, 520)
      } else {
        await animateProgress(32, 88, 420)
        await wait(70)

        if (assetsLoadedRef.current) {
          await animateProgress(88, 100, 120)
        } else {
          await animateProgress(88, 96, 110)
          await wait(45)
          await animateProgress(96, 100, 85)
        }
      }

      await wait(320)
      await complete()
    }

    if (prefersReducedMotion) {
      void runReducedSequence()
    } else {
      void runSequence()
    }

    return () => {
      cancelled = true
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      animationFrameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
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
