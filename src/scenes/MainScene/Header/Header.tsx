import styled from "styled-components";
import TagsPanel from "./TagsPanel";
import UserSection from "./UserPanel";
import { useEditMode } from "src/context/EditModeContext";
import { BiTrash as TrashIcon } from "react-icons/bi";

const SearchDiv = styled.input`
  flex-grow: 1;
  padding: 15px;
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

  padding: 30px 30px 0 30px;

  position: fixed;
  z-index: 10;

  box-shadow: 0 0 10px ${(props) => props.theme.color.shadow};

  & * {
    margin-left: 5px;
  }
`;

function SearchBar() {
  return <SearchDiv type="search" placeholder="Search" />;
}

export default function Header(props: { height: number }) {
  const { editMode, setEditMode } = useEditMode();

  return (
    <HeaderDiv height={props.height}>
      <div style={{ display: "flex" }}>
        <UserSection />
        <SearchBar />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <TagsPanel />
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            justifyContent: "center",
          }}
          onClick={() => setEditMode(editMode === "delete" ? "add" : "delete")}
        >
          <TrashIcon
            size={30}
            color={editMode === "delete" ? "red" : "black"}
          />
        </div>
      </div>
    </HeaderDiv>
  );
}
