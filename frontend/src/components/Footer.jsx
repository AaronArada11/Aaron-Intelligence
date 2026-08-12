import { User, FolderGit2 } from "lucide-react";
import { profileLinks } from "../profileLinks";

export function Footer() {
  return (
    <footer
      className="site-footer"
      style={{ background: "var(--ctp-base)" }}
    >
      <div className="site-footer__bar">
        <div className="site-footer__identity">
          <span className="site-footer__path">~/</span>
          <span className="site-footer__copyright">© 2026 Aaron Arada</span>
        </div>

        <nav className="site-footer__links" aria-label="Social links">
          {[
             { icon: FolderGit2, ...profileLinks.github },
             { icon: User, ...profileLinks.linkedin },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Aaron Arada on ${label}`}
              className="site-footer__link"
            >
              <Icon size={15} />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
