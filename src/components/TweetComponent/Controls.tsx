import type { TagCollection, ImageSchema, TagSchema } from "api";
import { AiOutlinePlusCircle as PlusCircle } from "react-icons/ai";
import styled from "styled-components";
import { PopupItem, StyledPopup } from "..";

const BUTTON_SIZE = 35;

const ControlStyles = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledButton = styled.div`
  color: var(--secondary);
  padding: 0;
  margin: 0;
  height: ${BUTTON_SIZE}px;
  width: ${BUTTON_SIZE}px;
`;

const StyledTab = styled.div`
  cursor: pointer;
  background-color: var(--primary);
  padding: 5px 10px;
  margin: 0 5px;

  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  &:hover {
    background-color: var(--primary-hover);
  }
`;

export default function Controls(props: {
  image: ImageSchema;
  tags: TagCollection;
}) {
  const includedTags = Array.from(props.tags.values()).filter((tag) =>
    tag.images.includes(props.image)
  );

  return (
    <ControlStyles>
      <StyledPopup
        trigger={
          <StyledTab>
            <StyledButton>
              <PlusCircle size={BUTTON_SIZE} onClick={() => {}} />
            </StyledButton>
          </StyledTab>
        }
        closeOnDocumentClick
      >
        {Array.from(props.tags.values()).map((tag, key) => (
          <PopupItem text={tag.name} key={key} onClick={() => {}} />
        ))}
      </StyledPopup>
    </ControlStyles>
  );
}
