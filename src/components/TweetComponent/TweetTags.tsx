import { useSession } from "next-auth/react";
import React, {
  RefObject,
  HTMLAttributes,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  AiOutlinePlusCircle as PlusCircle,
  AiOutlineCloseCircle as CloseCircle,
} from "react-icons/ai";
import { MdOutlineImageSearch as MenuIcon } from "react-icons/md";
import {
  GoTriangleLeft as Left,
  GoTriangleRight as Right,
} from "react-icons/go";
import Popup from "reactjs-popup";
import { useStore } from "src/stores/rootStore";
import { arrayEqual, imageEqual } from "src/util/objectUtil";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";
import { useOverflowDetector } from "src/hooks/useOverflowDetector";
import Image from "next/image";
import AddTag from "../AddTag/AddTag";
import { BLACKLIST_TAG } from "types/constants";

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
  padding: 0;
  margin: 0;
  height: ${BUTTON_SIZE}px;
  width: ${BUTTON_SIZE}px;
`;

/**
 * Tab with lower border radius removed
 */
const Tab = styled(StyledTab)`
  padding: 5px 10px;
  margin: 0 5px;

  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-width: 0;
`;

// Preview image modal styles
const StyledModal = styled(Popup)`
  &-overlay {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const StyledMenuIcon = styled.div`
  display: "flex";
  align-items: "center";
  margin-left: "auto";

  &:hover {
    cursor: pointer;
  }
`;

const ModalClickableDiv = styled.div<{ show: number }>`
  &:hover {
    cursor: ${(props) => (props.show ? "pointer" : "auto")};
    background-color: ${(props) =>
      props.show ? "rgba(255, 255, 255, 0.2)" : "transparent"};
  }
  width: 20vh;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BlacklistButton = styled.p`
  color: red;
  margin: 0;
  padding: 0;
`;

/* ------------------------------- Components ------------------------------- */

function AddImagesButton(props: {
  image: ImageSchema;
  theme: DefaultTheme;
  forceDeleteMode: boolean;
}) {
  const deleteMode =
    useStore(
      (state) => state.editMode === "delete" && state.filterType === "tag"
    ) || props.forceDeleteMode;

  // Remove image from current tag
  const removeImageCallback = useStore((state) => () => {
    const currentTag = state.tags.get(state.filterTagName);
    if (currentTag) {
      state.removeImage(currentTag, props.image);
    }
  });

  return (
    <Tab
      color={!deleteMode ? undefined : props.theme.color.danger}
      title={!deleteMode ? "Add image to tag" : "Remove image from current tag"}
    >
      <StyledAddButton onClick={!deleteMode ? undefined : removeImageCallback}>
        {!deleteMode ? (
          <PlusCircle size={BUTTON_SIZE} />
        ) : (
          <CloseCircle size={BUTTON_SIZE} />
        )}
      </StyledAddButton>
    </Tab>
  );
}

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
      props.close();

      addImage(props.tag, props.image);
    }
  }, [addImage, props, session.data]);

  return (
    <PopupItem key={props.keyNum} onClick={onClick}>
      {props.tag.name}
    </PopupItem>
  );
}

/**
 * Preview image modal
 * @param props
 * @returns
 */
function PreviewImage(
  props: { imageSrcs: string[] } & React.HTMLProps<HTMLDivElement>
) {
  const [imageIndex, setImageIndex] = useState(0);

  const leftCallback = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      if (imageIndex > 0) {
        setImageIndex(imageIndex - 1);
      }
    },
    [imageIndex]
  );

  const rightCallback = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      if (imageIndex < props.imageSrcs.length - 1) {
        setImageIndex(imageIndex + 1);
      }
    },
    [imageIndex, props.imageSrcs.length]
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100vw",
      }}
      onClick={props.onClick}
    >
      <ModalClickableDiv
        onClick={imageIndex > 0 ? leftCallback : close}
        show={imageIndex > 0 ? 1 : 0}
      >
        <Left color={imageIndex > 0 ? "lightgrey" : "transparent"} size={80} />
      </ModalClickableDiv>
      <div
        style={{
          height: "80vh",
          width: "80vw",
          position: "relative",
        }}
        className="center"
      >
        <Image
          src={props.imageSrcs[imageIndex]}
          alt="Tweet image"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <ModalClickableDiv
        onClick={
          imageIndex < props.imageSrcs.length - 1 ? rightCallback : close
        }
        show={imageIndex < props.imageSrcs.length - 1 ? 1 : 0}
      >
        <Right
          color={
            imageIndex < props.imageSrcs.length - 1
              ? "lightgrey"
              : "transparent"
          }
          size={80}
        />
      </ModalClickableDiv>
    </div>
  );
}

/* ----------------------------- Main Component ----------------------------- */

/**
 * Main Component
 * @param props
 * @returns
 */
const TweetTags = withTheme(function TweetTags(props: {
  image: TweetSchema;
  theme: DefaultTheme;
  tweetRef: RefObject<HTMLDivElement>;
  imageSrcs: string[];
}) {
  const session = useSession();
  const editMode = useStore((state) => state.editMode);

  // Get filter
  const filterTagName = useStore((state) => state.filterTagName);

  // Get filter actions
  const [removeImage, setFilter] = useStore((state) => [
    state.removeImage,
    state.setFilter,
  ]);

  // Get tags for image
  const [includedTags, notIncludedTags] = useStore(
    useCallback(
      (state) => {
        const tags = state.getTagList();

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
  const [tagsContainerRef, overflow] = useOverflowDetector();

  // Blacklist Image
  const blacklistImage = useStore((state) => state.blacklistImage);

  // Add tag image list
  const addImage = useStore((state) => state.addImage);

  const addTagRef = useRef<HTMLInputElement>(null);
  const onNewTagOpen = useCallback(() => {
    if (addTagRef.current) addTagRef.current.select();
  }, []);

  const [search, setSearch] = useState("");
  const addTagList = useMemo(() => {
    if (search) {
      return notIncludedTags.filter((tag) => tag.name.includes(search));
    } else {
      return notIncludedTags;
    }
  }, [notIncludedTags, search]);

  return (
    <MainContainer>
      {/* Add image to tag section */}
      <StyledPopup
        position={["bottom center", "bottom left", "bottom right"]}
        trigger={
          <div>
            <AddImagesButton
              image={props.image}
              theme={props.theme}
              forceDeleteMode={filterTagName === BLACKLIST_TAG}
            />
          </div>
        }
        closeOnDocumentClick
        disabled={filterTagName === BLACKLIST_TAG}
        onOpen={onNewTagOpen}
        onClose={() => setSearch("")}
      >
        {(close: () => void) => (
          <>
            <PopupItem tabIndex={-1}>
              <AddTag
                ref={addTagRef}
                placeholder="Enter a tag name..."
                onFinish={(error, text) => {
                  switch (error) {
                    case "EXISTING_TAG":
                      addImage(text, props.image);
                      break;
                    case "":
                      addImage(text, props.image);
                      break;
                  }

                  close();
                }}
                onTextChanged={setSearch}
              />
            </PopupItem>

            {addTagList.map((tag) => (
              <AddImagesPopupListItem
                key={tag.name}
                keyNum={tag.name}
                tag={tag}
                image={props.image}
                close={close}
              />
            ))}
            {/* Blacklist Section. Show if not in any tags */}
            {includedTags.length === 0 ? (
              <>
                <div
                  style={{
                    height: "1px",
                    margin: "5px",
                    backgroundColor: "grey",
                  }}
                />

                <PopupItem onClick={() => blacklistImage(props.image)}>
                  <BlacklistButton>Blacklist</BlacklistButton>
                </PopupItem>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </StyledPopup>
      {/* Included tags section */}
      <TabContainer ref={tagsContainerRef} overflowing={overflow}>
        {includedTags
          .filter((tag) => tag.name !== filterTagName)
          .map((tag) => (
            <Tab
              title={
                editMode !== "delete"
                  ? ""
                  : `Remove from "${tag.name}"`
              }
              color={
                editMode !== "delete" ? undefined : props.theme.color.danger
              }
              key={tag.name}
              active={filterTagName === tag.name && editMode !== "delete"} // Active overrides danger color, so don't show it
              onClick={() => {
                if (editMode !== "delete") {
                  setFilter({ type: "tag", tag: tag });
                } else if (session.data) {
                  removeImage(tag, props.image);
                }
              }}
            >
              {tag.name}
              {editMode === "delete" ? (
                <CloseCircle
                  style={{ marginLeft: "5px" }}
                  className="center"
                  size={20}
                />
              ) : (
                <></>
              )}
            </Tab>
          ))}
      </TabContainer>

      <StyledModal
        trigger={
          <StyledMenuIcon title="View image">
            <MenuIcon size={30} color={props.theme.color.onBackground} />
          </StyledMenuIcon>
        }
        modal
        closeOnDocumentClick
      >
        {(close) =>
          props.imageSrcs.length > 0 ? (
            <PreviewImage imageSrcs={props.imageSrcs} onClick={close} />
          ) : (
            <></>
          )
        }
      </StyledModal>
    </MainContainer>
  );
});

export default React.memo(TweetTags);
