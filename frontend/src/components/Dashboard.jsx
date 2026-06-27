import { useEffect, useState } from "react";
import { Activity, ExternalLink, Palette, ChartNoAxesColumnIncreasing } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { SortingVisualizer } from "./SortingVisualizer"

const COMMITS_API_URL = "/github-commits";

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{ background: "var(--ctp-mantle)", border: "1px solid var(--ctp-surface0)" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      className="font-mono uppercase tracking-widest"
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

    async function loadCommits() {
      try {
        const response = await fetch(COMMITS_API_URL);

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
          setCommitsError(error.message);
          setCommitsStatus("error");
        }
      }
    }

    loadCommits();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section style={{ background: "var(--ctp-base)" }} className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-xs mb-6 uppercase tracking-widest" style={{ color: "var(--ctp-accent)" }}>
          $ cat ~/dashboard.json
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Theme */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette  size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>Theme</SectionLabel>
            </div>

            <ThemeSelector />
          </Card>

          

          {/* Recent Commits */}
          <Card className="md:col-span-2 min-h-[220px]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <Activity size={13} style={{ color: "var(--ctp-accent)" }} />
                <SectionLabel>Recent Commits</SectionLabel>
              </div>
              <span
                className="whitespace-nowrap font-mono text-xs"
                style={{ color: "var(--ctp-accent)" }}
              >
                [info]
              </span>
            </div>

            <div className="space-y-3">
              {commitsStatus === "loading" && (
                <p className="font-mono text-sm" style={{ color: "var(--ctp-subtext0)" }}>
                  Loading commits...
                </p>
              )}

              {commitsStatus === "error" && (
                <p className="font-mono text-sm" style={{ color: "var(--ctp-red, #f38ba8)" }}>
                  {commitsError}
                </p>
              )}

              {commitsStatus === "ready" && commits.length === 0 && (
                <p className="font-mono text-sm" style={{ color: "var(--ctp-subtext0)" }}>
                  No commits found.
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

            <div className="mt-6 flex items-center gap-5">
              <a
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-sm"
                style={{ color: "var(--ctp-accent)" }}
              >
                View on GitHub
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

          {/* AlgoVisualizer */}
          <Card className="md:col-span-4">
            <div className="flex items-center gap-2 mb-1">
              <ChartNoAxesColumnIncreasing size={13} style={{ color: "var(--ctp-accent)" }} />
              <SectionLabel>AlgoVisualizer</SectionLabel>
            </div>
            <div className="space-y-3">
              <SortingVisualizer />

            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
