import { useState } from "react";
import { Menu, X, Palette } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { TextType }from './TextType';

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "More...", href: "#" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ background: "var(--ctp-mantle)", borderBottom: "1px solid var(--ctp-surface0)" }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 font-mono text-sm" style={{ color: "var(--ctp-text)" }}>
          ~/
          <TextType
            texts={[""]}
            typingSpeed={20}
            deletingSpeed={15}
            pauseDuration={1500}
            showCursor
            cursorCharacter="▎"
            cursorBlinkDuration={1}
            loop
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-sm transition-colors"
              style={{ color: "var(--ctp-subtext0)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ctp-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ctp-subtext0)")}
            >
              {l.label}
            </a>
          ))}

          {/* Theme toggle button */}
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="flex items-center gap-1.5 font-mono text-sm px-3 py-1 rounded transition-colors"
            style={{
              background: themeOpen ? "var(--ctp-surface1)" : "var(--ctp-surface0)",
              color: "var(--ctp-accent)",
              border: "1px solid var(--ctp-surface1)",
            }}
          >
            <Palette size={13} />
            Theme
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--ctp-accent)" }} />
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" style={{ color: "var(--ctp-subtext0)" }} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Theme panel */}
      {themeOpen && (
        <div
          className="border-t"
          style={{ background: "var(--ctp-base)", borderColor: "var(--ctp-surface0)" }}
        >
          <div className="max-w-4xl mx-auto px-6 py-5">
            <ThemeSelector />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ background: "var(--ctp-base)", borderColor: "var(--ctp-surface0)" }}
        >
          <div className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-mono text-sm py-1"
                style={{ color: "var(--ctp-subtext1)" }}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => { setThemeOpen(!themeOpen); setMobileOpen(false); }}
              className="flex items-center gap-2 font-mono text-sm py-1 text-left"
              style={{ color: "var(--ctp-accent)" }}
            >
              <Palette size={13} /> Theme
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
