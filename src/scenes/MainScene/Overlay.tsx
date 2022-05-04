import { useCallback } from "react";
import { useStore } from "src/stores/rootStore";
import { darkTheme, lightTheme } from "src/themes";
import styled from "styled-components";
import { BiTrash as TrashIcon } from "react-icons/bi";
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

  display: block;
  margin: 8px 2px;

  width: 60px;
  height: 60px;
  background-color: ${(props) => props.theme.color.surface};
  border-radius: 50%;
  border: none;

  box-shadow: 0 0 5px black;

  transition: background-color 0.1s;
`;

function ThemeSwitchItem() {
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

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
    <>
      <OverlayItem
        id="headerDeleteMode"
        className="center header__deleteMode"
        title="Delete tags"
        onClick={toggleEditMode}
      >
        <TrashIcon
          size={24}
          color={
            editMode === "add" ? theme.color.onSurface : theme.color.danger
          }
        />
      </OverlayItem>
      <OverlayItem
        onClick={toggleTheme}
        style={{ backgroundColor: theme.color.onSurface }}
      >
        {theme === lightTheme ? (
          <LightMode size={24} color={theme.color.surface} />
        ) : (
          <DarkMode size={24} color={theme.color.surface} />
        )}
      </OverlayItem>
    </>
  );
}

export default function Overlay() {
  return (
    <OverlayContainer>
      <ThemeSwitchItem />
    </OverlayContainer>
  );
}
