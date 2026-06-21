import { useState } from "react";
import { MousePointer2, MapPin, GitCommit, Calendar, ExternalLink, Palette, ChartNoAxesColumnIncreasing } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { SortingVisualizer } from "./SortingVisualizer"

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

          {/* Recent Commits */}
          <Card className="md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <GitCommit size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>Recent Commits</SectionLabel>
            </div>
            <div className="space-y-3">
              

            </div>
          </Card>

          {/* AlgoVisualizer */}
          <Card className="md:col-span-4">
            <div className="flex items-center gap-2 mb-1">
              <ChartNoAxesColumnIncreasing size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>AlgoVisualizer</SectionLabel>
            </div>
            <div className="space-y-3">
              <SortingVisualizer />

            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
