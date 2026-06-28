import { User, Globe, FolderGit2, Mail, MapPin } from "lucide-react";

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
          className="font-mono mb-6 leading-tight"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--ctp-text)" }}
        >
          Hi! I'm{" "}
          <span style={{ color: "var(--ctp-accent)" }}>Aaron Arada</span>
        </h1>

        {/* Body */}
        <p
          className="font-mono leading-relaxed mb-8 max-w-xl"
          style={{ fontSize: "0.92rem", color: "var(--ctp-text)", lineHeight: "1.8" }}
        >
          I'm a Computer Science Student @{" "}
          <GoldLink href="https://www.feutech.edu.ph/">FEUTECH</GoldLink>. I enjoy developing AI-powered applications, experimenting with emerging technologies, and transforming ideas into practical solutions that create meaningful impact.
          
        </p>

        <div className="flex flex-wrap items-center mb-12 font-mono" style={{ fontSize: "0.85rem" }}>
          <MapPin size ={14} className="mr-2"/> <p>Manila, PH</p>
        </div>

        {/* Social links */}
        <div className="flex flex-wrap items-center mb-12 font-mono" style={{ fontSize: "0.85rem" }}>
          {[
            { icon: <FolderGit2 size={14} />, label: "GitHub", href: "https://github.com/AaronArada11" },
            { icon: <User size={14} />, label: "LinkedIn", href: "https://www.linkedin.com/in/aaronarada/" },
            {icon: <Mail size={14} />, label: "Email",href: "mailto:aaronarada011@gmail.com" }
          ].map((item, i) => (
            <span key={item.label} className="flex items-center">
              {i > 0 && (
                <span className="mx-3" style={{ color: "var(--ctp-surface2)" }}>|</span>
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
          <span className="mx-3" style={{ color: "var(--ctp-surface2)" }}>|</span>
        </div>
      </div>
    </section>
  );
}
