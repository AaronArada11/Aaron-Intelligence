import LogoLoop from "./LogoLoop/LogoLoop";
import { techLogos } from "../techLogos";

function SkillCategoryCard({ category, index }) {
  return (
    <div
      className="homepage-skills-card__parallax scroll-parallax scroll-parallax-card"
      style={{
        "--skill-accent": category.accent,
        "--parallax-distance": index % 2 === 0 ? "36px" : "48px",
        "--parallax-end": index % 2 === 0 ? "-8px" : "-12px",
      }}
    >
    </div>
  );
}

export function Skills() {
  return (
    <section
      id="skills"
      className="homepage-skills px-6 py-16"
      style={{ background: "var(--ctp-base)" }}
    >
      <div className="homepage-skills__inner mx-auto max-w-6xl">
        <div className="scroll-parallax scroll-parallax-soft mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2
            className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--ctp-text)" }}
          >
            Skills
          </h2>
        </div>

        <div className="homepage-skills-loop scroll-parallax scroll-parallax-soft">
          <LogoLoop
            logos={techLogos}
            speed={90}
            direction="left"
            logoHeight={40}
            gap={48}
            hoverSpeed={20}
            scaleOnHover
            fadeOut
            fadeOutColor="var(--ctp-base)"
            ariaLabel="Technologies Aaron works with"
            className="homepage-skills-loop__marquee"
          />
        </div>
      </div>
    </section>
  );
}
