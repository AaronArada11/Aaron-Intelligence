import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContextCore";
import { accentList, flavors } from "../themeTokens";

const THEME_STORAGE_KEY = "aaron-intelligence-theme:v1";
const DEFAULT_THEME = { flavor: "neptune", accent: "green" };

function hasOwn(object, key) {
  return typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
}

function isSelectableAccent(flavor, accent) {
  return accentList.includes(accent) && hasOwn(flavors[flavor], accent);
}

function loadThemePreference() {
  try {
    const storedPreference = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY));

    if (!hasOwn(flavors, storedPreference?.flavor)) {
      return DEFAULT_THEME;
    }

    const flavor = storedPreference.flavor;
    const accent = isSelectableAccent(flavor, storedPreference.accent)
      ? storedPreference.accent
      : DEFAULT_THEME.accent;

    return { flavor, accent };
  } catch {
    return DEFAULT_THEME;
  }
}

function saveThemePreference(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Keep theme switching functional when storage is unavailable.
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadThemePreference);
  const { flavor, accent } = theme;

  useEffect(() => {
    saveThemePreference(theme);
  }, [theme]);

  const contextValue = useMemo(
    () => ({
      flavor,
      accent,
      setFlavor: (nextFlavor) => {
        if (hasOwn(flavors, nextFlavor)) {
          setTheme((currentTheme) => ({ ...currentTheme, flavor: nextFlavor }));
        }
      },
      setAccent: (nextAccent) => {
        if (isSelectableAccent(flavor, nextAccent)) {
          setTheme((currentTheme) => ({ ...currentTheme, accent: nextAccent }));
        }
      },
    }),
    [accent, flavor],
  );

  const colors = flavors[flavor];
  const accentColor = colors[accent];

  const style = Object.entries(colors).reduce((acc, [k, v]) => {
    acc[`--ctp-${k}`] = v;
    return acc;
  }, {});
  style["--ctp-accent"] = accentColor;

  return (
    <ThemeContext.Provider value={contextValue}>
      <div style={{ ...style, background: "var(--ctp-base)", color: "var(--ctp-text)" }} className="min-h-screen font-sans" data-flavor={flavor}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
