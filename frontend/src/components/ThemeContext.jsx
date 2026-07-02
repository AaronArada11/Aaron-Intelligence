import { useState } from "react";
import { ThemeContext } from "./themeContextCore";
import { flavors } from "../themeTokens";

export function ThemeProvider({ children }) {
  const [flavor, setFlavor] = useState("neptune");
  const [accent, setAccent] = useState("green");

  const colors = flavors[flavor];
  const accentColor = colors[accent];

  const style = Object.entries(colors).reduce((acc, [k, v]) => {
    acc[`--ctp-${k}`] = v;
    return acc;
  }, {});
  style["--ctp-accent"] = accentColor;

  return (
    <ThemeContext.Provider value={{ flavor, accent, setFlavor, setAccent }}>
      <div style={{ ...style, background: "var(--ctp-base)", color: "var(--ctp-text)" }} className="min-h-screen font-mono" data-flavor={flavor}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
