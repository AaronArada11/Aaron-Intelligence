import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { ThemeProvider } from './components/ThemeContext'
import { Navbar } from './components/Navbar'
import { ProjectsPage } from './components/ProjectsPage'
import { Footer } from './components/Footer'
import ChatButton from './components/ChatButton'

const HomePage = lazy(() => import('./components/HomePage.jsx'))
const AboutPage = lazy(() =>
  import('./components/AboutPage.jsx').then(({ AboutPage: Page }) => ({
    default: Page,
  })),
)
const Chat = lazy(() => import('./components/Chat.jsx'))
const enablePreloader = import.meta.env.VITE_ENABLE_PRELOADER === 'true'
const PortfolioPreloader = enablePreloader
  ? lazy(() =>
      import('./components/preloader/PortfolioPreloader.tsx').then(
        ({ PortfolioPreloader: Preloader }) => ({ default: Preloader }),
      ),
    )
  : null

function RouteFallback() {
  return <main className="min-h-screen" aria-busy="true" />
}

function getCurrentPath() {
  return window.location.pathname
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(getCurrentPath)
  const [currentHash, setCurrentHash] = useState(() => window.location.hash)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getCurrentPath())
      setCurrentHash(window.location.hash)
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  useLayoutEffect(() => {
    if (currentPath !== '/' || currentHash !== '#contact') return

    const scrollToContact = () => {
      const contact = document.getElementById('contact')

      if (!contact) return false

      contact.scrollIntoView({ block: 'start' })
      return true
    }

    if (scrollToContact()) return

    const observer = new MutationObserver(() => {
      if (scrollToContact()) observer.disconnect()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [currentHash, currentPath])

  const isAboutPage = currentPath === '/about'
  const isProjectsPage = currentPath === '/projects'

  return (
    <div className="relative">
      {PortfolioPreloader ? (
        <Suspense fallback={null}>
          <PortfolioPreloader
            disabled={import.meta.env.VITE_DISABLE_PRELOADER === 'true'}
          />
        </Suspense>
      ) : null}
      <div id="portfolio-content">
        <ThemeProvider>
          <Navbar />
          {isAboutPage ? (
            <Suspense fallback={<RouteFallback />}>
              <AboutPage onOpenChat={() => setIsChatOpen(true)} />
            </Suspense>
          ) : isProjectsPage ? (
            <ProjectsPage onOpenChat={() => setIsChatOpen(true)} />
          ) : (
            <Suspense fallback={<RouteFallback />}>
              <HomePage onOpenChat={() => setIsChatOpen(true)} />
            </Suspense>
          )}
          {isChatOpen ? (
            <Suspense fallback={null}>
              <Chat onClose={() => setIsChatOpen(false)} />
            </Suspense>
          ) : (
            <ChatButton onClick={() => setIsChatOpen(true)} />
          )}
          <Footer />
        </ThemeProvider>
      </div>
    </div>
  )
}

export default App
