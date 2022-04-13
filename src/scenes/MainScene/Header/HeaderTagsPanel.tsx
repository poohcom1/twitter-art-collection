import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  AddTag,
  ConfirmationDialogue,
  StyledModel as StyledModal,
  StyledPopup,
  StyledTab,
} from "src/components";
import { useStore, FilterType, isFilterType } from "src/stores/rootStore";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { AiOutlineCloseCircle as CloseCircle } from "react-icons/ai";
import { useRouter } from "next/router";

const DEFAULT_TAG_WIDTH = "75px";

const Tag = styled(StyledTab)`
  padding: 3px 10px;
  height: 3em;

  border-radius: 1.5em;

  cursor: pointer;

  & p {
    margin: auto;
    height: fit-content;
    cursor: pointer;
    user-select: none;
  }
`;

const StyledTagsPanel = styled.div`
  margin-left: 16px;
  display: flex;
  justify-content: start;
  align-items: start;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  width: 65vw;

  overflow-x: auto;
  scrollbar-width: thin; /* Firefox */

  margin-bottom: 0;

  &::-webkit-scrollbar {
    height: 7px;
  }

  ::-webkit-scrollbar-thumb {
    background: lightgray;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: grey;
  }
`;

/**
 * Create new tag component
 */
function NewTag(props: { theme: DefaultTheme }) {
  return (
    <StyledPopup
      trigger={useMemo(
        () => (
          <Tag
            style={{ width: DEFAULT_TAG_WIDTH }}
            color={props.theme.color.primary}
            textColor={props.theme.color.onPrimary}
          >
            + New
          </Tag>
        ),
        [props.theme.color.onPrimary, props.theme.color.primary]
      )}
      position="bottom left"
      nested
    >
      {(close: () => void) => <AddTag onFinish={close} />}
    </StyledPopup>
  );
}

/**
 * Main Component
 */
export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  // Tag
  const tags = useStore((state) => state.tags);
  const tagList = useStore((state) => state.getTagList());
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  const [filterType, filterTag] = useStore((state) => [
    state.filterType,
    state.filterTagName,
  ]);

  const removeTag = useStore((state) => state.removeTag);
  const setStateFilter = useStore((state) => state.setFilter);

  const session = useSession();

  // URL query
  const router = useRouter();

  useEffect(() => {
    const filter: string = router.query.filter as string;
    const tag: string = router.query.tag as string;

    if (isFilterType(filter) && tags.has(tag)) {
      setStateFilter({ type: filter, tag: tags.get(tag)! });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // create filter reducers
  const setFilter = useCallback(
    (type: FilterType, tag?: TagSchema) => () => {
      if (type === "all") {
        setStateFilter({ type: "all" });
      } else if (type === "uncategorized") {
        setStateFilter({ type: "uncategorized" });
      } else {
        setStateFilter({ type: "tag", tag: tag! });
      }

      window.history.replaceState(
        null,
        "",
        `?filter=${type}${type === "tag" ? "&tag=" + tag!.name : ""}`
      );
    },
    [setStateFilter]
  );

  return (
    <StyledTagsPanel>
      <StyledTagsPanel>
        <NewTag theme={props.theme} />

        {/* Special filters Section */}
        <Tag
          style={{ width: DEFAULT_TAG_WIDTH }}
          onClick={setFilter("all")}
          active={filterType === "all"}
        >
          All
        </Tag>
        <Tag
          onClick={setFilter("uncategorized")}
          active={filterType === "uncategorized"}
        >
          Uncategorized
        </Tag>
      </StyledTagsPanel>

      <div
        style={{
          minWidth: "1px",
          height: "50px",
          margin: "5px",
          backgroundColor: "grey",
        }}
      />

      {/* Tags section */}
      <TagsContainer>
        {tagList.map((tag, i) =>
          // Normal mode
          editMode === "add" ? (
            <Tag
              style={{ whiteSpace: "nowrap" }}
              key={i}
              onClick={setFilter("tag", tag)}
              active={filterType === "tag" && filterTag === tag.name}
            >
              {tag.name} - {tag.images.length}
            </Tag>
          ) : (
            // Delete mode
            <StyledModal
              trigger={
                <Tag
                  key={i}
                  active={filterType === "tag" && filterTag === tag.name}
                  color={props.theme.color.danger}
                >
                  {tag.name}
                  <CloseCircle
                    size={25}
                    style={{ marginLeft: "8px", marginRight: "-3px" }}
                  />
                </Tag>
              }
              modal
            >
              {/* Delete toggle */}
              {(close: () => void) => (
                <ConfirmationDialogue
                  title={`Deleting "${tag.name}"`}
                  text="Are you sure you want to delete this tag?"
                  acceptText="Delete"
                  cancelText="Cancel"
                  acceptColor={props.theme.color.danger}
                  closeCallback={close}
                  onAccept={() => {
                    if (session.data) {
                      removeTag(tag);
                      if (filterType === "tag" && filterTag === tag.name) {
                        setFilter("all");
                      }
                      // Turn off edit mode when deleting tag
                      // TODO Make this an option?
                      toggleEditMode();
                      close();
                    }
                  }}
                />
              )}
            </StyledModal>
          )
        )}
      </TagsContainer>
    </StyledTagsPanel>
  );
});
