import _ from "lodash";
import { useSession } from "next-auth/react";
import { useContext } from "react";
import { AiOutlinePlusCircle as PlusCircle } from "react-icons/ai";
import { putTags } from "src/adapters";
import TagsContext from "src/context/TagsContext";
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

  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--secondary);
  font-weight: 700;

  &:hover {
    background-color: var(--primary-hover);
  }
`;

function updateTag(uid: string, tag: TagSchema, image: ImageSchema) {
  tag.images.push(image);
  putTags(uid, tag).then().catch(console.error);
}

export default function Controls(props: { image: ImageSchema }) {
  const { tags, setTags } = useContext(TagsContext);

  const tagsValues = Array.from(tags.values());

  const includedTags = tagsValues.filter((tag) =>
    _.find(tag.images, props.image)
  );

  const notIncludedTags = tagsValues.filter(
    (tag) => !_.find(includedTags, tag)
  );

  const session = useSession();

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
        {(close: Function) =>
          notIncludedTags.map((tag, key) => (
            <PopupItem
              text={tag.name}
              key={key}
              onClick={() => {
                if (session.data) {
                  tag.images.push(props.image);
                  putTags(session.data.user.id, tag)
                    .then()
                    .catch(console.error);

                  setTags(new Map(tags.set(tag.name, tag)));

                  close();
                }
              }}
            />
          ))
        }
      </StyledPopup>
      {includedTags.map((tag, key) => (
        <StyledTab key={key}>{tag.name}</StyledTab>
      ))}
    </ControlStyles>
  );
}
