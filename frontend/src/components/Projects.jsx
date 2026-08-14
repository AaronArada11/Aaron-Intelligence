import { ExternalLink, FolderGit2 } from "lucide-react";
import { projects } from "../projectsData";

const FEATURED_PROJECTS = projects.slice(0, 2);
const PROJECT_IMAGE_SIZES =
  "(max-width: 699px) calc(100vw - 3rem), (max-width: 1024px) calc(50vw - 3.5rem), 28rem";

function FeaturedProjectCard({ project, index }) {
  return (
    <div
      className="homepage-project-card__parallax scroll-parallax scroll-parallax-card"
      style={{
        "--parallax-distance": index === 0 ? "44px" : "62px",
        "--parallax-end": index === 0 ? "-10px" : "-16px",
      }}
    >
      <article
        className="homepage-project-card"
        style={{ "--project-accent": project.previewColor }}
      >
        <div className="homepage-project-card__windowbar">
          <div className="homepage-project-card__traffic-lights" aria-hidden="true">
            <span className="homepage-project-card__traffic-light homepage-project-card__traffic-light--close" />
            <span className="homepage-project-card__traffic-light homepage-project-card__traffic-light--minimize" />
            <span className="homepage-project-card__traffic-light homepage-project-card__traffic-light--maximize" />
          </div>
          <span className="homepage-project-card__window-path">
             
          </span>
          <span className="homepage-project-card__year">{project.year}</span>
        </div>

        <div className="homepage-project-card__preview">
          <picture>
            <source
              type="image/avif"
              srcSet={project.imageAvifSrcSet}
              sizes={PROJECT_IMAGE_SIZES}
            />
            <img
              src={project.image}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              className={`homepage-project-card__image homepage-project-card__image--${project.imageFit ?? "cover"}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
            />
          </picture>
        </div>

        <div className="homepage-project-card__body">
          <div className="homepage-project-card__heading">
            <h3>{project.name}</h3>
            <p>{project.shortDescription}</p>
          </div>

          <div className="homepage-project-card__tags" aria-label={`${project.name} technology stack`}>
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="homepage-project-card__links">
            {project.liveDemo && (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.name} live demo`}
                className="homepage-project-card__link homepage-project-card__link--primary"
              >
                Live demo
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.name} source code on GitHub`}
              className="homepage-project-card__link"
            >
              Source
              <FolderGit2 size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export function Projects() {
  return (
    <section
      id="projects"
      className="homepage-projects px-6 py-16"
      style={{ background: "var(--ctp-base)" }}
    >
      <div className="homepage-projects__inner mx-auto max-w-6xl">
        <div className="scroll-parallax scroll-parallax-soft mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1
            className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--ctp-text)" }}
          >
            Projects
          </h1>
          <a
            href="/projects"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--ctp-subtext1)" }}
          >
            View all projects →
          </a>
        </div>

        <div className="homepage-projects__grid">
          {FEATURED_PROJECTS.map((project, index) => (
            <FeaturedProjectCard
              key={project.name}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
