import { useCallback } from "react";
import {
  MdLightMode as LightMode,
  MdDarkMode as DarkMode,
} from "react-icons/md";
import { useDisplayStore } from "src/stores/displayStore";
import { darkTheme, lightTheme } from "src/themes";
import { OverlayItem } from ".";

export function ThemeOverlay() {
  const theme = useDisplayStore((state) => state.theme);
  const setTheme = useDisplayStore((state) => state.setTheme);

  const toggleTheme = useCallback(() => {
    if (theme === lightTheme) {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  }, [setTheme, theme]);

  return (
    <OverlayItem onClick={toggleTheme} title="Toggle theme">
      {theme === lightTheme ? (
        <LightMode size="24px" color={theme.color.onSurface} />
      ) : (
        <DarkMode size="24px" color={theme.color.onSurface} />
      )}
    </OverlayItem>
  );
}
