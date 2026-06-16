import { useTheme, flavors, accentList } from "./ThemeContext";

const flavourLabels = [
  { key: "latte", label: "Latte" },
  { key: "frappe", label: "Frappé" },
  { key: "neptune", label: "Neptune" },
  { key: "abyss", label: "Abyss" },
];

export function ThemeSelector() {
  const { flavor, accent, setFlavor, setAccent } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <p style={{ color: "var(--ctp-subtext0)" }} className="font-mono text-xs mb-2 uppercase tracking-widest">Flavor</p>
        <div className="flex gap-2 flex-wrap">
          {flavourLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFlavor(key)}
              style={{
                background: flavor === key ? "var(--ctp-accent)" : "var(--ctp-surface0)",
                color: flavor === key ? "var(--ctp-base)" : "var(--ctp-subtext1)",
              }}
              className="px-4 py-1.5 rounded font-mono text-sm transition-all">
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p style={{ color: "var(--ctp-subtext0)" }} className="font-mono text-xs mb-2 uppercase tracking-widest">Accent</p>
        <div className="flex gap-2 flex-wrap">
          {accentList.map((a) => {
            const color = flavors[flavor][a];
            return (
              <button
                key={a}
                onClick={() => setAccent(a)}
                title={a}
                style={{
                  background: color,
                  outline: accent === a ? `2px solid ${color}` : "none",
                  outlineOffset: "2px",
                }}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
