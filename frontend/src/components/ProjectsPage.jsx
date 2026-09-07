import { useEffect } from "react";
import {
  ExternalLink,
  FolderGit2,
  MessageCircle,
  Terminal,
} from "lucide-react";
import { projects } from "../projectsData";

const PROJECT_IMAGE_SIZES = "(max-width: 960px) calc(100vw - 3rem), 45vw";

function WindowControls() {
  return (
    <div className="projects-windowbar__controls" aria-hidden="true">
      <span className="projects-windowbar__control projects-windowbar__control--close" />
      <span className="projects-windowbar__control projects-windowbar__control--minimize" />
      <span className="projects-windowbar__control projects-windowbar__control--maximize" />
    </div>
  );
}

function ProjectPreview({ project, priority }) {
  return (
    <div className="project-preview">
      <div className="project-preview__window">
        <picture className="project-preview__picture">
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
            className={`project-preview__image project-preview__image--${project.imageFit ?? "cover"}`}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
        </picture>
      </div>
    </div>
  );
}

function ProjectActions({ project, onOpenChat }) {
  const opensChat = project.demoAction === "chat";
  const isExternalDemo = project.liveDemo?.startsWith("http");

  return (
    <div className="project-actions">
      {opensChat ? (
        <button
          type="button"
          onClick={onOpenChat}
          aria-label="Open the Aaron Intelligence chat demo"
          aria-controls="aaron-intelligence-chat"
        >
          Live demo
          <MessageCircle size={15} aria-hidden="true" />
        </button>
      ) : project.liveDemo ? (
        <a
          href={project.liveDemo}
          aria-label={`View ${project.name} live demo`}
          target={isExternalDemo ? "_blank" : undefined}
          rel={isExternalDemo ? "noopener noreferrer" : undefined}
        >
          Live demo
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      ) : null}
      <a
        href={project.github}
        aria-label={`View ${project.name} source code`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Source code
        <FolderGit2 size={15} aria-hidden="true" />
      </a>
    </div>
  );
}

function ProjectShowcase({ project, index, onOpenChat }) {
  return (
    <article
      className="project-showcase"
      style={{
        "--project-index": index,
        "--project-accent": project.previewColor,
      }}
    >
      <div className="projects-windowbar">
        <WindowControls />
        <span className="projects-windowbar__title">{project.name}</span>
        <span className="projects-windowbar__meta">{project.category}</span>
      </div>

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

        <ProjectActions project={project} onOpenChat={onOpenChat} />
      </div>

      <ProjectPreview project={project} priority={index === 0} />
    </article>
  );
}

export function ProjectsPage({ onOpenChat }) {
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
          <h1>Projects</h1>
          <p className="projects-hero__output">
            {projects.length} projects · last updated September 2026
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
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
