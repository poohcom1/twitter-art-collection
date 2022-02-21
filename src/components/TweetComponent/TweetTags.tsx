import _ from "lodash";
import { useSession } from "next-auth/react";
import { useContext, useMemo, useState } from "react";
import { AiOutlinePlusCircle as PlusCircle } from "react-icons/ai";
import { putTags } from "src/adapters";
import SelectedTagContext from "src/context/SelectedTagContext";
import TagsContext from "src/context/TagsContext";
import styled from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";

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

const Tab = styled(StyledTab)`
  padding: 5px 10px;
  margin: 0 5px;

  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

export default function Controls(props: { image: ImageSchema }) {
  const { selectedTag, setSelection } = useContext(SelectedTagContext);
  const { tags } = useContext(TagsContext);

  // As tags is a context used by the entire page, using the context will cause an uncessarily large re-render
  // As setting tags from an tweet component will only affect the control list in the current tweet,
  //  we can use a local state to just update re-render the local tags
  const [, setLocalTags] = useState(tags);

  const tagsValues = Array.from(tags.values());

  const includedTags = useMemo(
    () => tagsValues.filter((tag) => _.find(tag.images, props.image)),
    [props.image, tagsValues]
  );

  const notIncludedTags = useMemo(() => {
    return tagsValues.filter((tag) => !_.find(includedTags, tag));
  }, [includedTags, tagsValues]);

  const session = useSession();

  return (
    <ControlStyles>
      <StyledPopup
        trigger={
          <Tab>
            <StyledButton>
              <PlusCircle size={BUTTON_SIZE} onClick={() => {}} />
            </StyledButton>
          </Tab>
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

                  // Update global tag context, but without setTags to prevent re-render
                  tags.set(tag.name, tag);
                  // Only re-render current tweet
                  setLocalTags(new Map(tags));

                  close();
                }
              }}
            />
          ))
        }
      </StyledPopup>
      {includedTags.map((tag, key) => (
        <Tab
          key={key}
          selected={tag === selectedTag}
          onClick={() => setSelection(tag)}
        >
          {tag.name}
        </Tab>
      ))}
    </ControlStyles>
  );
}
