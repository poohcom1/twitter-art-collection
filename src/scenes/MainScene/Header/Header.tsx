import styled, { DefaultTheme, withTheme } from "styled-components";
import TagsPanel from "./HeaderTagsPanel";
import UserSection from "./UserPanel";
import { BiTrash as TrashIcon } from "react-icons/bi";
import { useStore } from "src/stores/rootStore";
import { Spinner } from "src/components";

// const SearchDiv = styled.input`
//   flex-grow: 1;
//   padding: 8px;
//   border-radius: 50px;
//   border-width: 0;
//   color: ${(props) => props.theme.color.field.color};
//   background-color: ${(props) => props.theme.color.field.bgColor};

//   &:focus {
//     outline: none;
//     background-color: ${(props) => props.theme.color.field.bgHover};
//   }
// `;

const HeaderDiv = styled.div`
  background-color: ${(props) => props.theme.color.surface};
  width: 100%;
  padding: 10px 30px;
  height: fit-content;

  display: flex;
  align-items: center;

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

  const { theme } = props;

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
                editMode === "delete" ? theme.color.danger : "transparent",
              borderStyle: "solid",
              padding: "8px",
              marginLeft: "auto",
              backgroundColor: "white",
            }}
          >
            <TrashIcon
              size={30}
              color={
                editMode === "delete"
                  ? theme.color.danger
                  : theme.color.secondary
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
