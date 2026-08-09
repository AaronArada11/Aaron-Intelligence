import { useTheme } from "./useTheme";
import { flavors, accentList } from "../themeTokens";

const flavourLabels = [
  { key: "nimbus", label: "Horizon" },
  { key: "sage", label: "Sage" },
  { key: "neptune", label: "Neptune" },
  { key: "abyss", label: "Abyss" },
];

export function ThemeSelector() {
  const { flavor, accent, setFlavor, setAccent } = useTheme();

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-sans text-sm font-medium text-[var(--ctp-text)]">
          Color theme
        </p>
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(6.75rem,1fr))] gap-1 rounded-lg border p-1"
          style={{ borderColor: "var(--ctp-surface0)" }}
        >
          {flavourLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFlavor(key)}
              aria-pressed={flavor === key}
              style={{
                background: flavor === key ? "var(--ctp-surface0)" : "transparent",
                boxShadow: flavor === key ? "inset 0 0 0 1px var(--ctp-accent)" : "none",
                color: flavor === key ? "var(--ctp-text)" : "var(--ctp-subtext1)",
              }}
              className="min-h-10 min-w-0 rounded-md px-3 py-2 font-mono text-sm transition-colors hover:bg-[var(--ctp-surface0)] hover:text-[var(--ctp-text)]"
            >
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-sans text-sm font-medium text-[var(--ctp-text)]">
          Accent color
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(2.35rem,1fr))] gap-2">
          {accentList.map((a) => {
            const color = flavors[flavor][a];
            return (
              <button
                key={a}
                onClick={() => setAccent(a)}
                title={a}
                aria-label={`Use ${a} accent color`}
                aria-pressed={accent === a}
                style={{
                  background: color,
                  boxShadow: accent === a ? `0 0 0 3px var(--ctp-base), 0 0 0 5px ${color}` : "none",
                }}
                className="aspect-square w-full min-w-0 rounded-lg border border-[var(--ctp-surface0)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ctp-accent)]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
