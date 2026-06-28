import { User, FolderGit2, Mail, MapPin, FileDown, Terminal } from "lucide-react";

function GoldLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "var(--ctp-accent)", textDecoration: "underline", textDecorationColor: "var(--ctp-accent)" }}
    >
      {children}
    </a>
  );
}



export function Hero() {
  return (
    <section style={{ background: "var(--ctp-base)" }} className="px-6 pt-20 ">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <h1
          className="scroll-parallax scroll-parallax-soft font-mono mb-6 leading-tight"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--ctp-text)" }}
        >
          Hi! I'm{" "}
          <span style={{ color: "var(--ctp-accent)" }}>Aaron Arada</span>
        </h1>

        {/* Body */}
        <p
          className="scroll-parallax scroll-parallax-soft font-mono leading-relaxed mb-8 max-w-xl"
          style={{ fontSize: "0.92rem", color: "var(--ctp-text)", lineHeight: "1.8" }}
        >
          I'm a Computer Science Student @{" "}
          <GoldLink href="https://www.feutech.edu.ph/">FEUTECH</GoldLink>. I enjoy developing AI-powered applications, experimenting with emerging technologies, and transforming ideas into practical solutions that create meaningful impact.
          
        </p>

        <div className="scroll-parallax scroll-parallax-soft mb-12 flex flex-wrap items-center gap-3 font-mono" style={{ fontSize: "0.85rem" }}>
          <span className="flex items-center gap-2">
            <MapPin size={14} />
            <span>Manila, PH</span>
          </span>
          <a
            href="https://terminal-aaron.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-3 py-1.5 font-mono text-sm text-[var(--ctp-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-accent)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              outlineColor: "var(--ctp-accent)",
            }}
          >
            <Terminal size={14} />
            Terminal
          </a>
        </div>

        {/* Social links */}
        <div className="scroll-parallax scroll-parallax-card mb-12 flex flex-wrap items-center gap-x-3 gap-y-3 font-mono" style={{ fontSize: "0.85rem" }}>
          {[
            { icon: <FolderGit2 size={14} />, label: "GitHub", href: "https://github.com/AaronArada11" },
            { icon: <User size={14} />, label: "LinkedIn", href: "https://www.linkedin.com/in/aaronarada/" },
            {icon: <Mail size={14} />, label: "Email",href: "https://mail.google.com/mail/?view=cm&fs=1&to=aaronarada011%40gmail.com&su=Let%27s%20connect" }
          ].map((item, i) => (
            <span key={item.label} className="flex items-center">
              {i > 0 && (
                <span className="mx-1 hidden sm:inline-block" style={{ color: "var(--ctp-surface2)" }}>|</span>
              )}
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--ctp-subtext1)" }}
              >
                {item.icon}
                {item.label}
              </a>
            </span>
          ))}
          <span className="flex basis-full items-center gap-3 sm:basis-auto">
            <span className="hidden sm:inline-block" style={{ color: "var(--ctp-surface2)" }}>|</span>
            <a
              href="/Aaron-Arada-Resume.pdf"
              download
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-mono text-sm text-[var(--ctp-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-accent)] hover:shadow-[0_4px_0_var(--ctp-surface0)] active:translate-y-0 active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                outlineColor: "var(--ctp-accent)",
              }}
            >
              <FileDown size={14} />
              Resume
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
