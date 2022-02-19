import { TagSchema } from "api";
import styled from "styled-components";

const StyledTag = styled.div`
  padding: 3px 10px;
  margin: 10px;
  height: 3em;

  display: flex;

  align-items: center;

  background-color: aliceblue;
  border-radius: 1.5em;

  cursor: pointer;

  & p {
    margin: auto;
    height: fit-content;
    cursor: pointer;
  }

  &:hover {
    background-color: grey;
  }
`;

function Tag(props: { tag: TagSchema }) {
  return (
    <StyledTag>
      <p>{props.tag.name}</p>
    </StyledTag>
  );
}

const StyledTagsPanel = styled.div`
  display: flex;
`;

export default function TagsPanel(props: { tags: Array<TagSchema> }) {
  return (
    <StyledTagsPanel>
      <Tag tag={{ name: "+New tag", images: [] }} />
      {props.tags.map((tag, i) => (
        <Tag tag={tag} key={i} />
      ))}
    </StyledTagsPanel>
  );
}
