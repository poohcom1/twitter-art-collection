import styled, { DefaultTheme, withTheme } from "styled-components";
import TagsPanel from "./HeaderTagsPanel";
import UserSection from "./UserPanel";
import { BiTrash as TrashIcon } from "react-icons/bi";
import { useStore } from "src/stores/rootStore";

const SearchDiv = styled.input`
  flex-grow: 1;
  padding: 8px;
  border-radius: 50px;
  border-width: 0;
  color: ${(props) => props.theme.color.field.text};
  background-color: ${(props) => props.theme.color.field.default};

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.color.field.hover};
  }
`;

const HeaderDiv = styled.div<{ height: number }>`
  background-color: ${(props) => props.theme.color.bg.secondary};
  width: 100%;
  height: ${(props) => props.height}px;

  display: flex;

  position: fixed;
  z-index: 10;

  box-shadow: 0 0 10px ${(props) => props.theme.color.shadow};

  & * {
    margin: 5px;
  }
`;

function SearchBar() {
  return <SearchDiv type="search" placeholder="Search" />;
}

export default withTheme(function Header(props: {
  height: number;
  theme: DefaultTheme;
}) {
  const { tags, editMode, toggleEditMode } = useStore();

  const { height, theme } = props;

  return (
    <HeaderDiv height={height}>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <UserSection />
        <TagsPanel />
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            justifyContent: "center",
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
                    ? theme.color.buttonDanger.default
                    : "transparent",
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
                    ? theme.color.buttonDanger.default
                    : "black"
                }
                style={{ margin: "0" }}
              />
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </HeaderDiv>
  );
});
