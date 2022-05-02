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
import styled, { DefaultTheme, withTheme } from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";
import { useOverflowDetector } from "src/hooks/useOverflowDetector";
import Image from "next/image";
import AddTag from "../AddTag/AddTag";
import { BLACKLIST_TAG } from "types/constants";
import { ImageList, isTagList } from "src/stores/ImageList";

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

/**
 * Tab with lower border radius removed
 */
const Tab = styled(StyledTab)`
  padding: 5px 10px;
  margin: 0 5px;
  margin-top: 2px;

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

/**
 * Add image component
 */
function AddImagesPopupListItem(
  props: {
    tag: TagSchema;
    image: TweetSchema;
    close: () => void;
    keyNum: string | number;
  } & HTMLAttributes<HTMLButtonElement>
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
    <PopupItem key={props.keyNum} onClick={onClick} {...props}>
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
  const editMode = useStore((state) => state.editMode);

  // Get filter

  const [currentTag, selectedTags] = useStore((state) => [
    state.selectedLists.length === 1 ? state.selectedLists[0] : "",
    state.selectedLists,
  ]);

  // Get filter actions
  const [removeImage, setFilter] = useStore((state) => [
    state.removeImage,
    (tag: string) => state.setSelectedList([tag]),
  ]);

  // Get tags for image
  const [includedTags, notIncludedTags] = useStore(
    useCallback(
      (state) => {
        const tags = state.getTagList();

        const includedTags = tags.filter((tag) =>
          tag.images.find((im) => im === props.image.id)
        );
        const notIncludedTags = tags.filter(
          (tag) => !tag.images.find((im) => im === props.image.id)
        );

        return [includedTags, notIncludedTags];
      },
      [props.image]
    )
    // ,
    // (p, n) => {
    //   // Ignore inner image changes
    //   return (
    //     arrayEqual(p[1].map((t) => t.name), n[1].map((t) => t.name)) &&
    //     arrayEqual(p[0].map((t) => t.name), n[0].map((t) => t.name))
    //   );
    // }
  );

  // Overflow detection
  const [tagsContainerRef, overflow] = useOverflowDetector();

  // Blacklist Image
  const blacklistImage = useStore((state) => state.blacklistImage);

  // Add tag image list
  const addImage = useStore((state) => state.addImage);

  const addTagRef = useRef<HTMLInputElement>(null);

  const deleteMode = useStore(
    (state) =>
      state.selectedLists.includes(BLACKLIST_TAG) ||
      (state.editMode === "delete" &&
        state.selectedLists.length === 1 &&
        isTagList(
          state.tweetLists.get(state.selectedLists[0]) ?? ({} as ImageList)
        ))
  );

  // Add new tag OR delete current tag
  const onNewTagOpen = useCallback(() => {
    if (addTagRef.current) {
      addTagRef.current.select();
    }
  }, []);

  const onDeleteTag = useCallback(() => {
    if (currentTag) {
      removeImage(currentTag, props.image);
    }
  }, [currentTag, props.image, removeImage]);

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

      {!deleteMode ? (
        <StyledPopup
          position={["bottom center", "bottom left", "bottom right"]}
          trigger={
            <Tab
              className="tweetComp__tagEdit tweetComp__addImage"
              title={"Add image to tag"}
              tabIndex={-1}
            >
              <PlusCircle size={BUTTON_SIZE} />
            </Tab>
          }
          closeOnDocumentClick
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
                  className="addImage"
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

                  <PopupItem
                    className="tweetComp__blacklist"
                    onClick={() => blacklistImage(props.image)}
                  >
                    <BlacklistButton>Blacklist</BlacklistButton>
                  </PopupItem>
                </>
              ) : (
                <></>
              )}
            </>
          )}
        </StyledPopup>
      ) : (
        <Tab
          className="tweetComp__tagEdit tweetComp__removeImage"
          color={props.theme.color.danger}
          title={"Remove image from tag"}
          onClick={onDeleteTag}
          tabIndex={-1}
        >
          <CloseCircle size={BUTTON_SIZE} />
        </Tab>
      )}
      {/* Included tags section */}
      <TabContainer ref={tagsContainerRef} overflowing={overflow}>
        {includedTags
          .filter((tag) => tag.name !== currentTag)
          .map((tag) => (
            <Tab
              title={editMode !== "delete" ? "" : `Remove from "${tag.name}"`}
              color={
                editMode !== "delete" ? undefined : props.theme.color.danger
              }
              key={tag.name}
              active={selectedTags.includes(tag.name) && editMode !== "delete"} // Active overrides danger color, so don't show it
              onClick={() => {
                if (editMode !== "delete") {
                  setFilter(tag.name);
                } else {
                  removeImage(tag, props.image);
                }
              }}
              tabIndex={-1}
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
