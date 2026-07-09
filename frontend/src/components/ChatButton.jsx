import { MessageCircle, X } from 'lucide-react'

export default function ChatButton({ onClick, isOpen }) {
  return (
      <button
        onClick={onClick}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{ 
          backgroundColor: "var(--ctp-base)",
          border: "2px solid var(--ctp-accent)"
         }}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 sm:shadow-2xl"
      >
      {isOpen ? (
        <X size={24} color="var(--ctp-accent)" />
      ) : (
        <MessageCircle size={24} color="var(--ctp-accent)" />
      )}
    </button>
  )
}
