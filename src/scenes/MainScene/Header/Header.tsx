import styled, { DefaultTheme, withTheme } from "styled-components";
import TagsPanel from "./HeaderTagsPanel";
import UserSection from "./HeaderUserPanel";
import { BiTrash as TrashIcon } from "react-icons/bi";
import { useStore } from "src/stores/rootStore";
import { Spinner } from "src/components";
import { BLACKLIST_TAG } from "types/constants";
import { applyOpacity } from "src/util/themeUtil";

const HeaderDiv = styled.div`
  width: 100vw;
  height: fit-content;

  position: fixed;

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

const StyledTrashIcon = styled(TrashIcon)`
  &:hover {
    cursor: pointer;
  }
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

export default withTheme(function Header(props: { theme: DefaultTheme }) {
  const tags = useStore((state) => state.tags);
  const tagsLoaded = useStore((state) => state.tagsStatus);
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

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
        {/* Trash Icon */}
        <div
          className="center"
          style={{
            marginLeft: "auto",
            justifySelf: "flex-end",
          }}
          onClick={() => {
            toggleEditMode();
          }}
          data-cy="trash-icon"
        >
          {Array.from(tags.values()).length > 0 ? (
            <StyledTrashIcon
              size={30}
              color={
                editMode === "delete"
                  ? props.theme.color.danger
                  : props.theme.color.onBackground
              }
              style={{ margin: "0" }}
              title="Delete tags"
            />
          ) : (
            <></>
          )}
        </div>
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
});
