import { Bot, ChevronDown, ChevronUp } from 'lucide-react'

export default function ChatButton({ onClick, isOpen = false, embedded = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Collapse Aaron Intelligence" : "Open Aaron Intelligence"}
      aria-expanded={isOpen}
      aria-controls="aaron-intelligence-chat"
      style={{
        backgroundColor: "var(--ctp-base)",
      }}
      className={`flex items-center border border-[var(--ctp-surface0)] text-[var(--ctp-text)] transition-colors hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-mantle)] ${
        embedded
          ? "w-full justify-between border-x-0 border-t-0 px-5 py-4 text-left"
          : "fixed right-4 bottom-4 z-50 size-14 justify-center rounded-full p-0 shadow-2xl sm:right-6 sm:bottom-6 sm:h-auto sm:w-80 sm:justify-between sm:rounded-xl sm:px-5 sm:py-4 sm:text-left"
      }`}
    >
      {embedded ? null : (
        <Bot className="size-5 sm:hidden" aria-hidden="true" />
      )}

      <span className={`${embedded ? "flex" : "hidden sm:flex"} min-w-0 flex-col gap-1`}>
        <span className="font-sans text-xs text-[var(--ctp-subtext1)]">
          Chat with
        </span>
        <span className="flex min-w-0 items-center gap-2 font-sans text-base font-medium">
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--ctp-green)] animate-pulse"
            style={{ animationDuration: "1s"}}
            aria-hidden="true"
          />
          <span className="truncate">Aaron Intelligence</span>
        </span>
      </span>

      {isOpen ? (
        <ChevronUp className={`${embedded ? "" : "hidden sm:block"} size-5 flex-shrink-0 text-[var(--ctp-subtext0)]`} />
      ) : (
        <ChevronDown className={`${embedded ? "" : "hidden sm:block"} size-5 flex-shrink-0 text-[var(--ctp-subtext0)]`} />
      )}
    </button>
  )
}
