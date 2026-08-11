import {
  ArrowUpRight,
  CalendarDays,
  Mail,
  MessageCircle,
} from "lucide-react";
import { profileLinks } from "../profileLinks";

const topics = [
  "Artificial Intelligence",
  "Machine Learning",
  "Full-Stack Development",
  "Automation",
];

export function Contact() {
  return (
    <section
      id="contact"
      className="px-6 py-16"
      style={{ background: "var(--ctp-base)" }}
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="scroll-parallax scroll-parallax-soft mb-6 flex items-center gap-2 font-mono text-sm tracking-widest"
          style={{ color: "var(--ctp-accent)" }}
        >
          <span>$ mail --compose ~/contact</span>
        </p>

        <div
          className="scroll-parallax scroll-parallax-deep grid gap-4 rounded-lg p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] md:p-6"
          style={{
            background: "var(--ctp-mantle)",
            border: "1px solid var(--ctp-surface0)",
          }}
        >
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={14} style={{ color: "var(--ctp-accent)"}}/>
                <span
                  className="font-sans text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--ctp-subtext0)" }}
                >
                  Open to opportunities
                </span>
              </div>

              <h2
                className="mb-4 max-w-2xl font-sans font-bold leading-tight text-balance"
                style={{
                  color: "var(--ctp-text)",
                  fontSize: "clamp(1.45rem, 3vw, 2.15rem)",
                }}
              >
                Have a project or role in mind?
              </h2>

              <p
                className="max-w-2xl font-sans text-base leading-relaxed"
                style={{ color: "var(--ctp-subtext1)" }}
              >
                I'm open to software engineering roles, collaborations on AI
                projects, and conversations about technical work. Tell me what
                you're working on and where I could help.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={profileLinks.email.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "var(--ctp-accent)",
                  color: "#0d1310",
                  outlineColor: "var(--ctp-accent)",
                }}
              >
                Email Aaron
                <Mail size={15} />
              </a>
              <a
                href={profileLinks.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  border: "1px solid var(--ctp-surface1)",
                  color: "var(--ctp-text)",
                  outlineColor: "var(--ctp-accent)",
                }}
              >
                View LinkedIn
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--ctp-mantle)",
                border: "1px solid var(--ctp-surface0)",
              }}
            >
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays size={13} style={{ color: "var(--ctp-accent)" }} />
                <h3 className="font-mono text-sm font-semibold" style={{ color: "var(--ctp-text)" }}>
                  Let's Connect
                </h3>
              </div>

              <p className="max-w-[14rem] font-mono text-sm leading-relaxed" style={{ color: "var(--ctp-subtext1)" }}>
                Always open to interesting projects and conversations.
              </p>

              <a
                href="https://cal.com/aaronarada/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-mono text-sm font-semibold transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "var(--ctp-accent)",
                  color: "#0d1310",
                  outlineColor: "var(--ctp-accent)",
                }}
              >
                <CalendarDays size={14} />
                Book a Chat
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded px-2 py-1 font-sans font-medium"
                  style={{
                    background: "var(--ctp-surface0)",
                    color: "var(--ctp-accent)",
                    fontSize: "0.7rem",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
