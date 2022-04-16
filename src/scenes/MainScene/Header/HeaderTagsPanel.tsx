import { useSession } from "next-auth/react";
import React, { useCallback, useRef } from "react";
import {
  ConfirmationDialogue,
  ExpandingInput,
  StyledModel as StyledModal,
  StyledTab,
} from "src/components";
import { useStore, FilterType } from "src/stores/rootStore";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { AiOutlineCloseCircle as CloseCircle } from "react-icons/ai";
import { useAddTag } from "src/hooks/useAddTag";

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
  const addTagRef = useRef<HTMLInputElement>(null);

  const onClick = useCallback(() => {
    if (addTagRef.current !== document.activeElement) {
      addTagRef.current?.select();
    }
  }, []);

  const { inputProps, tagSetText } = useAddTag((_e) => {
    addTagRef.current?.blur();
  });

  return (
    <>
      <Tag
        tabIndex={-1}
        color={props.theme.color.primary}
        textColor={props.theme.color.onPrimary}
        onClick={onClick}
        style={{ display: "block" }}
      >
        <ExpandingInput
          ref={addTagRef}
          placeholder="Add Tag"
          style={{
            color: "white",
            backgroundColor: "transparent",
            outline: "none",
            border: "none",
          }}
          minWidth="5em"
          onBlur={() => tagSetText("")}
          {...inputProps}
        />
      </Tag>
    </>
  );
}

/**
 * Main Component
 */
export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  // Tag
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
        <NewTag theme={props.theme} />

        {tagList.reverse().map((tag, i) =>
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

                      // TODO Make this an option?
                      // Turn off edit mode when deleting tag
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
