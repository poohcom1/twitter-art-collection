import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styled, { withTheme } from "styled-components";
import {
  ConfirmationDialogue,
  ExpandingInput,
  PopupItem,
  StyledModel as StyledModal,
  StyledPopup,
  StyledTab,
} from "src/components";
import { FiFilter as FilterIcon } from "react-icons/fi";
import {
  AiOutlineCloseCircle as CloseCircle,
  AiOutlineClose as Cross,
} from "react-icons/ai";
import {
  RiArrowLeftSLine as Left,
  RiArrowRightSLine as Right,
} from "react-icons/ri";
import { GiHamburgerMenu as HamburgerMenu } from "react-icons/gi";
import {
  LIKED_TWEET_LIST,
  SPECIAL_LIST_KEYS,
  useStore,
} from "src/stores/rootStore";
import { useAddTag } from "src/hooks/useAddTag";
import { isTagList } from "src/stores/ImageList";
import { mapValues } from "src/util/objectUtil";
import { BLACKLIST_TAG } from "types/constants";
import { useOverflowDetector } from "src/hooks/useOverflowDetector";

const DEFAULT_TAG_WIDTH = "75px";

const Tag = styled(StyledTab)`
  margin: 5px;
  padding: 3px 10px;
  height: 3em;

  border-radius: 1.5em;

  & p {
    margin: auto;
    height: fit-content;
    user-select: none;
  }
`;

const StyledTagsPanel = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
`;

const VerticalBar = styled.div`
  min-width: 1px;
  height: 50px;
  margin: 0 5px;
  background-color: grey;
`;

const TagsContainer = styled.div`
  position: relative;
  z-index: 0;

  display: flex;
  flex-direction: row;
  justify-content: start;

  overflow-x: hidden;

  margin-bottom: 0;

  scroll-behavior: smooth;
`;

const ArrowDiv = styled.div<{ show: boolean; direction: "left" | "right" }>`
  opacity: ${(props) => (props.show ? "100%" : "0%")};
  transition: opacity 0.2s background-image;

  cursor: ${(props) => (props.show ? "pointer" : "default")};
  pointer-events: ${(props) => (props.show ? "all" : "none")};

  position: absolute;
  z-index: 1;
  height: 100%;
  width: 3em;

  display: flex;
  align-items: center;

  ${(props) => (props.direction === "left" ? "left: 0" : "right: 0")};
  justify-content: ${(props) =>
    props.direction === "left" ? "flex-start" : "flex-end"};

  background-image: linear-gradient(
    to ${(props) => (props.direction === "left" ? "right" : "left")},
    ${(props) => props.theme.color.surface},
    transparent
  );

  &:hover {
    background-image: linear-gradient(
      to ${(props) => (props.direction === "left" ? "right" : "left")},
      ${(props) => props.theme.color.surface} 25%,
      transparent
    );
  }
`;

const BasicFilterDiv = styled(Tag)`
  min-width: 3em;
  width: fit-content;
  flex: 0 0 auto;

  padding: 0 0.7em;

  justify-content: flex-start;

  transition: width 0.1s color 0.1s;
