import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { WithTheme, withTheme } from "styled-components";
import {
  ConfirmationDialogue,
  ContextMenuIcon,
  ExpandingInput,
  PopupItem,
  StyledModel as StyledModal,
  StyledPopup,
  StyledTab,
} from "src/components";
import { FiFilter as FilterIcon } from "react-icons/fi";
import { AiOutlineClose as Cross } from "react-icons/ai";
import {
  BiTrashAlt as TrashIcon,
  BiPencil as PencilIcon,
} from "react-icons/bi";
import {
  BsPin as AddPinIcon,
  BsPinFill as PinnedIcon,
  BsPinAngle as UnpinIcon,
} from "react-icons/bs";
import {
  RiArrowLeftSLine as Left,
  RiArrowRightSLine as Right,
} from "react-icons/ri";
import { GiHamburgerMenu as HamburgerMenu } from "react-icons/gi";
import { useStore } from "src/stores/rootStore";
import { useAddTag } from "src/hooks/useAddTag";
import { useOverflowDetector } from "src/hooks/useOverflowDetector";
import { applyOpacity } from "src/util/themeUtil";
import useContextMenu from "src/hooks/useContextMenus";
import { standardizeTagName, validateTagName } from "lib/tagValidation";
import {
  HOME_LIST,
  LIKED_TWEET_LIST,
  SPECIAL_LIST_KEYS,
  TIMELINE_TWEET_LIST,
} from "types/constants";

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

const StyledPinButton = styled.div<{
  active: boolean;
}>`
  cursor: pointer;
  flex: 0 0 auto;

  width: 25px;
  height: 25px;

  border: none;
  border-radius: 2px;
  margin-left: -4px;
  margin-right: 2px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: transparent;

  &:hover {
    background-color: ${(props) =>
      props.active
        ? applyOpacity(props.theme.color.onAccent, 0.15)
        : "transparent"};
  }
`;

/* ------------------------------- Components ------------------------------- */

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
      hoverOpacity={active ? 100 : undefined}
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
function AddTag(props: WithTheme) {
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
      borderColor="transparent"
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
}

function DeleteTag(
  props: {
    tag: TagSchema;
    onClose: () => void;
  } & WithTheme
) {
  const selectedLists = useStore((state) => state.selectedLists);
  const removeTag = useStore((state) => state.removeTag);
  const setSelectedList = useStore((state) => state.setSelectedList);

  return (
    <ConfirmationDialogue
      title={`Deleting "${props.tag.name}"`}
      text={`Are you sure you want to delete this tag? This tag contains ${props.tag.images.length} image(s).`}
      acceptText="Delete"
      cancelText="Cancel"
      acceptColor={props.theme.color.danger}
      closeCallback={props.onClose}
      onAccept={() => {
        removeTag(props.tag);

        // Return to home list if current tag removed
        if (selectedLists.includes(props.tag.name)) {
          setSelectedList([HOME_LIST]);
        }

        props.onClose();
      }}
    />
  );
}

function PinButton(props: { active: boolean; tag: TagSchema } & WithTheme) {
  const [hover, setHover] = useState(false);

  const onClickCallback: React.MouseEventHandler<HTMLDivElement> = useStore(
    useCallback(
      (state) => (e) => {
        if (props.active) {
          e.stopPropagation();
          state.unpinTag(props.tag.name);
        }
      },
      [props.active, props.tag.name]
    )
  );

  const Icon = useMemo(
    () => (!hover || !props.active ? PinnedIcon : UnpinIcon),
    [hover, props.active]
  );

  return (
    <StyledPinButton
      title={props.active ? "Unpin" : ""}
      active={props.active}
      onClick={onClickCallback}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        paddingBottom: !hover || !props.active ? "" : "4px",
      }}
    >
      <Icon
        size="15px"
        color={
          props.active
            ? props.theme.color.onAccent
            : props.theme.color.onSecondary
        }
      />
    </StyledPinButton>
  );
}

const SCROLL_AMOUNT = 500;

