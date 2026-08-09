import { User, FolderGit2, Mail, MapPin, FileDown, Terminal } from "lucide-react";
import { profileLinks } from "../profileLinks";

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
    <section
      id="about"
      style={{ background: "var(--ctp-base)" }}
      className="px-6 py-14 sm:px-8 sm:py-18 lg:py-20"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="space-y-5">
          <h1
            className="scroll-parallax scroll-parallax-soft font-sans font-bold leading-tight text-balance"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--ctp-text)" }}
          >
            Hi! I'm{" "}
            <span style={{ color: "var(--ctp-accent)" }}>Aaron Arada</span>
          </h1>

          <p
            className="scroll-parallax scroll-parallax-soft max-w-2xl font-sans leading-relaxed text-pretty"
            style={{ fontSize: "1rem", color: "var(--ctp-text)", lineHeight: "1.75" }}
          >
            I'm a 3rd year computer science student at{" "}
            <GoldLink href="https://www.feutech.edu.ph/">FEUTECH</GoldLink>, focused on AI systems and full-stack development. I build practical tools that make complex ideas easier to understand and use.
          </p>
        </div>

        <div className="scroll-parallax scroll-parallax-soft flex flex-wrap items-center gap-3 font-sans" style={{ fontSize: "0.85rem" }}>
          <span
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-sans text-sm font-medium text-[var(--ctp-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-accent)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              outlineColor: "var(--ctp-accent)",
            }}
          >
            <MapPin size={14} />
            <span>Manila, PH</span>
          </span>

          <a
            href="/Aaron-Arada-Resume.pdf"
            download
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-sans text-sm font-medium text-[var(--ctp-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-accent)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              outlineColor: "var(--ctp-accent)",
            }}
          >
            <FileDown size={14} />
            Download resume
          </a>
        </div>

        <div className="scroll-parallax scroll-parallax-card flex flex-wrap items-center gap-x-3 gap-y-3 font-sans" style={{ fontSize: "0.85rem" }}>
          {[
            { icon: <FolderGit2 size={14} />, ...profileLinks.github },
            { icon: <User size={14} />, ...profileLinks.linkedin },
            { icon: <Mail size={14} />, ...profileLinks.email },
          ].map((item, i) => (
            <span key={item.label} className="flex items-center gap-3">
              {i > 0 && (
                <span className="hidden sm:inline-block" style={{ color: "var(--ctp-surface2)" }}>|</span>
              )}
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="inline-flex min-h-11 items-center gap-1.5 transition-opacity hover:opacity-70"
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
              href="/about"
              className="inline-flex min-h-11 items-center transition-opacity hover:opacity-70"
              style={{ color: "var(--ctp-subtext1)" }}
            >
              Learn more about me →
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
