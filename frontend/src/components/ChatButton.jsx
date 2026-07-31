import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ChatButton({ onClick, isOpen = false, embedded = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Collapse chat" : "Open chat"}
      aria-expanded={isOpen}
      aria-controls="aaron-intelligence-chat"
      style={{
        backgroundColor: "var(--ctp-base)",
      }}
      className={`flex items-center justify-between border border-[var(--ctp-surface0)] px-5 py-4 text-left text-white transition-colors hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-mantle)] ${
        embedded
          ? "w-full border-x-0 border-t-0"
          : "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] rounded-xl shadow-2xl sm:bottom-6 sm:right-6 sm:w-[420px]"
      }`}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-sans text-xs text-[var(--ctp-subtext1)]">
          Chat with
        </span>
        <span className="flex min-w-0 items-center gap-2 font-sans text-base font-medium">
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--ctp-green)]"
            aria-hidden="true"
          />
          <span className="truncate">Aaron Intelligence</span>
        </span>
      </span>

      {isOpen ? (
        <ChevronUp className="h-5 w-5 flex-shrink-0 text-[var(--ctp-subtext0)]" />
      ) : (
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-[var(--ctp-subtext0)]" />
      )}
    </button>
  )
}
