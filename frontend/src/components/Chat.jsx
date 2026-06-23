import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, Sparkles, X } from 'lucide-react'
import { useTheme } from './ThemeContext'

const API_URL = '/chat'

function Chat({ onClose }) {
  useTheme()
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the server. Please make sure the backend is running.'
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[320px] h-[400px] flex flex-col rounded-2xl overflow-hidden bg-gray-950 text-gray-100 shadow-2xl shadow-black/50 border border-[var(--ctp-accent)]">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--ctp-accent)] bg-gray-900/80">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ctp-base)] shadow-lg">
          <Sparkles className="w-4 h-4 text-[var(--ctp-accent)]" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold tracking-tight text-white">Aaron Intelligence "AI"</h1>
          <p className="text-[10px] text-gray-400">AI representative</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--ctp-base)] flex items-center justify-center shadow-lg">
                  <Bot className="w-3.5 h-3.5 text-[var(--ctp-accent)]" />
                </div>
              )}

              <div
                className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 border border-[var(--ctp-accent)] text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-p:leading-relaxed prose-p:mb-1 prose-p:mt-0
                    prose-headings:mt-2 prose-headings:mb-1
                    prose-ul:my-1 prose-ol:my-1
                    prose-li:my-0.5
                    prose-code:text-blue-300 prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 prose-pre:border prose-pre:border-[var(--ctp-accent)] prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-xs
                    prose-blockquote:border-l-[var(--ctp-accent)] prose-blockquote:text-gray-300
                    prose-a:break-words prose-a:overflow-wrap-anywhere">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--ctp-accent)] flex items-center justify-center shadow-lg">
                <Bot className="w-3.5 h-3.5 text-white" />
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

      <footer className="border-t border-[var(--ctp-accent)] bg-gray-900/80 px-4 py-3">
        {error && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-[var(--ctp-accent)] rounded-xl px-3 py-2.5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--ctp-accent)] focus:border-[var(--ctp-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg border border-[var(--ctp-accent)] transition-colors disabled:shadow-none ${
              input.trim()
                ? 'bg-[var(--ctp-base)] text-white shadow-lg'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            <Send className="w-4 h-4 text-[var(--ctp-accent)]" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-gray-500 text-center">
          Responses are generated from a knowledge base.
        </p>
      </footer>
    </div>
  )
}

export default Chat