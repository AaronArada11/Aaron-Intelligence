import { useEffect, useState } from "react";
import { GitCommitHorizontal, ExternalLink, Palette } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

const COMMITS_API_URL = "/github-commits";

function Card({ children, className = "" }) {
  return (
    <div
      className={`scroll-parallax scroll-parallax-card rounded-xl p-5 ${className}`}
      style={{ background: "var(--ctp-mantle)", border: "1px solid var(--ctp-surface0)" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      className="font-sans font-semibold uppercase tracking-widest"
      style={{ fontSize: "0.65rem", color: "var(--ctp-accent)" }}
    >
      {children}
    </p>
  );
}

const languageSegmentColors = [
  "var(--ctp-sky)",
  "var(--ctp-red)",
  "var(--ctp-blue)",
  "var(--ctp-peach)",
  "var(--ctp-green)",
  "var(--ctp-mauve)",
  "var(--ctp-yellow)",
  "var(--ctp-sapphire)",
];

function shortRepositoryName(repository) {
  return repository?.split("/").pop() ?? "github";
}

function formatStat(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function Dashboard() {
  const [commits, setCommits] = useState([]);
  const [languageSegments, setLanguageSegments] = useState([]);
  const [githubUsername, setGithubUsername] = useState("AaronArada11");
  const [commitsStatus, setCommitsStatus] = useState("loading");
  const [commitsError, setCommitsError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 12000);

    async function loadCommits() {
      try {
        const response = await fetch(COMMITS_API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`GitHub request failed (${response.status})`);
        }

        const data = await response.json();

        if (isMounted) {
          setCommits(data.commits ?? []);
          setLanguageSegments(data.languageSegments ?? []);
          setGithubUsername(data.username ?? "AaronArada11");
          setCommitsStatus("ready");
        }
      } catch (error) {
        if (isMounted) {
          setCommitsError(
            error.name === "AbortError"
              ? "Recent GitHub activity took too long to load. Try refreshing the page."
              : "Recent GitHub activity is unavailable right now. View Aaron's GitHub profile instead."
          );
          setCommitsStatus("error");
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    loadCommits();

    return () => {
      isMounted = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="homepage-dashboard">
          {/* Theme */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Palette  size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>Theme</SectionLabel>
            </div>

            <ThemeSelector />
          </Card>

          

          {/* Recent Commits */}
          <Card className="md:col-span-2 min-h-[220px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <GitCommitHorizontal size={13} style={{ color: "var(--ctp-accent)" }} />
                <SectionLabel>Recent Commits</SectionLabel>
              </div>
              
            </div>

            <div className="space-y-2.5">
              {commitsStatus === "loading" && (
                <p className="font-sans text-sm" style={{ color: "var(--ctp-subtext0)" }}>
                  Loading recent GitHub activity...
                </p>
              )}

              {commitsStatus === "error" && (
                <p className="font-sans text-sm" style={{ color: "var(--ctp-red, #f38ba8)" }}>
                  {commitsError}
                </p>
              )}

              {commitsStatus === "ready" && commits.length === 0 && (
                <p className="font-sans text-sm" style={{ color: "var(--ctp-subtext0)" }}>
                  No recent public commits to show.
                </p>
              )}

              {commits.slice(0, 5).map((commit) => (
                <a
                  key={commit.oid}
                  href={commit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 font-mono"
                >
                  <p
                    className="min-w-0 truncate text-sm leading-tight"
                    style={{ color: "var(--ctp-subtext1)" }}
                    title={`${commit.repository}: ${commit.messageHeadline}`}
                  >
                    <span style={{ color: "var(--ctp-text)" }}>
                      {shortRepositoryName(commit.repository)}:
                    </span>{" "}
                    <span>
                      {commit.messageHeadline}
                    </span>
                  </p>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span style={{ color: "var(--ctp-accent)" }}>
                      +{formatStat(commit.additions)}
                    </span>
                    <span style={{ color: "var(--ctp-surface2)" }}>/</span>
                    <span style={{ color: "var(--ctp-red)" }}>
                      -{formatStat(commit.deletions)}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-5">
              <a
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-sm"
                style={{ color: "var(--ctp-accent)" }}
              >
                View Aaron's GitHub profile
                <ExternalLink size={14} />
              </a>
              <div className="flex h-2 min-w-0 flex-1 overflow-visible rounded-full">
                {languageSegments.map((segment, index) => (
                  <span
                    key={segment.language}
                    className="group/language relative first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${segment.percentage}%`,
                      background: languageSegmentColors[index % languageSegmentColors.length],
                    }}
                  >
                    <span
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 font-mono text-xs opacity-0 shadow-lg transition-opacity group-hover/language:opacity-100"
                      style={{
                        background: "var(--ctp-crust)",
                        border: "1px solid var(--ctp-surface0)",
                        color: "var(--ctp-text)",
                      }}
                    >
                      {segment.language}: {segment.percentage}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </Card>

    </div>
  );
}
