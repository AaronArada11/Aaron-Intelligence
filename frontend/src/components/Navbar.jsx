import { useEffect, useState } from "react";
import { Menu, X, Terminal } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";


const navLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const promptPath =
    currentPath === "/about"
      ? "~/about/"
      : currentPath === "/projects"
        ? "~/projects/"
        : "~/";

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);

    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const toggleMobileMenu = () => {
    if (mobileOpen) {
      setSidebarOpen(false);
    }

    setMobileOpen((isOpen) => !isOpen);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "color-mix(in srgb, var(--ctp-mantle) 70%, transparent)",
          borderBottom:
            "1px solid color-mix(in srgb, var(--ctp-surface0) 70%, transparent)",
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-1.5 font-mono text-sm"
            style={{ color: "var(--ctp-text)" }}
          >
            {promptPath}
            <span 
            className="animate-pulse"
            style={{ animationDuration: "0.8s"}}
            >▎</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-sm font-medium transition-colors"
                aria-current={currentPath === link.href ? "page" : undefined}
                style={{
                  color:
                    currentPath === link.href
                      ? "var(--ctp-accent)"
                      : "var(--ctp-subtext0)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--ctp-text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    currentPath === link.href
                      ? "var(--ctp-accent)"
                      : "var(--ctp-subtext0)")
                }
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => setSidebarOpen(true)}
              className="font-sans text-sm font-medium transition-colors"
              style={{ color: "var(--ctp-subtext0)" }}
            >
              Customize
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            style={{ color: "var(--ctp-subtext0)" }}
            onClick={toggleMobileMenu}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden border-t"
            style={{
              background: "transparent",
              borderColor: "var(--ctp-surface0)",
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-sans text-sm font-medium py-1"
                  aria-current={currentPath === link.href ? "page" : undefined}
                  style={{
                    color:
                      currentPath === link.href
                        ? "var(--ctp-accent)"
                        : "var(--ctp-subtext1)",
                  }}
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
                className="font-sans text-sm font-medium py-1 text-left"
                style={{ color: "var(--ctp-accent)" }}
              >
                Customize
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close portfolio customization"
          />

          {/* Panel */}
          <div
            className="fixed top-0 right-0 h-screen w-80 z-50 border-l p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Customize portfolio appearance"
            style={{
              background: "var(--ctp-base)",
              borderColor: "var(--ctp-surface0)",
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <span
                className="font-sans font-semibold uppercase tracking-widest"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--ctp-accent)",
                }}
              >
                Customize portfolio
              </span>

              <button
                onClick={() => setSidebarOpen(false)}
                style={{ color: "var(--ctp-subtext0)" }}
                aria-label="Close portfolio customization"
              >
                <X size={18} />
              </button>
            </div>

            <ThemeSelector />
            <a
              href="https://terminal-aaron.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-sans text-sm font-medium text-[var(--ctp-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-accent)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                outlineColor: "var(--ctp-accent)",
              }}
            >
              <Terminal size={14} />
              Open terminal
            </a>
          </div>
        </>
      )}
    </>
  );
}
