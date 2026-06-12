import { useState } from 'react'
import Chat from './components/Chat'
import ChatButton from './components/ChatButton'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="relative">
      <div className="min-h-screen bg-gray-950">
        <p className="text-gray-500 text-sm fixed top-6 left-1/2 -translate-x-1/2">
          Page content would go here
        </p>
      </div>

      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}
      <ChatButton onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />
    </div>
  )
}

export default App
