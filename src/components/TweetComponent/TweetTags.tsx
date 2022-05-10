import React, {
  RefObject,
  HTMLAttributes,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { BiTrashAlt as TrashIcon } from "react-icons/bi";
import {
  MdBookmarkAdd as AddIcon,
  MdBookmarkRemove as RemoveIcon,
  MdOutlineImageSearch as MenuIcon,
} from "react-icons/md";
import {
  GoTriangleLeft as Left,
  GoTriangleRight as Right,
} from "react-icons/go";
import Popup from "reactjs-popup";
import { useStore } from "src/stores/rootStore";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { ContextMenuIcon, PopupItem, StyledPopup, StyledTab } from "..";
import { useOverflowDetector } from "src/hooks/useOverflowDetector";
import Image from "next/image";
import AddTag from "../AddTag/AddTag";
import { BLACKLIST_TAG } from "types/constants";
import { ImageList, isTagList } from "src/stores/ImageList";
import useContextMenu from "src/hooks/useContextMenus";

const BUTTON_SIZE = 25;

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
  padding: 4px 8px;
  margin: 0 5px;
  margin-top: 2px;

  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
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

function NewTag(props: { image: TweetSchema; theme: DefaultTheme }) {
  const ref = useRef<HTMLInputElement>(null);

  // Data store
  const [currentTag, selectedTags] = useStore((state) => [
    state.selectedLists.length === 1 ? state.selectedLists[0] : "",
    state.selectedLists,
  ]);

  const [notIncludedTags, showBlacklist] = useStore((state) => {
    const tags = state.getTagList();

    const notIncludedTags = tags.filter(
      (tag) => !tag.images.find((im) => im === props.image.id)
    );

    return [notIncludedTags, notIncludedTags.length === tags.length];
  });

  // Blacklist Image
  const blacklistImage = useStore((state) => state.blacklistImage);

  // Add tag image list
  const addImage = useStore((state) => state.addImage);

  const deleteMode = useStore(
    (state) =>
      state.selectedLists.includes(BLACKLIST_TAG) ||
      (state.editMode === "delete" &&
        state.selectedLists.length === 1 &&
        isTagList(
          state.imageLists.get(state.selectedLists[0]) ?? ({} as ImageList)
        ))
  );

  // Get filter actions
  const removeImage = useStore((state) => state.removeImage);

  const [search, setSearch] = useState("");

  const addTagList = useMemo(() => {
    if (search) {
      return notIncludedTags.filter((tag) => tag.name.includes(search));
    } else {
      return notIncludedTags;
    }
  }, [notIncludedTags, search]);

  // Add new tag OR delete current tag
  const onNewTagOpen = useCallback(() => {
    if (ref.current) {
      ref.current.select();
    }
  }, []);

  const onDeleteTag = useCallback(() => {
    if (currentTag) {
      removeImage(currentTag, props.image);
    }
  }, [currentTag, props.image, removeImage]);

  return (
    <>
      {!deleteMode ? (
        <StyledPopup
          position={["bottom center", "bottom left", "bottom right"]}
          trigger={
            <Tab
              className="tweetComp__tagEdit tweetComp__addImage"
              title={"Add image to tag"}
              tabIndex={-1}
              onClick={() => undefined}
            >
              <AddIcon size={BUTTON_SIZE} />
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
                  ref={ref}
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
                  className="tweetComp__addImageItem"
                  key={tag.name}
                  keyNum={tag.name}
                  tag={tag}
                  image={props.image}
                  close={close}
                />
              ))}
              {/* Blacklist Section. Show if not in any tags */}
              {showBlacklist && (
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
              )}
            </>
          )}
        </StyledPopup>
      ) : (
        <Tab
          className="tweetComp__tagEdit tweetComp__removeImage"
          color={props.theme.color.danger}
          title={`Remove image from ${selectedTags[0]}`}
          onClick={onDeleteTag}
          tabIndex={-1}
        >
          <RemoveIcon size={BUTTON_SIZE} />
        </Tab>
      )}
    </>
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
  const selectedTags = useStore((state) => state.selectedLists);

  // Get filter actions
  const [removeImage, setFilter] = useStore((state) => [
    state.removeImage,
    (tag: string) => state.setSelectedList([tag]),
  ]);

  // Get tags for image
  const includedTags = useStore(
    useCallback(
      (state) => {
        const tags = state.getTagList();
        const selectedLists = state.selectedLists;

        const includedTags = tags.filter((tag) =>
          tag.images.find((im) => im === props.image.id)
        );

        // Sort to list selected tags first
        return includedTags.sort((a, b) => {
          if (selectedLists.includes(a.name)) {
            return -1;
          } else if (selectedLists.includes(b.name)) {
            return 1;
          } else {
            return 0;
          }
        });
      },
      [props.image]
    )
  );

  // Overflow detection
  const [tagsContainerRef, overflow] = useOverflowDetector();

  const [showContextMenu] = useContextMenu((tag: TagSchema) => (
    <>
      <ContextMenuIcon
        icon={<TrashIcon />}
        body="Remove"
        onClick={() => removeImage(tag, props.image)}
      />
    </>
  ));

  return (
    <MainContainer>
      {/* Add image to tag section */}
      <NewTag {...props} />
      {/* Included tags section */}
      <TabContainer ref={tagsContainerRef} overflowing={overflow}>
        {includedTags.map((tag) => (
          <Tab
            className="tweetComp__tag"
            title={editMode !== "delete" ? "" : `Remove from "${tag.name}"`}
            color={editMode !== "delete" ? undefined : props.theme.color.danger}
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
            onContextMenu={showContextMenu(tag)}
          >
            {tag.name}
            {editMode === "delete" && (
              <TrashIcon
                style={{ marginLeft: "5px" }}
                className="center"
                size={20}
              />
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
          props.imageSrcs.length > 0 && (
            <PreviewImage imageSrcs={props.imageSrcs} onClick={close} />
          )
        }
      </StyledModal>
    </MainContainer>
  );
});

export default React.memo(TweetTags);
