import { useCallback } from "react";
import { useStore } from "src/stores/rootStore";
import { darkTheme, lightTheme } from "src/themes";
import styled from "styled-components";
import {
  MdLightMode as LightMode,
  MdDarkMode as DarkMode,
} from "react-icons/md";

const OverlayContainer = styled.div`
  position: fixed;

  right: 32px;
  bottom: 32px;

  z-index: 50;
`;

const OverlayItem = styled.button`
  &:hover {
    cursor: pointer;
  }

  width: 60px;
  height: 60px;
  background-color: ${(props) => props.theme.color.surface};
  border-radius: 50%;
  border: none;

  box-shadow: 0 0 5px black;

`;

function ThemeSwitchItem() {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const toggleTheme = useCallback(() => {
    if (theme === lightTheme) {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  }, [setTheme, theme]);

  return (
    <OverlayItem onClick={toggleTheme}>
      {theme === lightTheme ? (
        <LightMode size={24} color={theme.color.onSurface} />
      ) : (
        <DarkMode size={24} color={theme.color.onSurface} />
      )}
    </OverlayItem>
  );
}

export default function Overlay() {
  return (
    <OverlayContainer>
      <ThemeSwitchItem />
    </OverlayContainer>
  );
}
