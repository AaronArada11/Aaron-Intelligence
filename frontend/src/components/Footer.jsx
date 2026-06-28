import { User, FolderGit2 } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="scroll-parallax scroll-parallax-soft py-10 px-6"
      style={{ background: "var(--ctp-crust)", borderTop: "1px solid var(--ctp-surface0)" }}
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm" style={{ color: "var(--ctp-subtext0)" }}>~/</span>
            <span className="font-mono text-sm" style={{ color: "var(--ctp-subtext0)" }}>© 2026 Aaron Arada</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono rounded px-2 py-0.5"
              style={{ fontSize: "0.7rem", background: "var(--ctp-surface0)", color: "var(--ctp-subtext0)" }}
            >
              views: <span style={{ color: "var(--ctp-green)" }}>(in development)</span>
            </span>
          </div>

        </div>

        <div className="flex gap-3">
          {[
             { icon: FolderGit2, href: "https://github.com/AaronArada11", label: "GitHub"   },
             { icon: User,   href: "https://www.linkedin.com/in/aaronarada/", label: "LinkedIn" },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "var(--ctp-subtext1)", background: "var(--ctp-surface0)" }}
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
