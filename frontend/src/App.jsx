import { useEffect, useState } from 'react'
import { ThemeProvider } from './components/ThemeContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { AboutPage } from './components/AboutPage'
import { Projects } from './components/Projects'
import { ProjectsPage } from './components/ProjectsPage'
import { Dashboard } from './components/Dashboard'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import Chat from './components/Chat'
import ChatButton from './components/ChatButton'
import { PortfolioPreloader } from './components/preloader/PortfolioPreloader'

function getCurrentPath() {
  return window.location.pathname
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(getCurrentPath)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getCurrentPath())
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  const isAboutPage = currentPath === '/about'
  const isProjectsPage = currentPath === '/projects'

  return (
    <div className="relative">
      <PortfolioPreloader
        disabled={import.meta.env.VITE_DISABLE_PRELOADER === 'true'}
      />
      <div id="portfolio-content">
        <ThemeProvider>
          <Navbar />
          {isAboutPage ? (
            <AboutPage onOpenChat={() => setIsChatOpen(true)} />
          ) : isProjectsPage ? (
            <ProjectsPage />
          ) : (
            <main>
              <Hero />
              <Projects />
              <Dashboard />
              <Contact />
            </main>
          )}
          {isChatOpen ? (
            <Chat onClose={() => setIsChatOpen(false)} />
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
