import { MessageCircle, X } from 'lucide-react'

export default function ChatButton({ onClick, isOpen }) {
  return (
      <button
        onClick={onClick}
        style={{ 
          backgroundColor: "var(--ctp-base)",
          border: "2px solid var(--ctp-accent)"
         }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
      {isOpen ? (
        <X size={24} color="var(--ctp-accent)" />
      ) : (
        <MessageCircle size={24} color="var(--ctp-accent)" />
      )}
    </button>
  )
}
