import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, User } from 'lucide-react'
import ChatButton from './ChatButton'
import '../Chat.css'

const API_URL = '/chat'
const BOT_AVATAR_SRC = '/images/AaronIntelligence_AVATAR.png'
const RATE_LIMIT_MESSAGE = 'The assistant has reached its request limit. Wait a minute, then try again.'
const NETWORK_ERROR_MESSAGE = 'I couldn\'t reach the assistant. Check your connection and try again.'
const GENERIC_ERROR_MESSAGE = 'The assistant is unavailable right now. Please try again in a moment.'
const SUGGESTED_QUESTIONS = [
  'What can you help me with?',
  'How can I contact Aaron?',
  'What projects has Aaron worked on?',
]

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

function Chat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'You can ask me anything about Aaron and I\'ll help you find the relevant information.'
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

  const handleSuggestedQuestion = (question) => {
    if (isLoading) return

    setInput(question)
    inputRef.current?.focus()
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err) {
      const isRateLimited = err.status === 429 || isRateLimitDetail(err.detail || err.message)
      const isNetworkError = err instanceof TypeError && !err.status
      const message = isRateLimited
        ? RATE_LIMIT_MESSAGE
        : isNetworkError
          ? NETWORK_ERROR_MESSAGE
          : GENERIC_ERROR_MESSAGE

      setError(message)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div
      id="aaron-intelligence-chat"
      className="chat-shell fixed z-50 flex flex-col overflow-hidden rounded-lg border border-[var(--ctp-accent)] bg-[var(--ctp-base)] text-[var(--ctp-text)] shadow-2xl shadow-black/50"
    >
      <header className="bg-[var(--ctp-base)]">
        <ChatButton onClick={onClose} isOpen embedded />
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className={`flex flex-col gap-4 ${messages.length === 1 && !isLoading ? 'chat-empty-state' : ''}`}>
          {messages.map((msg, idx) => {
            const isIntroMessage = idx === 0 && msg.role === 'assistant'

            if (isIntroMessage) {
              return (
                <div key={idx} className="chat-intro-message">
                  <img
                    src={BOT_AVATAR_SRC}
                    alt=""
                    className="chat-intro-message__icon"
                  />
                  <h2 className="chat-intro-message__title">Send a message to start the chat!</h2>
                  <p className="chat-intro-message__description">{msg.content}</p>
                </div>
              )
            }

            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="size-10 flex-shrink-0 overflow-hidden rounded-full border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] shadow-lg">
                    <img
                      src={BOT_AVATAR_SRC}
                      alt=""
                      className="h-full w-full scale-150 object-cover"
                    />
                  </div>
                )}

                <div
                  className={`min-w-0 max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                    msg.role === 'user'
                      ? 'border border-[var(--ctp-accent)] bg-[var(--ctp-surface0)] text-[var(--ctp-text)] rounded-br-sm'
                      : 'bg-[var(--ctp-mantle)] border border-[var(--ctp-surface0)] text-[var(--ctp-text)] rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="chat-markdown max-w-none break-words [overflow-wrap:anywhere]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.content}</p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--ctp-surface1)] border border-[var(--ctp-surface2)] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[var(--ctp-text)]" />
                  </div>
                )}
              </div>
            )
          })}

          {messages.length === 1 && !isLoading && (
            <section className="chat-suggestions" aria-labelledby="chat-suggestions-label">
              <p id="chat-suggestions-label" className="chat-suggestions__label">
                Try asking:
              </p>
              <div className="chat-suggestions__list">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="chat-suggestion"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </section>
          )}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="size-10 flex-shrink-0 overflow-hidden rounded-full border border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] shadow-lg">
                <img
                  src={BOT_AVATAR_SRC}
                  alt=""
                  className="h-full w-full scale-150 object-cover"
                />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[var(--ctp-mantle)] border border-[var(--ctp-accent)]">
                <span className="sr-only" role="status">
                  Aaron Intelligence is searching the portfolio knowledge base.
                </span>
                <div className="flex gap-1.5 items-center" aria-hidden="true">
                  <span className="w-2 h-2 rounded-full bg-[var(--ctp-overlay2)] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[var(--ctp-overlay2)] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[var(--ctp-overlay2)] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-[var(--ctp-surface0)] bg-[var(--ctp-mantle)] px-4 py-3">
        {error && (
          <div role="alert" className="mb-2 px-3 py-2 rounded-lg bg-[var(--ctp-base)] border border-[var(--ctp-red)] text-[var(--ctp-red)] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <label htmlFor="aaron-intelligence-message" className="sr-only">
            Ask a question about Aaron
          </label>
          <input
            id="aaron-intelligence-message"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            disabled={isLoading}
            className="flex-1 bg-[var(--ctp-base)] border border-[var(--ctp-surface1)] rounded-xl px-3 py-2.5 pr-12 text-base text-[var(--ctp-text)] placeholder:text-[var(--ctp-subtext1)] caret-[var(--ctp-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ctp-accent)] focus:border-[var(--ctp-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
          />
          <button
            type="submit"
            aria-label="Send question"
            disabled={isLoading || !input.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg border border-[var(--ctp-accent)] transition-colors disabled:shadow-none ${
              input.trim()
                ? 'bg-[var(--ctp-base)] text-[var(--ctp-accent)] shadow-lg'
                : 'bg-[var(--ctp-mantle)] text-[var(--ctp-overlay0)]'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-2 text-xs text-[var(--ctp-subtext1)] text-center">
          Answers come from Aaron's knowledge base and may be inaccurate.
        </p>
      </footer>
    </div>
  )
}

export default Chat