const TagButton = forwardRef<HTMLButtonElement, { tag: TagSchema } & WithTheme>(
  function TagButton(props, ref) {
    const { tag } = props;

    const [renaming, _setRenaming] = useState(false);
    const [name, _setName] = useState(tag.name);

    const setRenaming = useStore(
      useCallback(
        (state) => (renaming: boolean) => {
          // Auto select tag that is being renamed
          if (renaming) state.setSelectedList([tag.name]);
          _setRenaming(renaming);
        },
        [tag.name]
      )
    );

    const setName = useCallback((name: string) => {
      _setName(standardizeTagName(name));
    }, []);

    const onRenameCancel = useCallback(() => {
      setRenaming(false);
      setName(tag.name);
    }, [setName, setRenaming, tag.name]);

    const tagList = useStore((state) => state.getTagList().map((t) => t.name));

    const onRename = useStore(
      useCallback(
        (state) => () => {
          if (tag.name !== name && validateTagName(name, tagList) === "") {
            setRenaming(false);
            state.renameTag(tag.name, name);
          } else {
            onRenameCancel();
          }
        },
        [name, onRenameCancel, setRenaming, tag.name, tagList]
      )
    );

    const editMode = useStore((state) => state.editMode);
    const setSelectedList = useStore(
      (state) =>
        (tag: string) =>
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          if (e.shiftKey) {
            state.addToSelectedList(tag);
          } else {
            state.setSelectedList([tag]);
          }
        }
    );
    const pinnedTags = useStore((state) => state.pinnedTags);
    const selectedLists = useStore((state) => state.selectedLists);

    // Context Menu
    const [pinTag, unpinTag] = useStore((state) => [
      state.pinTag,
      state.unpinTag,
    ]);

    const removeTag = useStore((state) => state.removeTag);

    const [showContextMenu, hideContextMenu] = useContextMenu(() => (
      <>
        {!pinnedTags.includes(tag.name) ? (
          <ContextMenuIcon
            className="header__tags__context-pin"
            icon={<AddPinIcon />}
            body={"Pin"}
            onClick={() => pinTag(tag.name)}
          />
        ) : (
          <ContextMenuIcon
            className="header__tags__context-pin"
            icon={<UnpinIcon />}
            body={"Unpin"}
            onClick={() => unpinTag(tag.name)}
          />
        )}
        <ContextMenuIcon
          icon={<PencilIcon />}
          body="Rename"
          onClick={() => setRenaming(true)}
        />

        {tag.images.length === 0 ? (
          <ContextMenuIcon
            className="header__tags__context-delete"
            icon={<TrashIcon />}
            body="Delete"
            onClick={() => removeTag(tag)}
          />
        ) : (
          <StyledModal
            modal
            onClose={hideContextMenu}
            trigger={
              <ContextMenuIcon
                className="header__tags__context-delete"
                icon={<TrashIcon />}
                body="Delete"
              />
            }
          >
            {(close) => (
              <DeleteTag tag={tag} onClose={close} theme={props.theme} />
            )}
          </StyledModal>
        )}
      </>
    ));

    const active = useMemo(
      () => selectedLists.includes(tag.name),
      [selectedLists, tag.name]
    );

    if (editMode === "add") {
      if (!renaming)
        return (
          <Tag
            ref={ref}
            className="header__tag"
            style={{ whiteSpace: "nowrap" }}
            onClick={setSelectedList(tag.name)}
            active={active}
            onContextMenu={showContextMenu()}
          >
            {pinnedTags.includes(tag.name) && (
              <PinButton tag={tag} active={active} theme={props.theme} />
            )}
            {tag.name}
          </Tag>
        );
      else
        return (
          <Tag
            ref={ref}
            className="header__tag"
            style={{ whiteSpace: "nowrap" }}
            onClick={setSelectedList(tag.name)}
            active={active}
            onContextMenu={showContextMenu()}
          >
            <ExpandingInput
              autoFocus
              autoSelect
              style={{
                color: props.theme.color.onAccent,
                outline: "1px dotted grey",
              }}
              className="blank header__context-rename"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") onRename();
                else if (e.key === "Escape") onRenameCancel();
              }}
              onBlur={onRenameCancel}
            />
          </Tag>
        );
    } else {
      return (
        <StyledModal
          trigger={
            <Tag
              className="header__tag"
              color={props.theme.color.danger}
              borderColor={"transparent"}
            >
              {tag.name}
              <TrashIcon
                size={20}
                style={{ marginLeft: "8px", marginRight: "-3px" }}
              />
            </Tag>
          }
          modal
        >
          {(close) => (
            <DeleteTag tag={tag} onClose={close} theme={props.theme} />
          )}
        </StyledModal>
      );
    }
  }
);

function TagsSection(props: WithTheme) {
  const tagList = useStore((state) => state.getTagList());

  const selectedLists = useStore((state) => state.selectedLists);
  const setSelectedList = useStore(
    (state) =>
      (tag: string) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (e.shiftKey) {
          // On shift click: Add to selected lists
          if (!state.selectedLists.includes(tag)) {
            const tagKeys = state.selectedLists.filter(
              (t) => !SPECIAL_LIST_KEYS.includes(t)
            );

            state.setSelectedList([...tagKeys, tag]);
          }
        } else {
          // On regular click, replace selected lists
          state.setSelectedList([tag]);
        }
      }
  );

  const [tagsContainerRef, overflow] = useOverflowDetector();

  // Scrolling
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollMarkers = useCallback((ref: HTMLElement) => {
    setCanScrollLeft(ref.scrollLeft > 0);
    setCanScrollRight(ref.scrollLeft + ref.offsetWidth + 1 < ref.scrollWidth);
  }, []);

  // On first layout update
  useEffect(() => {
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
          {tagList.map((tag) => (
            <TagButton
              ref={(el) => (tagRefs.current[tag.name] = el)}
              tag={tag}
              key={tag.name}
              {...props}
            />
          ))}
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
          {(close: () => void) =>
            tagList.length > 0 ? (
              tagList.map((tag) => (
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
}

/* ----------------------------- Main Component ----------------------------- */

export default withTheme(function TagsPanel(props) {
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
          onClick={setSpecialSelectedList(TIMELINE_TWEET_LIST)}
          active={selectedLists.includes(TIMELINE_TWEET_LIST)}
        >
          Timeline
        </Tag>
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
      <AddTag {...props} />
      <TagsSection {...props} />
    </>
  );
});
