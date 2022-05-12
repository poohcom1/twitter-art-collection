import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStore } from "src/stores/rootStore";
import { darkTheme, lightTheme } from "src/themes";
import styled, { css, Keyframes, keyframes } from "styled-components";
import {
  AiOutlineZoomIn as ZoomIn,
  AiOutlineZoomOut as ZoomOut,
} from "react-icons/ai";
import {
  BiTrash as TrashIcon,
  BiDotsVerticalRounded as DotsIcon,
} from "react-icons/bi";
import {
  MdLightMode as LightMode,
  MdDarkMode as DarkMode,
  MdOutlineLiveHelp as HelpIcon,
} from "react-icons/md";
import {
  MAX_COLUMNS,
  MIN_COLUMNS,
  useDisplayStore,
} from "src/stores/displayStore";
import { applyOpacity } from "src/util/themeUtil";

const OverlayContainer = styled.div`
  position: fixed;

  right: 32px;
  bottom: 24px;

  z-index: 50;
`;

const ITEM_MARGINS_Y = 8;
const ITEM_SIZE = 60;

const OverlayItemStyle = styled.button<{
  keyframes: Keyframes;
  zIndex: number;
}>`
  &:hover {
    cursor: pointer;
  }

  position: relative;
  z-index: ${(props) => props.zIndex};

  display: block;
  margin: ${ITEM_MARGINS_Y}px 2px;

  width: ${ITEM_SIZE}px;
  height: ${ITEM_SIZE}px;
  background-color: ${(props) => props.theme.color.surface};
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.color.surfaceBorder};

  box-shadow: 0 0 5px ${(props) => props.theme.color.shadow};

  transition: background-color 0.1s;

  animation: ${(props) => props.keyframes} 0.3s ease forwards;
`;

/* ----------------------------- Main Component ----------------------------- */

function OverlayItem(props: HTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const parent = ref.current.parentNode;
      const self = ref.current;

      if (parent)
        setIndex(
          parent.children.length -
            Array.prototype.indexOf.call(parent.children, self) -
            1
        );
    }
  }, []);

  const showOverlay = useDisplayStore((state) => state.showOverlay);

  const slideUpFrames = useMemo(() => {
    const pos = index * (ITEM_SIZE + ITEM_MARGINS_Y);

    const hidden = css`
      transform: translateY(${pos}px);
      opacity: ${index === 0 ? 100 : 10}%;
    `;

    const shown = css`
      transform: translateY(0px);
      opacity: 100%;
    `;

    return keyframes`
      from {
        ${showOverlay ? hidden : shown};
      }

      to {
        ${showOverlay ? shown : hidden};
      }
    `;
  }, [index, showOverlay]);

  return (
    <OverlayItemStyle
      ref={ref}
      keyframes={slideUpFrames}
      zIndex={100 - index}
      {...props}
    >
      {props.children}
    </OverlayItemStyle>
  );
}

function OverlayItems() {
  const toggleOverlay = useDisplayStore((state) => state.toggleOverlay);

  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  const [zoomInMax, zoomOutMax] = useDisplayStore((state) => [
    state.columnCount <= MIN_COLUMNS,
    state.columnCount >= MAX_COLUMNS,
  ]);
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
        title="Enter delete mode"
        onClick={toggleEditMode}
      >
        <TrashIcon
          size="24px"
          color={
            editMode === "add" ? theme.color.onSurface : theme.color.danger
          }
        />
      </OverlayItem>
      <OverlayItem onClick={() => setColumnCount(-1)} title="Zoom in">
        <ZoomIn
          size="24px"
          color={
            !zoomInMax
              ? theme.color.onSurface
              : applyOpacity(theme.color.onSurface, 0.5)
          }
        />
      </OverlayItem>
      <OverlayItem onClick={() => setColumnCount(1)} title="Zoom out">
        <ZoomOut
          size="24px"
          color={
            !zoomOutMax
              ? theme.color.onSurface
              : applyOpacity(theme.color.onSurface, 0.5)
          }
        />
      </OverlayItem>
      <OverlayItem
        onClick={toggleTheme}
        style={{ backgroundColor: theme.color.surface }}
        title="Toggle theme"
      >
        {theme === lightTheme ? (
          <LightMode size="24px" color={theme.color.onSurface} />
        ) : (
          <DarkMode size="24px" color={theme.color.onSurface} />
        )}
      </OverlayItem>
      <OverlayItem id="open-gitter-button" title="Ask a question">
        <HelpIcon size="24px" color={theme.color.onSurface} />
      </OverlayItem>
      <OverlayItem onClick={toggleOverlay} title="Toggle overlay menu">
        <DotsIcon size="24px" color={theme.color.onSurface} />
      </OverlayItem>
    </>
  );
}

export default function Overlay() {
  return (
    <OverlayContainer>
      <OverlayItems />
    </OverlayContainer>
  );
}
