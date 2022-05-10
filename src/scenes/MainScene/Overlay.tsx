import { useCallback } from "react";
import { useStore } from "src/stores/rootStore";
import { darkTheme, lightTheme } from "src/themes";
import styled from "styled-components";
import {
  AiOutlineZoomIn as ZoomIn,
  AiOutlineZoomOut as ZoomOut,
} from "react-icons/ai";
import { BiTrash as TrashIcon } from "react-icons/bi";
import {
  MdLightMode as LightMode,
  MdDarkMode as DarkMode,
} from "react-icons/md";
import { useDisplayStore } from "src/stores/displayStore";

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
  border: 2px solid ${(props) => props.theme.color.surfaceBorder};

  box-shadow: 0 0 5px ${(props) => props.theme.color.shadow};

  transition: background-color 0.1s;
`;

function ThemeSwitchItem() {
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  const setColumnCount = useDisplayStore((state) => state.setColumnCount);

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
    <>
      <OverlayItem
        id="headerDeleteMode"
        className="center overlay__deleteMode"
        title="Delete tags"
        onClick={toggleEditMode}
      >
        <TrashIcon
          size="24px"
          color={
            editMode === "add" ? theme.color.onSurface : theme.color.danger
          }
        />
      </OverlayItem>
      <OverlayItem onClick={() => setColumnCount(-1)}>
        <ZoomIn size="24px" color={theme.color.onSurface} />
      </OverlayItem>
      <OverlayItem onClick={() => setColumnCount(1)}>
        <ZoomOut size="24px" color={theme.color.onSurface} />
      </OverlayItem>
      <OverlayItem
        onClick={toggleTheme}
        style={{ backgroundColor: theme.color.surface }}
      >
        {theme === lightTheme ? (
          <LightMode size="24px" color={theme.color.onSurface} />
        ) : (
          <DarkMode size="24px" color={theme.color.onSurface} />
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
