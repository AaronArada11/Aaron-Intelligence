import { ExternalLink, FolderGit2, Shield, BarChart2 } from "lucide-react";

const projects = [
  {
    name: "Anubis",
    description:
      "HTTP proof-of-work bot defense tool. Protects web services from scrapers and bots using client-side proof-of-work challenges.",
    tags: ["Go", "HTTP", "Security", "Bot Defense"],
    accentColor: "#f9e2af",
    icon: Shield,
    github: "https://github.com/TecharoHQ/anubis",
  },
  {
    name: "Abacus",
    description:
      "Scalable Golang/Redis page-view counter. Powers the view counter on this very site with minimal overhead.",
    tags: ["Go", "Redis", "Scalable", "Analytics"],
    accentColor: "#89b4fa",
    icon: BarChart2,
    github: "https://github.com/jasoncameron/abacus",
  },
];

export function Projects() {
  return (
    <section
      id="projects"
      className="py-16 px-6"
      style={{ background: "var(--ctp-mantle)", borderTop: "1px solid var(--ctp-surface0)" }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-xs mb-6 uppercase tracking-widest" style={{ color: "var(--ctp-accent)" }}>
          $ ls ~/projects
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="rounded-lg p-6 group hover:scale-[1.01] transition-transform"
                style={{ background: "var(--ctp-base)", border: "1px solid var(--ctp-surface0)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: `${p.accentColor}18`, color: p.accentColor }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="font-mono" style={{ color: "var(--ctp-text)" }}>{p.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--ctp-subtext0)" }}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <FolderGit2 size={15} />
                    </a>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--ctp-subtext0)" }}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>

                <p
                  className="font-mono text-sm leading-relaxed mb-4"
                  style={{ color: "var(--ctp-subtext1)" }}
                >
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono rounded px-2 py-0.5"
                      style={{
                        fontSize: "0.7rem",
                        background: "var(--ctp-surface0)",
                        color: p.accentColor,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
