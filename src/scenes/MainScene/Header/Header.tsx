import styled from "styled-components";
import { AiFillCloseCircle as CloseCircle } from "react-icons/ai";
import TagsPanel from "./HeaderTagsPanel";
import UserSection from "./HeaderUserPanel";
import { LIKED_TWEET_LIST, useStore } from "src/stores/rootStore";
import { BLACKLIST_TAG } from "types/constants";
import { applyOpacity } from "src/util/themeUtil";

const HeaderDiv = styled.div`
  width: 100vw;
  height: fit-content;

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
  width: 100vw;
  display: flex;
  align-items: center;
  padding: 10px 30px;
`;

const BlacklistHeader = styled.div`
  display: flex;

  text-align: center;

  background-color: ${(props) => props.theme.color.secondary};
  color: ${(props) => props.theme.color.onSecondary};
  margin: 0;
  padding: 0 40px;

  h3 {
    margin: 0;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  margin: 4px;
  color: ${(props) => props.theme.color.onSecondary};

  cursor: pointer;
`;

export default function Header() {
  const blacklist = useStore(
    (state) =>
      state.selectedLists.length === 1 &&
      state.selectedLists[0] === BLACKLIST_TAG
  );

  const closeBlacklist = useStore(
    (state) => () => state.setSelectedList([LIKED_TWEET_LIST])
  );

  return (
    <HeaderDiv>
      <HeaderFlex>
        <UserSection />
        <TagsPanel />
      </HeaderFlex>

      {blacklist && (
        <BlacklistHeader>
          <CloseButton className="blank" onClick={closeBlacklist}>
            <CloseCircle size="20px" />
          </CloseButton>

          <h3>Blacklist</h3>
        </BlacklistHeader>
      )}
    </HeaderDiv>
  );
}
