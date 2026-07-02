import { ExternalLink, FolderGit2, Bot, BarChart2, MirrorRectangular, Languages } from "lucide-react";

const projects = [
    {
    name: "KUMPAS",
    description:
      "Machine learning-powered Filipino Sign Language recognition and translation system that uses webcam input to recognize FSL gestures and translate them into readable text across multiple Philippine languages. Built during ACM TechSprint: Asteria 2026.",
    tags: ["React", "Vite", "TensorFlow", "MediaPipe", "OpenCV", "Railway", "Vercel"],
    accentColor: "var(--ctp-accent)",
    icon: Languages,
    github: "https://github.com/Praybeyt-Benjamin-Techsprint/Kumpas",
    liveDemo: "https://kumpas-translator.vercel.app/",
  },
  {
    name: "Aaron Intelligence",
    description:
      "Personalized AI portfolio chatbot that answers questions about my projects, skills, education, and experience using a RAG-powered knowledge base.",
    tags: ["Gemini", "React", "Supabase", "FastAPI"],
    accentColor: "var(--ctp-accent)",
    icon: Bot,
    github: "https://github.com/AaronArada11/Aaron-Intelligence",
  },
  {
    name: "AlgoVisualizer",
    description:
      "Interactive algorithm visualization platform designed to help students and developers understand fundamental computer science concepts through real-time animations and visual feedback.",
    tags: ["JavaScript", "TypeScript", "React"],
    accentColor: "var(--ctp-accent)",
    icon: BarChart2,
    github: "https://github.com/AaronArada11/AlgoVisualizer",
  },
  {
    name: "Mirror Mentor",
    description:
      "AI-powered educational platform that helps students improve programming skills through guided Socratic questioning instead of direct answers. Built during ACM Developers Week",
    tags: ["Gemini", "Supabase", "FastAPI", "Vercel"],
    accentColor: "var(--ctp-accent)",
    icon: MirrorRectangular,
    github: "https://github.com/Goodness-Gracious-GG/demo",
  },
];

export function Projects() {
  return (
    <section
      id="projects"
      className="py-16 px-6"
      style={{ background: "var(--ctp-base)" }}
    >
      <div className="max-w-4xl mx-auto ">
        <p
          className="scroll-parallax scroll-parallax-soft font-mono text-sm mb-6 tracking-widest flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ color: "var(--ctp-accent)" }}
        >
          <span>$ ls ~/projects</span>
          <a
            href="#projects"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--ctp-subtext1)" }}
          >
            More projects →
          </a>
        </p>

        <div className="grid items-stretch gap-4 md:grid-cols-2 md:auto-rows-fr">
          {projects.map((p, index) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="scroll-parallax scroll-parallax-card h-full"
                style={{
                  "--parallax-distance": index % 2 === 0 ? "44px" : "62px",
                  "--parallax-end": index % 2 === 0 ? "-10px" : "-16px",
                }}
              >
                <div
                  className="group flex h-full min-h-[18rem] flex-col rounded-lg p-5 transition-transform hover:scale-[1.01]"
                  style={{ background: "var(--ctp-base)", border: "1px solid var(--ctp-surface0)" }}
                  onMouseEnter={(e) => e.currentTarget.style.outline = "1px solid var(--ctp-accent)"}
                  onMouseLeave={(e) => e.currentTarget.style.outline = "none"}
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
                      {p.liveDemo && (
                        <a
                          href={p.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--ctp-subtext0)" }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>

                  <p
                    className="mb-4 flex-1 font-mono text-sm leading-relaxed"
                    style={{ color: "var(--ctp-subtext1)" }}
                  >
                    {p.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2">
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
