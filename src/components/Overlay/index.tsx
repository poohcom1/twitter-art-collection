import {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, {
  css,
  DefaultTheme,
  Keyframes,
  keyframes,
  useTheme,
} from "styled-components";
import { BiDotsVerticalRounded as DotsIcon } from "react-icons/bi";
import { useDisplayStore } from "src/stores/displayStore";
import { GitterOverlay } from "./GitterOverlay";
import { ThemeOverlay } from "./ThemeOverlay";
import { ZoomOverlay } from "./ZoomOverlay";
import { DeleteOverlay } from "./DeleteOverlay";
import useMediaQuery from "src/hooks/useMediaQuery";

const OverlayContainerDiv = styled.div`
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

function OverlayItem(
  props: HTMLAttributes<HTMLButtonElement> & {
    children: ReactNode | ((theme: DefaultTheme) => ReactNode);
  }
) {
  const ref = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery();

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
  }, [isMobile]);

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
      {typeof props.children === "function"
        ? props.children(theme)
        : props.children}
    </OverlayItemStyle>
  );
}

function OverlayContainer(props: PropsWithChildren<unknown>) {
  const toggleOverlay = useDisplayStore((state) => state.toggleOverlay);

  return (
    <OverlayContainerDiv>
      {props.children}
      <OverlayItem onClick={toggleOverlay} title="Toggle overlay menu">
        {(theme) => <DotsIcon size="24px" color={theme.color.onSurface} />}
      </OverlayItem>
    </OverlayContainerDiv>
  );
}

export {
  OverlayContainer,
  OverlayItem,
  GitterOverlay,
  ZoomOverlay,
  ThemeOverlay,
  DeleteOverlay,
};
