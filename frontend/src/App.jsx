import { useState } from 'react'
import { ThemeProvider } from './components/ThemeContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Dashboard } from './components/Dashboard'
import { Footer } from './components/Footer'
import Chat from './components/Chat'
import ChatButton from './components/ChatButton'
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="relative">
      <ThemeProvider>
        <Navbar />
        <main>
          <Hero />
          <Projects />
          <Dashboard />
          {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}
          <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />
        </main>
        <Footer />
      </ThemeProvider>
    </div>
  )
}

export default App
