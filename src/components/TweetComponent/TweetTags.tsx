import { useSession } from "next-auth/react";
import React, {
  RefObject,
  HTMLAttributes,
  useCallback,
  useMemo,
  useState,
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
import { arrayEqual, imageEqual } from "src/utils/objectUtils";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { PopupItem, StyledPopup, StyledTab } from "..";
import { useOverflowDetector } from "src/hooks/useOverflowDetector";
import Image from "next/image";
import AddTag from "../AddTag/AddTag";

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

const StyledLeft = styled(Left)<{ show: number }>`
  &:hover {
    cursor: ${(props) => (props.show ? "pointer" : "auto")};
  }
`;

const StyledRight = styled(Right)<{ show: number }>`
  &:hover {
    cursor: ${(props) => (props.show ? "pointer" : "auto")};
  }
`;

const BlacklistButton = styled(PopupItem)`
  color: red;
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
    <PopupItem key={props.keyNum} onClick={onClick}>
      {props.tag.name}
    </PopupItem>
  );
}

function PreviewImage(
  props: { imageSrcs: string[] } & React.HTMLProps<HTMLDivElement>
) {
  const [imageIndex, setImageIndex] = useState(0);

  const leftCallback: React.MouseEventHandler<SVGElement> = useCallback(
    (e) => {
      e.stopPropagation();
      if (imageIndex > 0) {
        setImageIndex(imageIndex - 1);
      }
    },
    [imageIndex]
  );

  const rightCallback: React.MouseEventHandler<SVGElement> = useCallback(
    (e) => {
      e.stopPropagation();
      if (imageIndex < props.imageSrcs.length - 1) {
        setImageIndex(imageIndex + 1);
      }
    },
    [imageIndex, props.imageSrcs.length]
  );

  return (
    <div
      style={{ display: "flex", alignItems: "center" }}
      onClick={props.onClick}
    >
      <StyledLeft
        color={imageIndex > 0 ? "grey" : "transparent"}
        show={imageIndex > 0 ? 1 : 0}
        size={80}
        onClick={leftCallback}
      />
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
          width="100%"
          height="100%"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <StyledRight
        color={imageIndex < props.imageSrcs.length - 1 ? "grey" : "transparent"}
        show={imageIndex < props.imageSrcs.length - 1 ? 1 : 0}
        size={80}
        onClick={rightCallback}
      />
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

  return (
    <MainContainer>
      {/* Add image to tag section */}
      <StyledPopup
        position={["bottom center", "bottom left", "bottom right"]}
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
        {(close: () => void) => (
          <>
            <PopupItem>
              <AddTag onFinish={close} />
            </PopupItem>

            {notIncludedTags.map((tag) => (
              <AddImagesPopupListItem
                key={tag.name}
                keyNum={tag.name}
                tag={tag}
                image={props.image}
                close={close}
              />
            ))}

            {includedTags.length === 0 ? (
              <>
                <div
                  style={{
                    height: "1px",
                    margin: "5px",
                    backgroundColor: "grey",
                  }}
                />

                <BlacklistButton onClick={() => blacklistImage(props.image)}>
                  Blacklist
                </BlacklistButton>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </StyledPopup>
      {/* Included tags section */}
      <TabContainer ref={tagsContainerRef} overflowing={overflow}>
        {includedTags.map((tag) => (
          <Tab
            color={editMode !== "delete" ? undefined : props.theme.color.danger}
            key={tag.name}
            active={filterTag === tag.name && editMode !== "delete"} // Active overrides danger color, so don't show it
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
          <StyledMenuIcon>
            <MenuIcon size={30} />
          </StyledMenuIcon>
        }
        modal
        closeOnDocumentClick
      >
        {(close: () => void) =>
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
