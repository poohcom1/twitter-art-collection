import {
  AiOutlineZoomIn as ZoomIn,
  AiOutlineZoomOut as ZoomOut,
} from "react-icons/ai";
import {
  useDisplayStore,
  MIN_COLUMNS,
  MAX_COLUMNS,
} from "src/stores/displayStore";
import { applyOpacity } from "src/util/themeUtil";
import { OverlayItem } from ".";

export function ZoomOverlay() {
  const [zoomInMax, zoomOutMax] = useDisplayStore((state) => [
    state.columnCount <= MIN_COLUMNS,
    state.columnCount >= MAX_COLUMNS,
  ]);
  const setColumnCount = useDisplayStore((state) => state.setColumnCount);

  return (
    <>
      <OverlayItem onClick={() => setColumnCount(-1)} title="Zoom in">
        {(theme) => (
          <ZoomIn
            size="24px"
            color={
              !zoomInMax
                ? theme.color.onSurface
                : applyOpacity(theme.color.onSurface, 0.5)
            }
          />
        )}
      </OverlayItem>
      <OverlayItem onClick={() => setColumnCount(1)} title="Zoom out">
        {(theme) => (
          <ZoomOut
            size="24px"
            color={
              !zoomOutMax
                ? theme.color.onSurface
                : applyOpacity(theme.color.onSurface, 0.5)
            }
          />
        )}
      </OverlayItem>
    </>
  );
}
