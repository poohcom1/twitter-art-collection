import _ from "lodash";
import { useSession } from "next-auth/react";
import { HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import {
  AiOutlinePlusCircle as PlusCircle,
  AiOutlineCloseCircle as CloseCircle,
} from "react-icons/ai";
import { GiHamburgerMenu as MenuIcon } from "react-icons/gi";
import { putTags, removeImage } from "src/adapters";
import { useEditMode } from "src/context/EditModeContext";
import { useSelectedTag } from "src/context/SelectedTagContext";
import { useTags } from "src/context/TagsContext";
import styled from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";

// TODO Make this a user setting
const SHALLOW_UPDATE = true;

const BUTTON_SIZE = 35;

type TabContainerProps = HTMLAttributes<HTMLDivElement> & {
  overflowing?: boolean;
};

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  overflow: hidden;
`;

const TabContainer = styled.div<TabContainerProps & { overflow?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: start;
  overflow: hidden;
  width: 100%;

  ${(props) =>
    props.overflowing
      ? "mask: linear-gradient(90deg, black 85%, transparent);"
      : ""}
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

export default function TweetTags(props: { image: ImageSchema }) {
  const { selectedTag, setSelection } = useSelectedTag();
  const { tags, dispatchTags } = useTags();
  const { editMode } = useEditMode();

  // As tags is a context used by the entire page, using the context will cause an uncessarily large re-render
  // As setting tags from an tweet component will only affect the control list in the current tweet,
  //  we can use a local state to just update re-render the local tags
  const [localTags, setLocalTags] = useState(tags);

  const getTags = useMemo(
    () => (SHALLOW_UPDATE ? localTags : tags),
    [localTags, tags]
  );

  const includedTags = useMemo(() => {
    const filtered = Array.from(getTags.values()).filter(
      (tag) => _.find(tag.images, props.image) && tag !== selectedTag // Skip currently selected tag
    );
    return selectedTag ? [selectedTag, ...filtered] : filtered; // Add selected tag in front
  }, [getTags, props.image, selectedTag]);

  const notIncludedTags = useMemo(() => {
    return Array.from(getTags.values()).filter(
      (tag) => !_.find(includedTags, tag)
    );
  }, [getTags, includedTags]);

  const session = useSession();

  const onTagClick = (tag: TagSchema) => {
    if (session.data) {
      // TODO Count doesn't update
      dispatchTags({
        type: "add_image",
        tag: tag,
        image: props.image,
        shallow: SHALLOW_UPDATE,
      });

      if (SHALLOW_UPDATE) {
        setLocalTags(new Map(localTags));
      }

      putTags(session.data.user.id, tag).then().catch(console.error);

      return true;
    }

    return false;
  };

  // Overflow detection
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    if (tagsContainerRef.current) {
      setOverflow(
        tagsContainerRef.current.offsetWidth <
        tagsContainerRef.current.scrollWidth
      );
    }
  }, []);

  return (
    <MainContainer>
      <StyledPopup
        trigger={
          <Tab>
            <StyledButton>
              <PlusCircle size={BUTTON_SIZE} onClick={() => { }} />
            </StyledButton>
          </Tab>
        }
        closeOnDocumentClick
      >
        {(close: Function) =>
          notIncludedTags.length > 0 ? (
            notIncludedTags.map((tag, key) => (
              <PopupItem
                text={tag.name}
                key={key}
                onClick={() => {
                  if (onTagClick(tag)) {
                    close();
                  }
                }}
              />
            ))
          ) : (
            <p>No more tags!</p>
          )
        }
      </StyledPopup>
      <TabContainer ref={tagsContainerRef} overflowing={overflow}>
        {includedTags.map((tag, key) => (
          <Tab
            color={editMode !== "delete" ? undefined : "red"}
            key={key}
            active={tag === selectedTag}
            onClick={() => {
              if (editMode !== "delete") {
                setSelection(tag);
              } else if (session.data) {
                removeImage(session.data.user.id, tag, props.image).then();

                dispatchTags({
                  type: "remove_image",
                  tag: tag,
                  image: props.image,
                  shallow: SHALLOW_UPDATE && selectedTag !== tag,
                });

                if (SHALLOW_UPDATE) {
                  setLocalTags(new Map(localTags));
                }
              }
            }}
          >
            {editMode === "delete" ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginRight: "5px",
                }}
              >
                <CloseCircle size={20} />
              </div>
            ) : (
              <></>
            )}
            {tag.name}
          </Tab>
        ))}
      </TabContainer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: "auto",
        }}
        draggable={true}
      >
        <MenuIcon size={30} />
      </div>
    </MainContainer>
  );
}
