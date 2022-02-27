import { useSession } from "next-auth/react";
import React, { useCallback, useRef, useState } from "react";
import {
  ConfirmationDialogue,
  StyledModel,
  StyledPopup,
  StyledTab,
} from "src/components";
import { useStore } from "src/stores/rootStore";
import { useEditMode } from "src/context/EditModeContext";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { AiOutlineCloseCircle as CloseCircle } from "react-icons/ai";
import { deleteTag } from "src/adapters";

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

    fetch(`/api/user/${session.data.user.id}/tags/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then()
      .catch(alert);

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

enum FilteredTagTypes {
  All = "_all",
  Uncategorized = "_untagged",
}

/**
 * Main Component
 */
export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  const [tags, removeTag, _setFilterType, _setFilterTag] = useStore((state) => [
    state.tags,
    state.removeTag,
    state.setFilterType,
    state.setFilterTag,
  ]);
  const { editMode } = useEditMode();
  const session = useSession();

  const [selectedTag, setSelectedTag] = useState<string>(FilteredTagTypes.All);

  const setFilterType = useCallback(
    (type: FilteredTagTypes) => () => {
      if (type === "_all") {
        setSelectedTag(FilteredTagTypes.All);
        _setFilterType("all");
      } else {
        setSelectedTag(FilteredTagTypes.Uncategorized);
        _setFilterType("uncategorized");
      }
    },
    []
  );
  const setFilter = useCallback(
    (tag: TagSchema) => () => {
      setSelectedTag(tag.name);
      _setFilterTag(tag);
    },
    []
  );

  return (
    <StyledTagsPanel>
      <NewTag />
      <Tag
        style={{ width: DEFAULT_TAG_WIDTH }}
        onClick={setFilterType(FilteredTagTypes.All)}
        active={selectedTag === FilteredTagTypes.All}
      >
        All
      </Tag>
      <Tag
        onClick={setFilterType(FilteredTagTypes.Uncategorized)}
        active={selectedTag === FilteredTagTypes.Uncategorized}
      >
        Uncategorized
      </Tag>
      <div style={{ width: "1px", margin: "5px", backgroundColor: "grey" }} />
      {Array.from(tags.values()).map((tag, i) =>
        // Normal mode
        editMode === "add" ? (
          <Tag
            key={i}
            onClick={setFilter(tag)}
            active={selectedTag === tag.name}
          >
            {tag.name} - {tag.images.length}
          </Tag>
        ) : (
          // Delete mode
          <StyledModel
            trigger={
              <Tag
                key={i}
                onClick={() => {}}
                active={selectedTag === tag.name}
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
                    if (selectedTag === tag.name) {
                      setFilterType(FilteredTagTypes.All);
                    }
                    deleteTag(session.data.user.id, tag).then();
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