`;

function BasicFilter() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const timeoutRef = useRef<NodeJS.Timeout>();

  const setSearch = useStore(
    useCallback(
      (state) => (text: string) => {
        setSearchText(text);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // TODO Hack to improve responsiveness. useTransition should work better but its not in preact
        timeoutRef.current = setTimeout(() => {
          state.setSearchFilter(text);
        }, 300);
      },
      []
    )
  );

  useEffect(() => {
    if (active && inputRef.current) {
      inputRef.current.select();
    }
  }, [active]);

  return (
    <BasicFilterDiv
      onClick={active ? () => inputRef.current?.focus() : () => setActive(true)}
      style={{
        cursor: active ? "default" : "pointer",
      }}
      tabIndex={active ? -1 : 0}
      active={active}
    >
      <FilterIcon tabIndex={-1} size={"20px"} style={{ flexShrink: 0 }} />
      <input
        ref={inputRef}
        value={searchText}
        onKeyUp={(e) => {
          if (e.key === "Escape") {
            setSearch("");
            setActive(false);
          }
        }}
        onChange={(e) => {
          setSearch((e.target as HTMLInputElement).value);
        }}
        className="blank"
        style={{
          margin: "0",
          height: "100%",
          minWidth: active ? "11.7em" : "0",
          maxWidth: active ? "fit-content" : "0",
          padding: "0",
          transition: "min-width 0.1s marginLEft 0.1s",
        }}
      />
      <Cross
        style={{
          flexShrink: 0,
          cursor: "pointer",
          color: "inherit",
          transition: "width 0.1s",
          width: active ? "16px" : "0px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActive(false);
          setSearch("");
        }}
      />
    </BasicFilterDiv>
  );
}

/**
 * Create new tag component
 */
const NewTag = withTheme(function NewTag(props) {
  const setSelectedList = useStore((state) => state.setSelectedList);

  const addTagRef = useRef<HTMLInputElement>(null);

  const onClick = useCallback(() => {
    if (addTagRef.current !== document.activeElement) {
      addTagRef.current?.select();
    }
  }, []);

  const { inputProps, tagSetText, tagText } = useAddTag((e) => {
    switch (e) {
      case "EXISTING_TAG":
        setSelectedList([tagText]);
        tagSetText("");
        break;
    }
  });

  return (
    <Tag
      tabIndex={-1}
      color={props.theme.color.primary}
      textColor={props.theme.color.onPrimary}
      onClick={onClick}
    >
      <ExpandingInput
        id="headerAddTag"
        className="light-placeholder header__addTag"
        ref={addTagRef}
        placeholder="Add Tag"
        style={{
          textAlign: "center",
          color: "white",
          backgroundColor: "transparent",
          outline: "none",
          border: "none",
        }}
        containerStyle={{ minWidth: "5em" }}
        onBlur={() => tagSetText("")}
        {...inputProps}
      />
    </Tag>
  );
});

const SCROLL_AMOUNT = 500;

const TagsSection = withTheme(function TagsSection(props) {
  const editMode = useStore((state) => state.editMode);

  const tagList = useStore((state) =>
    mapValues(state.tweetLists)
      .filter(isTagList)
      .map((l) => l.tag)
      .filter((t) => t.name !== BLACKLIST_TAG)
  );

  const selectedLists = useStore((state) => state.selectedLists);
  const setSelectedList = useStore(
    (state) =>
      (tag: string) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (e.shiftKey) {
          if (!state.selectedLists.includes(tag)) {
            const tagKeys = state.selectedLists.filter(
              (t) => !SPECIAL_LIST_KEYS.includes(t)
            );

            state.setSelectedList([...tagKeys, tag]);
          }
        } else {
          state.setSelectedList([tag]);
        }
      }
  );

  const removeTag = useStore((state) => state.removeTag);

  const [tagsContainerRef, overflow] = useOverflowDetector();

  // Scrolling
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollMarkers = useCallback((ref: HTMLElement) => {
    setCanScrollLeft(ref.scrollLeft > 0);
    setCanScrollRight(ref.scrollLeft + ref.offsetWidth + 1 < ref.scrollWidth);
  }, []);

  // On first layout update
  useLayoutEffect(() => {
    const ref = tagsContainerRef.current;
    if (ref) {
      updateScrollMarkers(ref);
    }
  });

  const scrollLeft = useCallback(() => {
    const ref = tagsContainerRef.current;
    if (ref) {
      const scrollTo = ref.scrollLeft - SCROLL_AMOUNT;

      ref.scrollTo(scrollTo >= SCROLL_AMOUNT ? scrollTo : 0, 0);
    }
  }, [tagsContainerRef]);

  const scrollRight = useCallback(() => {
    const ref = tagsContainerRef.current;
    if (ref) {
      const scrollTo = ref.scrollLeft + SCROLL_AMOUNT;

      ref.scrollTo(
        scrollTo < ref.scrollWidth - ref.offsetWidth
          ? scrollTo
          : ref.scrollWidth,
        0
      );
    }
  }, [tagsContainerRef]);

  const tagRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (tagsContainerRef.current && selectedLists.length === 1) {
      const tag = selectedLists[0];

      const element = tagRefs.current[tag];

      if (element) {
        element.scrollIntoView({ inline: "center" });
      }
    }
  }, [selectedLists, tagsContainerRef]);

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "fit-content",
          overflow: "hidden",
        }}
      >
        <ArrowDiv direction="left" onClick={scrollLeft} show={canScrollLeft}>
          <Left size="30px" />
        </ArrowDiv>
        <ArrowDiv direction="right" onClick={scrollRight} show={canScrollRight}>
          <Right size="30px" />
        </ArrowDiv>
        <TagsContainer
          ref={tagsContainerRef}
          onScroll={(e) => updateScrollMarkers(e.target as HTMLElement)}
        >
          {tagList.reverse().map((tag, i) =>
            // Normal mode
            editMode === "add" ? (
              <Tag
                ref={(el) => (tagRefs.current[tag.name] = el)}
                className="header__tag"
                style={{ whiteSpace: "nowrap" }}
                key={i}
                onClick={setSelectedList(tag.name)}
                active={selectedLists.includes(tag.name)}
              >
                {tag.name} - {tag.images.length}
              </Tag>
            ) : (
              // Delete mode
              <StyledModal
                key={i}
                trigger={
                  <Tag
                    className="header__tag"
                    active={selectedLists.includes(tag.name)}
                    color={props.theme.color.danger}
                  >
                    {tag.name}
                    <CloseCircle
                      size={25}
                      style={{ marginLeft: "8px", marginRight: "-3px" }}
                    />
                  </Tag>
                }
                modal
              >
                {/* Delete toggle */}
                {(close: () => void) => (
                  <ConfirmationDialogue
                    title={`Deleting "${tag.name}"`}
                    text="Are you sure you want to delete this tag?"
                    acceptText="Delete"
                    cancelText="Cancel"
                    acceptColor={props.theme.color.danger}
                    closeCallback={close}
                    onAccept={() => {
                      removeTag(tag);
                      if (selectedLists.includes(tag.name)) {
                        setSelectedList(LIKED_TWEET_LIST);
                      }

                      // toggleEditMode();
                      close();
                    }}
                  />
                )}
              </StyledModal>
            )
          )}
        </TagsContainer>
      </div>
      {/* Tags popup menu */}
      {overflow && (
        <StyledPopup
          position={"bottom right"}
          trigger={
            <button
              className="blank"
              style={{ margin: "0 8px", cursor: "pointer" }}
            >
              <HamburgerMenu
                size={"24px"}
                color={props.theme.color.onSurface}
              />
            </button>
          }
          closeOnDocumentClick
        >
          {(close) =>
            tagList.length > 0 ? (
              tagList.reverse().map((tag) => (
                <PopupItem
                  key={tag.name}
                  onClick={(e) => {
                    close();
                    setSelectedList(tag.name)(e);
                  }}
                >
                  {tag.name}
                </PopupItem>
              ))
            ) : (
              <p style={{ margin: "4px" }}>No tags yet!</p>
            )
          }
        </StyledPopup>
      )}
    </>
  );
});

/* ----------------------------- Main Component ----------------------------- */

export default withTheme(function TagsPanel(_props) {
  // Special Tags
  const selectedLists = useStore((state) => state.selectedLists);
  const setSpecialSelectedList = useStore((state) => (tag: string) => () => {
    state.setSelectedList([tag]);
  });

  return (
    <>
      <StyledTagsPanel>
        {/* Special filters Section */}
        <Tag
          style={{ width: DEFAULT_TAG_WIDTH }}
          onClick={setSpecialSelectedList(LIKED_TWEET_LIST)}
          active={selectedLists.includes(LIKED_TWEET_LIST)}
        >
          Likes
        </Tag>
      </StyledTagsPanel>

      <BasicFilter />
      <VerticalBar />
      <NewTag />
      <TagsSection />
    </>
  );
});
