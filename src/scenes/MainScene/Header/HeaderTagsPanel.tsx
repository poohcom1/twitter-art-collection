import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { DefaultTheme, withTheme } from "styled-components";
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

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;

  overflow-x: hidden;

  margin-bottom: 0;

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const FilterDiv = styled(Tag)`
  min-width: 3em;

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

        // TODO Hack to improve responsiveness. useTransition should work better once its in preact
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
    <FilterDiv
      onClick={active ? () => inputRef.current?.focus() : () => setActive(true)}
      style={{
        cursor: active ? "default" : "pointer",
        width: active ? "20em" : "",
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
          marginLeft: active ? "5px" : "0",
          height: "100%",
          minWidth: active ? "11.7em" : "0",
          maxWidth: active ? "fit-content" : "0",
          padding: "0",
          transition: "min-width 0.1s",
        }}
      />
      <Cross
        style={{
          flexShrink: 0,
          ...(active
            ? {
                cursor: "pointer",
                width: "fit-content",
                color: "inherit",
                transition: "color 0.1s",
              }
            : {
                cursor: "pointer",
                width: "0",
                color: "transparent",
                transition: "color 0.1s",
                margin: "0",
                padding: "0",
              }),
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActive(false);
          setSearch("");
        }}
      />
    </FilterDiv>
  );
}

/**
 * Create new tag component
 */
function NewTag(props: { theme: DefaultTheme }) {
  const addTagRef = useRef<HTMLInputElement>(null);

  const onClick = useCallback(() => {
    if (addTagRef.current !== document.activeElement) {
      addTagRef.current?.select();
    }
  }, []);

  const { inputProps, tagSetText } = useAddTag((_e) => {
    addTagRef.current?.blur();
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
}

/**
 * Main Component
 */
export default withTheme(function TagsPanel(props: { theme: DefaultTheme }) {
  // Tag
  const editMode = useStore((state) => state.editMode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

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
        if (e.shiftKey && !SPECIAL_LIST_KEYS.includes(tag)) {
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

  const session = useSession();

  return (
    <>
      <StyledTagsPanel>
        {/* Special filters Section */}
        {/* <Tag
          style={{ width: DEFAULT_TAG_WIDTH }}
          onClick={setSelectedList(TIMELINE_TWEET_LIST)}
          active={selectedLists.includes(TIMELINE_TWEET_LIST)}
        >
          Timeline
        </Tag> */}
        <Tag
          style={{ width: DEFAULT_TAG_WIDTH }}
          onClick={setSelectedList(LIKED_TWEET_LIST)}
          active={selectedLists.includes(LIKED_TWEET_LIST)}
        >
          Likes
        </Tag>
      </StyledTagsPanel>

      <BasicFilter />
      {/* Tags section */}
      <TagsContainer>
        <div
          style={{
            minWidth: "1px",
            height: "50px",
            margin: "0 5px",
            backgroundColor: "grey",
          }}
        />
        <NewTag theme={props.theme} />

        {tagList.reverse().map((tag, i) =>
          // Normal mode
          editMode === "add" ? (
            <Tag
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
                    if (session.data) {
                      removeTag(tag);
                      if (selectedLists.includes(tag.name)) {
                        setSelectedList(LIKED_TWEET_LIST);
                      }

                      // TODO Make this an option?
                      // Turn off edit mode when deleting tag
                      toggleEditMode();
                      close();
                    }
                  }}
                />
              )}
            </StyledModal>
          )
        )}
      </TagsContainer>

      {/* Tags popup menu */}
      <StyledPopup
        position={"bottom right"}
        trigger={
          <button
            className="blank"
            style={{ margin: "0 8px", cursor: "pointer" }}
          >
            <HamburgerMenu size={"24px"} />
          </button>
        }
        closeOnDocumentClick
      >
        {(close) =>
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
        }
      </StyledPopup>
    </>
  );
});
