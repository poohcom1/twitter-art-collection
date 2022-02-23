import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";
import {
  ConfirmationDialogue,
  StyledModel,
  StyledPopup,
  StyledTab,
} from "src/components";
import { useSelectedTag } from "src/context/SelectedTagContext";
import { useTags } from "src/context/TagsContext";
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

function NewTag() {
  const session = useSession();

  const { dispatchTags } = useTags();

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

    dispatchTags({ type: "add_tag", tag: body });

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

export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  const { tags, dispatchTags } = useTags();
  const { selectedTag, setSelection, inverted } = useSelectedTag();
  const { editMode } = useEditMode();
  const session = useSession();

  return (
    <StyledTagsPanel>
      <NewTag />
      <Tag
        style={{ width: DEFAULT_TAG_WIDTH }}
        onClick={() => setSelection(undefined, false)}
        active={!selectedTag && !inverted}
      >
        All
      </Tag>
      <Tag
        onClick={() => setSelection(undefined, true)}
        active={!selectedTag && inverted}
      >
        Uncategorized
      </Tag>
      <div style={{ width: "1px", margin: "5px", backgroundColor: "grey" }} />
      {Array.from(tags.values()).map((tag, i) =>
        // Normal mode
        editMode === "add" ? (
          <Tag
            key={i}
            onClick={() => setSelection(tag)}
            active={selectedTag === tag}
          >
            {tag.name} - {tag.images.length}
          </Tag>
        ) : (
          // Delete mode
          <StyledModel
            trigger={
              <Tag
                key={i}
                onClick={() => { }}
                active={selectedTag === tag}
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
                    dispatchTags({ type: "remove_tag", tag: tag });
                    if (selectedTag === tag) {
                      setSelection(undefined);
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
