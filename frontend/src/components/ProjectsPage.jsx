import { useEffect } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FolderGit2,
} from "lucide-react";
import { projects } from "../projectsData";

const previewContent = {
  gesture: {
    status: "Camera ready",
    title: "Sign to speech",
    primary: "Magandang araw",
    secondary: "Good day",
  },
  assistant: {
    status: "Knowledge base online",
    title: "Ask Aaron Intelligence",
    primary: "What has Aaron built with AI?",
    secondary: "Here are the projects most relevant to that question…",
  },
  visualizer: {
    status: "Merge sort · running",
    title: "See the algorithm",
    primary: "Comparisons",
    secondary: "42",
  },
  mentor: {
    status: "Review in progress",
    title: "Think before the answer",
    primary: "What assumption does this loop make?",
    secondary: "Trace the value of index when the list is empty.",
  },
};

function ProjectPreview({ project }) {
  const Icon = project.icon;
  const content = previewContent[project.preview];

  return (
    <div
      className="project-preview"
      style={{ "--project-accent": project.previewColor }}
      aria-hidden="true"
    >
      <div className={`project-preview__window project-preview__window--${project.preview}`}>
        <div className="project-preview__chrome">
          <span className="project-preview__dots">
            <i />
            <i />
            <i />
          </span>
          <span>{project.name.toLowerCase().replaceAll(" ", "-")}.app</span>
          <span className="project-preview__status">{content.status}</span>
        </div>

        <div className="project-preview__canvas">
          <div className="project-preview__brand">
            <span className="project-preview__mark">
              <Icon size={18} strokeWidth={1.7} />
            </span>
            <span>{project.name}</span>
          </div>

          {project.preview === "gesture" && (
            <div className="gesture-preview">
              <div className="gesture-preview__camera">
                <span className="gesture-preview__scan" />
                <Icon size={58} strokeWidth={1.1} />
                <small>gesture detected</small>
              </div>
              <div className="gesture-preview__translation">
                <p>{content.title}</p>
                <strong>{content.primary}</strong>
                <span>{content.secondary}</span>
                <div className="gesture-preview__languages">
                  <span>FSL</span>
                  <b>→</b>
                  <span>FIL</span>
                </div>
              </div>
            </div>
          )}

          {project.preview === "assistant" && (
            <div className="assistant-preview">
              <p className="assistant-preview__question">{content.primary}</p>
              <div className="assistant-preview__answer">
                <span className="assistant-preview__avatar">AI</span>
                <div>
                  <p>{content.secondary}</p>
                  <span className="assistant-preview__line assistant-preview__line--long" />
                  <span className="assistant-preview__line" />
                  <span className="assistant-preview__line assistant-preview__line--short" />
                </div>
              </div>
              <div className="assistant-preview__input">
                <span>Ask about Aaron’s work…</span>
                <ArrowUpRight size={15} />
              </div>
            </div>
          )}

          {project.preview === "visualizer" && (
            <div className="visualizer-preview">
              <div className="visualizer-preview__toolbar">
                <span>{content.title}</span>
                <span>{content.status}</span>
              </div>
              <div className="visualizer-preview__bars">
                {[42, 66, 31, 82, 52, 92, 61, 74, 37, 86, 48, 69].map((height, index) => (
                  <i
                    key={`${height}-${index}`}
                    style={{
                      "--bar-height": `${height}%`,
                      "--bar-delay": `${index * 45}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="visualizer-preview__footer">
                <span>{content.primary}</span>
                <strong>{content.secondary}</strong>
              </div>
            </div>
          )}

          {project.preview === "mentor" && (
            <div className="mentor-preview">
              <div className="mentor-preview__code">
                <span><b>01</b> function findMax(values) &#123;</span>
                <span><b>02</b>&nbsp;&nbsp; let max = values[0];</span>
                <span className="mentor-preview__active"><b>03</b>&nbsp;&nbsp; for (let i = 1; i &lt; values.length; i++) &#123;</span>
                <span><b>04</b>&nbsp;&nbsp;&nbsp;&nbsp; if (values[i] &gt; max) max = values[i];</span>
                <span><b>05</b>&nbsp;&nbsp; &#125;</span>
                <span><b>06</b>&nbsp;&nbsp; return max;</span>
                <span><b>07</b> &#125;</span>
              </div>
              <div className="mentor-preview__prompt">
                <small>{content.title}</small>
                <strong>{content.primary}</strong>
                <p>{content.secondary}</p>
              </div>
            </div>
          )}
        </div>
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

      <ProjectPreview project={project} />
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
