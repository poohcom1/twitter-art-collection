import _ from "lodash";
import { useSession } from "next-auth/react";
import { HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import {
  AiOutlinePlusCircle as PlusCircle,
  AiOutlineCloseCircle as CloseCircle,
} from "react-icons/ai";
import { GiHamburgerMenu as MenuIcon } from "react-icons/gi";
import { putTags } from "src/adapters";
import { useEditMode } from "src/context/EditModeContext";
import { useSelectedTag } from "src/context/SelectedTagContext";
import { useStore } from "src/stores/rootStore";
import styled from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";

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
  const { editMode } = useEditMode();

  const { includedTags, notIncludedTags, addImage, removeImage } = useStore(
    (state) => {
      const tags = Array.from(state.tags.values());

      const includedTags = tags.filter((tag) =>
        tag.images.find((im) => im.id === props.image.id)
      );
      const notIncludedTags = tags.filter(
        (tag) => !tag.images.find((im) => im.id === props.image.id)
      );

      return {
        includedTags,
        notIncludedTags,
        addImage: state.addImage,
        removeImage: state.removeImage,
      };
    }
  );

  const session = useSession();

  const onTagClick = (tag: TagSchema) => {
    if (session.data) {
      addImage(tag, props.image);

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
              <PlusCircle size={BUTTON_SIZE} onClick={() => {}} />
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
                removeImage(tag, props.image);
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
