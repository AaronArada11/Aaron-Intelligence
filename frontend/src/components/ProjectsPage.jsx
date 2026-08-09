import { useEffect } from "react";
import {
  ExternalLink,
  FolderGit2,
  Terminal,
} from "lucide-react";
import { projects } from "../projectsData";

const NON_PATH_CHARACTERS = /[^a-z0-9]+/g;
const EDGE_DASHES = /(^-|-$)/g;

function getProjectDirectory(name) {
  return name
    .toLowerCase()
    .replace(NON_PATH_CHARACTERS, "-")
    .replace(EDGE_DASHES, "");
}

function ProjectCommand({ children, className = "", status }) {
  return (
    <div className={`projects-command ${className}`}>
      <span className="projects-command__prompt" aria-hidden="true">$</span>
      <code>{children}</code>
      {status && <span className="projects-command__status">{status}</span>}
    </div>
  );
}

function ProjectPreview({ project, priority }) {
  return (
    <div
      className="project-preview"
      style={{ color: "var(--ctp-accent)" }}
    >
      <ProjectCommand 
      className="project-preview__command"
      >
        open ./screenshots/preview.png
      </ProjectCommand>
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
          aria-label={`View ${project.name} live demo`}
          target={isExternalDemo ? "_blank" : undefined}
          rel={isExternalDemo ? "noopener noreferrer" : undefined}
        >
          <span className="project-actions__prompt" aria-hidden="true">$</span>
          open live-demo
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      )}
      <a
        href={project.github}
        aria-label={`View ${project.name} source code`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="project-actions__prompt" aria-hidden="true">$</span>
        open source-code
        <FolderGit2 size={15} aria-hidden="true" />
      </a>
    </div>
  );
}

function ProjectShowcase({ project, index }) {
  const projectDirectory = getProjectDirectory(project.name);

  return (
    <article
      className="project-showcase"
      style={{
        "--project-index": index,
        "--project-accent": project.previewColor,
      }}
    >
      <ProjectCommand
        className="project-showcase__command"
        status="exit 0"
      >
        {`cat ~/projects/${projectDirectory}/README.md`}
      </ProjectCommand>

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
          <ProjectCommand className="projects-hero__command">
            ls -la ~/projects
          </ProjectCommand>
          <h1>Projects</h1>
          <p className="projects-hero__output">
            {projects.length} projects · last updated August 2026
          </p>
          <div className="projects-hero__rule">
            <span>
              <Terminal size={30} strokeWidth={1.5} aria-hidden="true" />
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
