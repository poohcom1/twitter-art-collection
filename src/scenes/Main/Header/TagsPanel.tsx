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

const Tag = forwardRef<
  HTMLDivElement,
  { tag: TagSchema } & React.HTMLProps<HTMLDivElement>
>(function InnerTag(props, ref) {
  return (
    <StyledTag onClick={props.onClick} ref={ref}>
      <p>{props.tag.name}</p>
    </StyledTag>
  );
});

const StyledTagsPanel = styled.div`
  display: flex;
`;

function NewTag() {
  const session = useSession();

  const { tags, setTags } = useContext(TagsContext);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tagName, setTagName] = useState("");

  const createTagHandler = () => {
    if (!session.data) return;

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
  };

  return (
    <StyledPopup
      trigger={<Tag tag={{ name: "+ New", images: [] }} />}
      position="bottom left"
    >
      {(close: Function) => (
        <input
          ref={inputRef}
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              createTagHandler();
              close();
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
        <Tag tag={tag} key={i} />
      ))}
    </StyledTagsPanel>
  );
}
