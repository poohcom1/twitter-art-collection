import { useSession } from "next-auth/react";
import React, { forwardRef, useContext, useRef, useState } from "react";
import { StyledPopup } from "src/components";
import TagsContext from "src/context/TagsContext";
import styled from "styled-components";

const StyledTag = styled.div<React.HTMLProps<HTMLDivElement>>`
  padding: 3px 10px;
  margin: 10px;
  height: 3em;

  display: flex;

  align-items: center;

  color: var(--secondary);
  background-color: var(--primary);
  font-weight: 700;

  border-radius: 1.5em;

  cursor: pointer;

  & p {
    margin: auto;
    height: fit-content;
    cursor: pointer;
  }

  &:hover {
    background-color: var(--primary-hover);
  }
`;

const Tag = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function InnerTag(props, ref) {
    return (
      <StyledTag onClick={props.onClick} ref={ref}>
        {props.children}
      </StyledTag>
    );
  }
);

const StyledTagsPanel = styled.div`
  display: flex;
`;

function NewTag() {
  const session = useSession();

  const { tags, setTags } = useContext(TagsContext);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState(false);

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

    tags.set(body.name, body);

    setTags(new Map(tags));

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
      trigger={<Tag style={{ width: 50 }}>+ New</Tag>}
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

export default function TagsPanel(props: { tags: TagCollection }) {
  return (
    <StyledTagsPanel>
      <NewTag />
      {Array.from(props.tags.values()).map((tag, i) => (
        <Tag key={i}>{tag.name}</Tag>
      ))}
    </StyledTagsPanel>
  );
}
