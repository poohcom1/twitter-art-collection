import _, { truncate } from "lodash";
import { useSession } from "next-auth/react";
import {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlinePlusCircle as PlusCircle } from "react-icons/ai";
import { GiHamburgerMenu as MenuIcon } from "react-icons/gi";
import { putTags } from "src/adapters";
import { useSelectedTag } from "src/context/SelectedTagContext";
import { useTags } from "src/context/TagsContext";
import styled from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";

// TODO Make this a user setting
const DISPATCH_ON_TAGS_ADDED = false;

const BUTTON_SIZE = 35;

type TabContainerProps = InputHTMLAttributes<HTMLDivElement> & {
  overflow?: boolean;
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
    props.overflow
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

  // As tags is a context used by the entire page, using the context will cause an uncessarily large re-render
  // As setting tags from an tweet component will only affect the control list in the current tweet,
  //  we can use a local state to just update re-render the local tags
  const [, setLocalTags] = useState(tags);

  const includedTags = useMemo(
    () =>
      Array.from(tags.values()).filter(
        (tag) => _.find(tag.images, props.image) && tag !== selectedTag // Hiding currently selected tag
      ),
    [props.image, selectedTag, tags]
  );

  const notIncludedTags = useMemo(() => {
    return Array.from(tags.values()).filter(
      (tag) => !_.find(includedTags, tag)
    );
  }, [includedTags, tags]);

  const session = useSession();

  const onTagClick = (tag: TagSchema) => {
    if (session.data) {
      tag.images.push(props.image);
      putTags(session.data.user.id, tag).then().catch(console.error);

      if (DISPATCH_ON_TAGS_ADDED) {
        dispatchTags({
          type: "add_image",
          tag: tag,
          image: props.image,
        });
      } else {
        // Update global tag context, but without setTags to prevent re-render
        tags.set(tag.name, tag);
        // Only re-render current tweet
        setLocalTags(new Map(tags));
      }
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
      <TabContainer ref={tagsContainerRef} overflow={overflow}>
        {includedTags.map((tag, key) => (
          <Tab
            key={key}
            selected={tag === selectedTag}
            onClick={() => setSelection(tag)}
          >
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
