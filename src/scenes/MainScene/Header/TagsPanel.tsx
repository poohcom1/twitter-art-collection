import { useSession } from "next-auth/react";
import React, { useCallback, useRef, useState } from "react";
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
  margin: auto;
  height: 3em;

  border-radius: 1.5em;

  cursor: pointer;

  border-color: ${(props) =>
    props.color
      ? props.color
      : props.theme.color.primary[props.active ? "textActive" : "default"]};

  & p {
    margin: auto;
    height: fit-content;
    cursor: pointer;
    user-select: none;
  }
`;

const StyledTagsPanel = styled.div`
  display: flex;
  justify-content: start;
`;

/**
 * Create new tag component
 */
function NewTag() {
  const session = useSession();

  const addTag = useStore((state) => state.addTag);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tagName, setTagName] = useState("");
  const [, setError] = useState(false);

  const createTagHandler = (): boolean => {
    if (!session.data) return true;

    if (tagName.length <= 1 || !tagName.match(/^[a-z0-9-]+$/)) {
      setError(true);

      return false;
    }

    const body: PostTagBody = {
      name: tagName,
      images: [],
    };

    addTag(body);

    setTagName("");
    return true;
  };

  const tagInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newString = e.target.value
      .toLowerCase()
      .replace(" ", "-")
      .replace("_", "-");

    if (newString !== "" && !newString.match(/^[a-z0-9-]+$/)) {
      e.preventDefault();
      return;
    }

    setError(false);
    setTagName(newString);
  };

  return (
    <StyledPopup
      trigger={<Tag style={{ width: DEFAULT_TAG_WIDTH }}>+ New</Tag>}
      position="bottom left"
      nested
    >
      {(close: Function) => (
        <input
          ref={inputRef}
          type="text"
          value={tagName}
          onChange={tagInputHandler}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              if (createTagHandler()) close();
            }
          }}
        />
      )}
    </StyledPopup>
  );
}

/**
 * Main Component
 */
export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  const [tags, editMode] = useStore((state) => [state.tags, state.editMode]);

  const [filterType, filterTag] = useStore((state) => [
    state.filterType,
    state.filterTagName,
  ]);

  const [removeTag, setStateFilter] = useStore((state) => [
    state.removeTag,
    state.setFilter,
  ]);

  const session = useSession();

  const setFilter = useCallback(
    (type: FilterTypes, tag?: TagSchema) => () => {
      if (window) {
        document.body.classList.add("wait");
        window.scrollTo(0, 0);
      }

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
      <NewTag />

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
                color={"red"}
              >
                <CloseCircle
                  size={25}
                  style={{ marginRight: "5px", marginLeft: "-5px" }}
                />
                {tag.name}
              </Tag>
            }
            modal
          >
            {/* Delete toggle */}
            {(close: Function) => (
              <ConfirmationDialogue
                title={`Deleting "${tag.name}"`}
                text="Are you sure you want to delete this tag?"
                acceptText="Delete"
                cancelText="Cancel"
                acceptColor={props.theme.color.buttonDanger}
                closeCallback={close}
                onAccept={() => {
                  if (session.data) {
                    removeTag(tag);
                    if (filterType === "tag" && filterTag === tag.name) {
                      setFilter("all");
                    }
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
