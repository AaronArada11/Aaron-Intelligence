import { useEffect, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  FolderGit2,
} from "lucide-react";
import { projects } from "../projectsData";

function ProjectIndex({ activeProject, onSelect }) {
  return (
    <div
      aria-label="Project index"
      className="border-b md:border-b-0 md:border-r"
      style={{ borderColor: "var(--ctp-surface0)" }}
    >
      {projects.map((project) => {
        const isActive = project.name === activeProject.name;

        return (
          <button
            key={project.name}
            type="button"
            onClick={() => onSelect(project)}
            aria-pressed={isActive}
            className="group flex min-h-16 w-full items-center justify-between gap-4 border-b px-4 py-3 text-left font-mono transition-colors last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{
              borderColor: "var(--ctp-surface0)",
              background: isActive ? "var(--ctp-mantle)" : "transparent",
              color: isActive ? "var(--ctp-text)" : "var(--ctp-subtext1)",
              outlineColor: "var(--ctp-accent)",
              boxShadow: isActive ? "inset 3px 0 0 var(--ctp-accent)" : "none",
            }}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="truncate text-sm">{project.name}</span>
            </span>
            <ArrowRight
              aria-hidden="true"
              size={15}
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: isActive ? "var(--ctp-accent)" : "var(--ctp-overlay1)" }}
            />
          </button>
        );
      })}
    </div>
  );
}

function ProjectActions({ project }) {
  const isExternalDemo = project.liveDemo?.startsWith("http");

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ctp-surface0)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          borderColor: "var(--ctp-surface1)",
          color: "var(--ctp-accent)",
          outlineColor: "var(--ctp-accent)",
        }}
      >
        <FolderGit2 size={15} aria-hidden="true" />
        View source
      </a>
      {project.liveDemo && (
        <a
          href={project.liveDemo}
          target={isExternalDemo ? "_blank" : undefined}
          rel={isExternalDemo ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--ctp-surface0)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderColor: "var(--ctp-surface1)",
            color: "var(--ctp-text)",
            outlineColor: "var(--ctp-accent)",
          }}
        >
          <ExternalLink size={15} aria-hidden="true" />
          Open live demo
        </a>
      )}
    </div>
  );
}

function ProjectDetail({ project }) {
  return (
    <article
      key={project.name}
      className="projects-detail-enter flex min-h-96 flex-col p-5 sm:p-7 lg:p-9"
      aria-live="polite"
    >
      <h2
        className="mb-7 text-balance font-mono leading-tight"
        style={{
          color: "var(--ctp-text)",
          fontSize: "clamp(1.55rem, 3vw, 2.2rem)",
        }}
      >
        {project.name}
      </h2>

      <p
        className="mb-8 max-w-3xl text-pretty font-mono text-sm leading-7"
        style={{ color: "var(--ctp-subtext1)" }}
      >
        {project.description}
      </p>

      <dl className="mb-8 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[7rem_1fr]">
        <dt className="font-mono" style={{ color: "var(--ctp-overlay2)" }}>
          Role
        </dt>
        <dd className="font-mono" style={{ color: "var(--ctp-text)" }}>
          {project.role}
        </dd>
        <dt className="font-mono" style={{ color: "var(--ctp-overlay2)" }}>
          Context
        </dt>
        <dd className="font-mono" style={{ color: "var(--ctp-text)" }}>
          {project.context}
        </dd>
        <dt className="font-mono" style={{ color: "var(--ctp-overlay2)" }}>
          Stack
        </dt>
        <dd className="flex flex-wrap gap-x-3 gap-y-1 font-mono">
          {project.tags.map((tag) => (
            <span key={tag} style={{ color: "var(--ctp-subtext1)" }}>
              {tag}
            </span>
          ))}
        </dd>
      </dl>

      <div className="mt-auto">
        <ProjectActions project={project} />
      </div>
    </article>
  );
}

function ProjectTable({ onSelect }) {
  return (
    <div
      className="mt-10 border-t"
      style={{ borderColor: "var(--ctp-surface0)" }}
    >
      <div
        className="hidden grid-cols-[1.1fr_2fr_1.4fr_auto] gap-6 border-b px-4 py-3 font-mono text-xs md:grid"
        style={{ borderColor: "var(--ctp-surface0)", color: "var(--ctp-overlay2)" }}
      >
        <span>Project</span>
        <span>What it does</span>
        <span>Focus</span>
        <span className="sr-only">Action</span>
      </div>
      {projects.map((project) => (
        <button
          key={project.name}
          type="button"
          onClick={() => {
            onSelect(project);
            document.getElementById("project-browser")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "center",
            });
          }}
          className="group grid w-full gap-2 border-b px-4 py-4 text-left font-mono transition-colors hover:bg-[var(--ctp-mantle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] md:grid-cols-[1.1fr_2fr_1.4fr_auto] md:items-center md:gap-6"
          style={{
            borderColor: "var(--ctp-surface0)",
            outlineColor: "var(--ctp-accent)",
          }}
        >
          <span className="text-sm" style={{ color: "var(--ctp-text)" }}>
            {project.name}
          </span>
          <span className="text-xs leading-5 md:text-sm" style={{ color: "var(--ctp-subtext1)" }}>
            {project.shortDescription}
          </span>
          <span className="text-xs md:text-sm" style={{ color: "var(--ctp-overlay2)" }}>
            {project.category}
          </span>
          <ArrowRight
            aria-hidden="true"
            size={16}
            className="hidden transition-transform duration-200 group-hover:translate-x-1 md:block"
            style={{ color: "var(--ctp-accent)" }}
          />
        </button>
      ))}
    </div>
  );
}

export function ProjectsPage() {
  const [activeProject, setActiveProject] = useState(projects[0]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Projects — Aaron Arada";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main style={{ background: "var(--ctp-base)" }}>
      <section className="px-6 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 border-b pb-8" style={{ borderColor: "var(--ctp-surface0)" }}>
            <h1
              className="mb-4 text-balance font-mono leading-none"
              style={{
                color: "var(--ctp-text)",
                fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
                letterSpacing: "-0.035em",
              }}
            >
              Projects
            </h1>
            <p
              className="max-w-3xl text-pretty font-mono text-sm leading-7 sm:text-base"
              style={{ color: "var(--ctp-subtext1)" }}
            >
              Selected builds across AI, machine learning, education, and interactive systems.
            </p>
            <p className="mt-5 font-mono text-sm" style={{ color: "var(--ctp-overlay2)" }}>
              4 projects <span aria-hidden="true">·</span>{" "}
              <span style={{ color: "var(--ctp-accent)" }}>source available</span>
            </p>
          </div>

          <div
            id="project-browser"
            className="overflow-hidden rounded-lg border md:grid md:grid-cols-[18rem_1fr]"
            style={{
              background: "var(--ctp-base)",
              borderColor: "var(--ctp-surface0)",
            }}
          >
            <ProjectIndex activeProject={activeProject} onSelect={setActiveProject} />
            <ProjectDetail project={activeProject} />
          </div>

          <ProjectTable onSelect={setActiveProject} />
        </div>
      </section>
    </main>
  );
}
