import styled, { DefaultTheme, withTheme } from "styled-components";
import TagsPanel from "./HeaderTagsPanel";
import UserSection from "./UserPanel";
import { BiTrash as TrashIcon } from "react-icons/bi";
import { useStore } from "src/stores/rootStore";
import { Spinner } from "src/components";

const HeaderDiv = styled.div`
  width: 100%;
  padding: 10px 30px;
  height: fit-content;

  display: flex;
  align-items: center;

  position: absolute;

  background-color: rgb(255, 255, 255, 0.85);

  @supports (backdrop-filter: blur(10px)) {
    background-color: rgb(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
  }

  z-index: 10;

  box-shadow: 0 0 10px ${(props) => props.theme.color.shadow};

  & * {
    margin: 5px;
  }
`;

export default withTheme(function Header(props: { theme: DefaultTheme }) {
  const tags = useStore((state) => state.tags);
  const tagsLoaded = useStore((state) => state.tagsLoaded);
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  return (
    <HeaderDiv>
      <UserSection />
      {tagsLoaded ? (
        <TagsPanel />
      ) : (
        <div className="flex-row">
          <Spinner size={30} />
          <h2>Loading tags...</h2>
        </div>
      )}
      {/* Trash Icon */}
      <div
        className="center"
        style={{
          marginLeft: "auto",
          justifySelf: "flex-end",
        }}
        onClick={() => toggleEditMode()}
      >
        {Array.from(tags.values()).length > 0 ? (
          <button
            style={{
              display: "flex",
              justifyContent: "center",
              borderColor:
                editMode === "delete"
                  ? props.theme.color.danger
                  : "transparent",
              borderStyle: "solid",
              padding: "8px",
              marginLeft: "auto",
              backgroundColor: "transparent",
            }}
          >
            <TrashIcon
              size={30}
              color={
                editMode === "delete"
                  ? props.theme.color.danger
                  : props.theme.color.secondary
              }
              style={{ margin: "0" }}
            />
          </button>
        ) : (
          <></>
        )}
      </div>
    </HeaderDiv>
  );
});
