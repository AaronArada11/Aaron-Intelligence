import { createContext } from "react";

export const ThemeContext = createContext({
  flavor: "neptune",
  accent: "green",
  setFlavor: () => {},
  setAccent: () => {},
});
