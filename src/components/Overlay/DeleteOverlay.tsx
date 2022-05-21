import { BiTrash as TrashIcon } from "react-icons/bi";
import { useStore } from "src/stores/rootStore";
import { OverlayItem } from ".";

export function DeleteOverlay() {
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <OverlayItem
      id="headerDeleteMode"
      className="center overlay__deleteMode"
      title="Enter delete mode"
      onClick={toggleEditMode}
    >
      {(theme) => (
        <TrashIcon
          size="24px"
          color={
            editMode === "add" ? theme.color.onSurface : theme.color.danger
          }
        />
      )}
    </OverlayItem>
  );
}
