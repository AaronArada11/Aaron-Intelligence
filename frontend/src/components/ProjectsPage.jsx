import { useEffect } from "react";
import {
  ExternalLink,
  FolderGit2,
} from "lucide-react";
import { projects } from "../projectsData";

function ProjectPreview({ project, priority }) {
  return (
    <div
      className="project-preview"
      style={{ "--project-accent": project.previewColor }}
    >
      <div className="project-preview__window">
        <img
          src={project.image}
          alt={project.imageAlt}
          className={`project-preview__image project-preview__image--${project.imageFit ?? "cover"}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
    </div>
  );
}

function ProjectActions({ project }) {
  const isExternalDemo = project.liveDemo?.startsWith("http");

  return (
    <div className="project-actions">
      {project.liveDemo && (
        <a
          href={project.liveDemo}
          target={isExternalDemo ? "_blank" : undefined}
          rel={isExternalDemo ? "noopener noreferrer" : undefined}
        >
          Open project
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      )}
      <a href={project.github} target="_blank" rel="noopener noreferrer">
        View source
        <FolderGit2 size={15} aria-hidden="true" />
      </a>
    </div>
  );
}

function ProjectShowcase({ project, index }) {
  return (
    <article
      className="project-showcase"
      style={{ "--project-index": index }}
    >
      <div className="project-showcase__copy">
        <header className="project-showcase__header">
          <div>
            <h2>{project.name}</h2>
            <p>{project.tags.join(", ")}</p>
          </div>
          <time>{project.year}</time>
        </header>

        <ul className="project-showcase__highlights">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <dl className="project-showcase__meta">
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>{project.context}</dd>
          </div>
        </dl>

        <ProjectActions project={project} />
      </div>

      <ProjectPreview project={project} priority={index === 0} />
    </article>
  );
}

export function ProjectsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Projects — Aaron Arada";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="projects-page">
      <section className="projects-page__inner">
        <header className="projects-hero">
          <h1>My Projects</h1>
          <div className="projects-hero__rule">
            <span>
              <FolderGit2 size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </div>
        </header>

        <div className="project-showcase-list">
          {projects.map((project, index) => (
            <ProjectShowcase
              key={project.name}
              project={project}
              index={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
