import { MouseEventHandler } from "react";
import { useDisplayStore } from "src/stores/displayStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useContextMenu<T extends any[]>(
  children: (...args: T) => JSX.Element
): [(...args: T) => MouseEventHandler<HTMLElement>, () => void] {
  const showContextMenu = useDisplayStore(
    (state) =>
      (...params: T): MouseEventHandler<HTMLElement> =>
      (e) => {
        e.preventDefault();
        state.showContextMenu(
          { left: e.clientX, top: e.clientY },
          children(...params)
        );
      }
  );

  const hideContextMenu = useDisplayStore((state) => state.hideContextMenu);

  return [showContextMenu, hideContextMenu];
}
