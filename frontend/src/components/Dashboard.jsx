import { useState } from "react";
import { MousePointer2, MapPin, GitCommit, Calendar, ExternalLink, Palette, ChartNoAxesColumnIncreasing } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { SortingVisualizer } from "./SortingVisualizer"



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
