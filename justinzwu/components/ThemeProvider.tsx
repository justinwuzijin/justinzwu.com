\"use client\";

import React from \"react\";

type Theme = \"light\" | \"dark\" | \"orange\";

const THEME_STORAGE_KEY = \"theme\";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(\"light\");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const next: Theme = stored ?? \"light\";
    setTheme(next);
    document.documentElement.setAttribute(\"data-theme\", next);
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute(\"data-theme\", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // TODO: Confirm the exact keyboard combo to enable orange mode.
  // Temporarily disabled to avoid guessing.
  // React.useEffect(() => {
  //   function onKey(e: KeyboardEvent) {
  //     if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === \"o\") {
  //       setTheme((prev) => (prev === \"orange\" ? \"light\" : \"orange\"));
  //     }
  //   }
  //   window.addEventListener(\"keydown\", onKey);
  //   return () => window.removeEventListener(\"keydown\", onKey);
  // }, []);

  const cycleLightDark = React.useCallback(() => {
    setTheme((prev) => (prev === \"dark\" ? \"light\" : \"dark\"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleLightDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleLightDark: () => void;
};

const ThemeContext = React.createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error(\"useTheme must be used within ThemeProvider\");
  return ctx;
}
