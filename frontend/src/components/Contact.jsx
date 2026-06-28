import {
  ArrowUpRight,
  FolderGit2,
  Mail,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "aaronarada011@gmail.com",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=aaronarada011%40gmail.com&su=Let%27s%20connect",
  },
  {
    icon: UserRound,
    label: "LinkedIn",
    value: "aaronarada",
    href: "https://www.linkedin.com/in/aaronarada/",
  },
  {
    icon: FolderGit2,
    label: "GitHub",
    value: "AaronArada11",
    href: "https://github.com/AaronArada11",
  },
];

const topics = [
  "Artificial Intelligence",
  "Machine Learning",
  "Full-Stack Development",
  "Automations",
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
          className="mb-6 flex items-center gap-2 font-mono text-sm tracking-widest"
          style={{ color: "var(--ctp-accent)" }}
        >
          <span>$ mail --compose ~/contact</span>
        </p>

        <div
          className="grid gap-4 rounded-lg p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] md:p-6"
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
                  className="font-mono text-xs uppercase tracking-widest"
                  style={{ color: "var(--ctp-subtext0)" }}
                >
                  Open to connect
                </span>
              </div>

              <h2
                className="mb-4 max-w-2xl font-mono leading-tight text-balance"
                style={{
                  color: "var(--ctp-text)",
                  fontSize: "clamp(1.45rem, 3vw, 2.15rem)",
                }}
              >
                Let's build something impactful together.
              </h2>

              <p
                className="max-w-2xl font-mono text-sm leading-relaxed"
                style={{ color: "var(--ctp-subtext1)" }}
              >
                I'm always open to discussing software engineering, AI,
                machine learning, project ideas, and career opportunities.
                Send a note if you want to collaborate or talk through a
                technical challenge.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=aaronarada011%40gmail.com&su=Let%27s%20connect"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-mono text-sm transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "var(--ctp-accent)",
                  color: "#0d1310",
                  outlineColor: "var(--ctp-accent)",
                }}
              >
                Send email
                <Mail size={15} />
              </a>
              <a
                href="https://www.linkedin.com/in/aaronarada/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
              className="rounded-lg p-4"
              style={{
                background: "var(--ctp-base)",
                border: "1px solid var(--ctp-surface0)",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <MapPin size={14} style={{ color: "var(--ctp-accent)" }} />
                <p className="font-mono text-sm" style={{ color: "var(--ctp-text)" }}>
                  Philippines
                </p>
              </div>

              <div className="space-y-3">
                {contactLinks.map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-md p-2 transition-colors"
                    style={{ color: "var(--ctp-subtext1)" }}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: "var(--ctp-surface0)",
                          color: "var(--ctp-accent)",
                        }}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-xs" style={{ color: "var(--ctp-subtext0)" }}>
                          {label}
                        </span>
                        <span className="block truncate font-mono text-sm" style={{ color: "var(--ctp-text)" }}>
                          {value}
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded px-2 py-1 font-mono"
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
