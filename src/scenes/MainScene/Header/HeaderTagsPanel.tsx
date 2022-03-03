import { useSession } from "next-auth/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ConfirmationDialogue,
  StyledModel,
  StyledPopup,
  StyledTab,
} from "src/components";
import { useStore, FilterTypes } from "src/stores/rootStore";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { AiOutlineCloseCircle as CloseCircle } from "react-icons/ai";

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
`;

/**
 * Create new tag component
 */
function NewTag(props: { theme: DefaultTheme }) {
  const session = useSession();

  const addTag = useStore((state) => state.addTag);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tagName, setTagName] = useState("");

  const tagInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newString = e.target.value
      .toLowerCase()
      .replace(" ", "-")
      .replace("_", "-");

    if (newString !== "" && !newString.match(/^[a-z0-9-]+$/)) {
      e.preventDefault();
      return;
    }

    setTagName(newString);
  };

  const inputDiv = useCallback(
    (close: () => void) => (
      <input
        ref={inputRef}
        type="text"
        value={tagName}
        onChange={tagInputHandler}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            if (!session.data) return true;

            if (tagName.length <= 1 || !tagName.match(/^[a-z0-9-]+$/)) {
              // TODO Error

              return;
            }

            const body: PostTagBody = {
              name: tagName,
              images: [],
            };

            addTag(body);

            setTagName("");
            close();
          }
        }}
      />
    ),
    [addTag, session.data, tagName]
  );

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
      {inputDiv}
    </StyledPopup>
  );
}

/**
 * Main Component
 */
export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  const tags = useStore((state) => state.tags);
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
    (type: FilterTypes, tag?: TagSchema) => () => {
      if (type === "all") {
        setStateFilter({ type: "all" });
      } else if (type === "uncategorized") {
        setStateFilter({ type: "uncategorized" });
      } else {
        setStateFilter({ type: "tag", tag: tag! });
      }
    },
    [setStateFilter]
  );

  return (
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

      <div style={{ width: "1px", margin: "5px", backgroundColor: "grey" }} />

      {/* Tags section */}
      {Array.from(tags.values()).map((tag, i) =>
        // Normal mode
        editMode === "add" ? (
          <Tag
            key={i}
            onClick={setFilter("tag", tag)}
            active={filterType === "tag" && filterTag === tag.name}
          >
            {tag.name} - {tag.images.length}
          </Tag>
        ) : (
          // Delete mode
          <StyledModel
            trigger={
              <Tag
                key={i}
                active={filterType === "tag" && filterTag === tag.name}
                color={props.theme.color.danger}
              >
                {tag.name}
                <CloseCircle
                  size={25}
                  style={{ marginLeft: "5px", marginRight: "-5px" }}
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
          </StyledModel>
        )
      )}
    </StyledTagsPanel>
  );
});
