import styled from "styled-components";
import TagsPanel from "./HeaderTagsPanel";
import UserSection from "./HeaderUserPanel";
import { useStore } from "src/stores/rootStore";
import { Spinner } from "src/components";
import { BLACKLIST_TAG } from "types/constants";
import { applyOpacity } from "src/util/themeUtil";

const HeaderDiv = styled.div`
  width: 100vw;
  height: 11vh;

  background-color: ${(props) => applyOpacity(props.theme.color.surface, 0.85)};

  box-shadow: 0 0 10px ${(props) => props.theme.color.shadow};

  @supports (backdrop-filter: blur(10px)) {
    background-color: ${(props) =>
      applyOpacity(props.theme.color.surface, 0.4)};
    backdrop-filter: blur(10px);
  }

  z-index: 10;

  padding-top: 5px;
`;

const HeaderFlex = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 30px;
`;

const BlacklistHeader = styled.div`
  background-color: ${(props) => props.theme.color.secondary};
  color: ${(props) => props.theme.color.onSecondary};
  margin: 0;
  padding: 0 40px;

  h3 {
    margin: 0;
  }
`;

export default function Header() {
  const tagsLoaded = useStore((state) => state.tagsStatus);

  const blacklist = useStore(
    (state) =>
      state.selectedLists.length === 1 &&
      state.selectedLists[0] === BLACKLIST_TAG
  );

  return (
    <HeaderDiv>
      <HeaderFlex>
        <UserSection />
        {tagsLoaded === "loaded" ? (
          <TagsPanel />
        ) : (
          <div className="flex-row">
            <Spinner size={30} />
            <h2>Loading tags...</h2>
          </div>
        )}
      </HeaderFlex>
      {blacklist ? (
        <BlacklistHeader>
          <h3>Blacklist</h3>
        </BlacklistHeader>
      ) : (
        <></>
      )}
    </HeaderDiv>
  );
}
