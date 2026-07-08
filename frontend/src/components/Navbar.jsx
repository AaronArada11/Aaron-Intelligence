import { useState } from "react";
import { Menu, X, Terminal } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";


const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMobileMenu = () => {
    if (mobileOpen) {
      setSidebarOpen(false);
    }

    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "var(--ctp-mantle)",
          borderBottom: "1px solid var(--ctp-surface0)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-1.5 font-mono text-sm"
            style={{ color: "var(--ctp-text)" }}
          >
            ~/
            <span 
            className="animate-pulse"
            style={{ animationDuration: "0.1"}}
            >▎</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-sm transition-colors"
                style={{ color: "var(--ctp-subtext0)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--ctp-text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--ctp-subtext0)")
                }
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => setSidebarOpen(true)}
              className="font-mono text-sm transition-colors"
              style={{ color: "var(--ctp-subtext0)" }}
            >
              More...
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            style={{ color: "var(--ctp-subtext0)" }}
            onClick={toggleMobileMenu}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t"
            style={{
              background: "var(--ctp-base)",
              borderColor: "var(--ctp-surface0)",
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-sm py-1"
                  style={{ color: "var(--ctp-subtext1)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <button
                onClick={() => {
                  setSidebarOpen(true);
                  setMobileOpen(false);
                }}
                className="font-mono text-sm py-1 text-left"
                style={{ color: "var(--ctp-accent)" }}
              >
                More...
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed top-0 right-0 h-screen w-80 z-50 border-l p-6 overflow-y-auto"
            style={{
              background: "var(--ctp-base)",
              borderColor: "var(--ctp-surface0)",
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <span
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--ctp-accent)",
                }}
              >
                Settings
              </span>

              <button
                onClick={() => setSidebarOpen(false)}
                style={{ color: "var(--ctp-subtext0)" }}
              >
                <X size={18} />
              </button>
            </div>

            <ThemeSelector />
            <a
              href="https://terminal-aaron.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-mono text-sm text-[var(--ctp-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-accent)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                outlineColor: "var(--ctp-accent)",
              }}
            >
              <Terminal size={14} />
              Terminal
            </a>
          </div>
        </>
      )}
    </>
  );
}
