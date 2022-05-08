import create from "zustand";
import { combine } from "zustand/middleware";
import { darkTheme, lightTheme } from "src/themes";
import { DefaultTheme } from "styled-components";

const THEME_KEY = "theme";
const THEME_KEY__DARK = "dark";
const THEME_KEY__LIGHT = "light";

const COLUMNS_KEY = "zoom";

const DEFAULT_COLUMNS = 4;
const MAX_COLUMNS = 8;

const displayState = {
  // Settings
  theme: lightTheme,
  columnCount: DEFAULT_COLUMNS,
};

const displayStore = combine(displayState, (set, get) => ({
  initSettings: () => {
    let theme = localStorage.getItem(THEME_KEY);

    if (!theme) {
      const preferDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      theme = preferDark ? THEME_KEY__DARK : THEME_KEY__LIGHT;
    }

    const columnCount = localStorage.getItem(COLUMNS_KEY)
      ? parseInt(localStorage.getItem(COLUMNS_KEY)!)
      : DEFAULT_COLUMNS;

    set({
      theme: theme === THEME_KEY__LIGHT ? lightTheme : darkTheme,
      columnCount,
    });
  },

  setColumnCount: (change: number) => {
    const columnCount = Math.max(
      Math.min(get().columnCount + change, MAX_COLUMNS),
      0
    );

    localStorage.setItem(COLUMNS_KEY, columnCount + "");

    set({ columnCount });
  },
  getColumnGutter: () => getColumnGutter(get().columnCount),
  setTheme: (theme: DefaultTheme) => {
    localStorage.setItem(
      THEME_KEY,
      theme === lightTheme ? THEME_KEY__LIGHT : THEME_KEY__DARK
    );

    set({ theme });
  },
}));

export const useDisplayStore = create(displayStore);

// Helper functions
function getColumnGutter(columnCount: number) {
  return 120 / columnCount;
}
