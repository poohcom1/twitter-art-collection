import { useSession } from "next-auth/react";
import React from "react";
import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AiOutlinePlusCircle as PlusCircle,
  AiOutlineCloseCircle as CloseCircle,
} from "react-icons/ai";
import { GiHamburgerMenu as MenuIcon } from "react-icons/gi";
import { useStore } from "src/stores/rootStore";
import { arrayEqual, imageEqual } from "src/utils/objectUtils";
import styled, {
  DefaultTheme,
  ISwitchPalette,
  withTheme,
} from "styled-components";
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

const StyledAddButton = styled.div`
  color: ${(props) => props.theme.color.tab.color};
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
  border-width: 0;
`;

/**
 * Add image component
 */
function AddImagesPopupListItem(
  props: {
    tag: TagSchema;
    image: TweetSchema;
    close: () => void;
    keyNum: string | number;
  } & React.HTMLProps<HTMLDivElement>
) {
  const session = useSession();
  const addImage = useStore((state) => state.addImage);

  const onClick = useCallback(() => {
    if (session.data) {
      addImage(props.tag, props.image);

      props.close();
    }
  }, [addImage, props, session.data]);

  return (
    <PopupItem text={props.tag.name} key={props.keyNum} onClick={onClick} />
  );
}

/**
 * Main Component
 * @param props
 * @returns
 */
export default withTheme(function TweetTags(props: {
  image: TweetSchema;
  theme: DefaultTheme;
}) {
  const session = useSession();
  //
  const editMode = useStore((state) => state.editMode);

  // Get filter
  const filterTag = useStore((state) => state.filterTagName);

  // Get filter actions
  const [removeImage, setFilter] = useStore((state) => [
    state.removeImage,
    state.setFilter,
  ]);

  // Get tags for image
  const [includedTags, notIncludedTags] = useStore(
    useCallback(
      (state) => {
        const tags = Array.from(state.tags.values());

        const includedTags = tags.filter((tag) =>
          tag.images.find((im) => imageEqual(im, props.image))
        );
        const notIncludedTags = tags.filter(
          (tag) => !tag.images.find((im) => imageEqual(im, props.image))
        );

        return [includedTags, notIncludedTags];
      },
      [props.image]
    ),
    (prevState, nextState) => {
      // Ignore inner image changes
      return (
        arrayEqual(
          prevState[1].map((tag) => tag.name),
          nextState[1].map((tag) => tag.name)
        ) &&
        arrayEqual(
          prevState[0].map((tag) => tag.name),
          nextState[0].map((tag) => tag.name)
        )
      );
    }
  );

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
      {/* Add image to tag section */}
      <StyledPopup
        trigger={useMemo(
          () => (
            <Tab>
              <StyledAddButton>
                <PlusCircle size={BUTTON_SIZE} />
              </StyledAddButton>
            </Tab>
          ),
          []
        )}
        closeOnDocumentClick
      >
        {(close: () => void) =>
          notIncludedTags.map((tag) => (
            <AddImagesPopupListItem
              key={tag.name}
              keyNum={tag.name}
              tag={tag}
              image={props.image}
              close={close}
            />
          ))
        }
      </StyledPopup>
      {/* Included tags section */}
      <TabContainer ref={tagsContainerRef} overflowing={overflow}>
        {includedTags.map((tag) => (
          <Tab
            palette={
              editMode !== "delete"
                ? undefined
                : (props.theme.color.buttonDanger as ISwitchPalette)
            }
            key={tag.name}
            active={filterTag === tag.name}
            onClick={() => {
              if (editMode !== "delete") {
                setFilter({ type: "tag", tag: tag });
              } else if (session.data) {
                removeImage(tag, props.image);
              }
            }}
          >
            {editMode === "delete" ? (
              <CloseCircle
                style={{ marginRight: "5px" }}
                className="center"
                size={20}
              />
            ) : (
              <></>
            )}
            {tag.name}
          </Tab>
        ))}
      </TabContainer>
      {/* TODO Hamburger menu */}
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
});
