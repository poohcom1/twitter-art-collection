import { useEffect } from "react";
import { useDisplayStore } from "src/stores/displayStore";
import { applyOpacity } from "src/util/themeUtil";
import styled from "styled-components";

const ContextMenuDiv = styled.div`
  position: fixed;
  z-index: 20;

  width: fit-content;
  min-width: 8rem;

  padding: 0;
  border-radius: 2px;
  overflow: hidden;

  color: ${(props) => props.theme.color.onSurface};
  background-color: ${(props) => props.theme.color.surface};
  border: 1px solid ${(props) => props.theme.color.surfaceBorder};
`;

export default function ContextMenu() {
  const [visible, position, children] = useDisplayStore((state) => [
    state.contextMenuVisible,
    state.contextMenuPosition,
    state.contextMenuComponents,
  ]);

  const hideContextMenu = useDisplayStore((state) => state.hideContextMenu);

  useEffect(() => {
    document.addEventListener("click", hideContextMenu);

    return () => document.removeEventListener("click", hideContextMenu);
  }, [hideContextMenu]);

  if (!visible) {
    return <></>;
  }

  return <ContextMenuDiv style={position}>{children}</ContextMenuDiv>;
}

export const ContextMenuItem = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-size: large;

  height: 40px;
  width: 100%;
  padding: 2px 8px;
  border: none;

  color: ${(props) => props.theme.color.onSurface};
  background-color: transparent;

  &:hover {
    background-color: ${(props) =>
      applyOpacity(props.theme.color.onSurface, 0.2)};
  }
`;

export const ContextMenuIcon = styled.div`
  margin-right: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: large;
`;
