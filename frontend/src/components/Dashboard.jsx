import { useState } from "react";
import { MousePointer2, MapPin, GitCommit, Calendar, ExternalLink, Palette } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

const recentCommits = [
  { repo: "anubis", message: "feat: optimize NEON engine PoW validation", time: "2h ago", hash: "a3f9c12" },
  { repo: "xess", message: "chore: update Rust crate CI pipeline", time: "5h ago", hash: "b7e4d89" },
  { repo: "abacus", message: "fix: redis connection pool timeout handling", time: "1d ago", hash: "c2a8f56" },
  { repo: "jasoncameron.dev", message: "style: update theme tokens", time: "2d ago", hash: "d1b3e70" },
  { repo: "anubis", message: "docs: add deployment guide for nginx", time: "3d ago", hash: "e9f2c44" },
];

const langBreakdown = [
  { lang: "Rust",       pct: 41, color: "#fab387" },
  { lang: "Python",     pct: 16, color: "#89b4fa" },
  { lang: "Go",         pct: 15, color: "#94e2d5" },
  { lang: "Swift",      pct: 8,  color: "#f38ba8" },
  { lang: "TypeScript", pct: 6,  color: "#cba6f7" },
  { lang: "Other",      pct: 14, color: "#585b70" },
];

const posts = [
  { title: "How Anubis defends against AI scrapers",    date: "2026-05-14" },
  { title: "Building a PoW bot defense system in Go",   date: "2026-03-28" },
  { title: "Catppuccin theming for your terminal",      date: "2025-12-10" },
  { title: "Redis for scalable page view counters",     date: "2025-09-22" },
  { title: "Practical Rust in production systems",      date: "2025-07-04" },
];

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{ background: "var(--ctp-mantle)", border: "1px solid var(--ctp-surface0)" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      className="font-mono uppercase tracking-widest"
      style={{ fontSize: "0.65rem", color: "var(--ctp-accent)" }}
    >
      {children}
    </p>
  );
}

export function Dashboard() {
  const [clicks, setClicks] = useState(4218);

  return (
    <section style={{ background: "var(--ctp-base)" }} className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-xs mb-6 uppercase tracking-widest" style={{ color: "var(--ctp-accent)" }}>
          $ cat ~/dashboard.json
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Theme */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette  size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>Theme</SectionLabel>
            </div>

            <ThemeSelector />
          </Card>

          {/* Let's Connect */}
          <Card>
            
          </Card>

          {/* Location */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={13} style={{ color: "var(--ctp-red)" }} />
              <SectionLabel>Location</SectionLabel>
            </div>
            <div
              className="rounded-lg overflow-hidden relative"
              style={{ height: "7rem", background: "var(--ctp-surface0)" }}
            >
              <svg viewBox="0 0 300 140" className="w-full h-full" style={{ opacity: 0.35 }}>
                <path
                  d="M40,20 Q80,10 140,15 Q200,20 240,40 Q260,60 250,90 Q240,120 200,130 Q160,140 120,135 Q80,130 50,110 Q20,90 25,60 Z"
                  fill="var(--ctp-surface1)" stroke="var(--ctp-surface2)" strokeWidth="1"
                />
                <ellipse cx="150" cy="68" rx="10" ry="4" fill="var(--ctp-sapphire)" opacity="0.5" />
                <ellipse cx="136" cy="72" rx="6" ry="3" fill="var(--ctp-sapphire)" opacity="0.4" />
              </svg>
              <div className="absolute" style={{ left: "50%", top: "42%", transform: "translate(-50%,-50%)" }}>
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--ctp-red)" }} />
              </div>
              <div className="absolute bottom-2 left-2">
                <span
                  className="font-mono rounded px-2 py-0.5"
                  style={{ fontSize: "0.65rem", background: "var(--ctp-mantle)", color: "var(--ctp-subtext0)" }}
                >
                  Manila, PH
                </span>
              </div>
            </div>
          </Card>

          

          {/* Recent Commits */}
          <Card className="md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <GitCommit size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>Recent Commits</SectionLabel>
            </div>
            <div className="space-y-3">
              

            </div>
          </Card>

          {/* Latest Posts */}
          <Card id="posts">
            <SectionLabel>Latest Posts</SectionLabel>
            <div className="space-y-3">
              {posts.map((p) => (
                <a key={p.title} href="#" className="block group">
                  <p
                    className="font-mono leading-snug group-hover:opacity-70 transition-opacity"
                    style={{ fontSize: "0.75rem", color: "var(--ctp-text)" }}
                  >
                    {p.title}
                  </p>
                  <p className="font-mono" style={{ fontSize: "0.7rem", color: "var(--ctp-subtext0)" }}>{p.date}</p>
                </a>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
