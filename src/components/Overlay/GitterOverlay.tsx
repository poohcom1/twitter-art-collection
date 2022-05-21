import { MdOutlineLiveHelp as HelpIcon } from "react-icons/md";
import { OverlayItem } from ".";

export function GitterOverlay() {
  return (
    <OverlayItem id="open-gitter-button" title="Ask a question">
      {(theme) => <HelpIcon size="24px" color={theme.color.onSurface} />}
    </OverlayItem>
  );
}
