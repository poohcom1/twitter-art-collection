import { useSession } from "next-auth/react";
import styled from "styled-components";
import { useContext } from "react";
import TagsPanel from "./TagsPanel";
import UserSection from "./UserPanel";
import TagsContext from "src/context/TagsContext";

const SearchDiv = styled.input`
  flex-grow: 1;
  padding: 15px;
  border-radius: 50px;
  border-width: 0;
  background-color: var(--bg-primary);

  &:focus {
    outline: none;
    background-color: var(--hover);
  }
`;

const HeaderDiv = styled.div<{ height: number }>`
  background-color: var(--bg-secondary);
  width: 100%;
  height: ${(props) => props.height}px;

  padding: 30px 30px 0 30px;

  position: fixed;
  z-index: 10;

  box-shadow: 0 0 10px #00000068;

  & * {
    margin-left: 5px;
  }
`;

function SearchBar() {
  return <SearchDiv type="search" placeholder="Search" />;
}

export default function Header(props: { height: number }) {
  const session = useSession();
  let { tags, setTags } = useContext(TagsContext);

  return (
    <div>
      <HeaderDiv height={props.height}>
        <div style={{ display: "flex" }}>
          <UserSection />
          <SearchBar />
        </div>
        <TagsPanel tags={tags} />
      </HeaderDiv>
    </div>
  );
}
