import { useSession } from "next-auth/react";
import styled from "styled-components";
import { useContext } from "react";
import TagsPanel from "./TagsPanel";
import UserSection from "./UserPanel";
import { useTags } from "src/context/TagsContext";

const SearchDiv = styled.input`
  flex-grow: 1;
  padding: 15px;
  border-radius: 50px;
  border-width: 0;
  color: ${(props) => props.theme.color.field.text};
  background-color: ${(props) => props.theme.color.field.main};

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
  return (
    <div>
      <HeaderDiv height={props.height}>
        <div style={{ display: "flex" }}>
          <UserSection />
          <SearchBar />
        </div>
        <TagsPanel />
      </HeaderDiv>
    </div>
  );
}
