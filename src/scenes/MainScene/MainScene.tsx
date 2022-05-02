import React, { useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery/TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";
import styled, { createGlobalStyle } from "styled-components";
import Overlay from "./Overlay";
import { FetchState } from "src/stores/ImageList";

// Styles
const GlobalStyle = createGlobalStyle`
  html {
      width: 100vw;
  }
  
  body {
    background-color: ${(props) => props.theme.color.background};
    color: ${(props) => props.theme.color.onBackground};
    width: 100vw;
    overflow-x: hidden;

    transition: background-color 0.1s;
  }
`;

const AppDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function MainScene() {
  const session = useSession();

  // Data
  const tweets = useStore((state) =>
    state.getTweets().filter(state.searchFilter)
  );

  const fetchTweets = useStore((state) => state.fetchMoreTweets);

  const fetchState = useStore((state) => {
    const tweetList = state.tweetLists.get(state.selectedLists[0]);
    if (tweetList) return tweetList.fetchState;
    else return "all_fetched" as FetchState;
  });

  const searchTerm = useStore((state) => state.searchTerm);

  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  const initTweetsAndTags = useStore((state) => state.initTweetsAndTags);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      !tweetsLoaded &&
      tweetsError === ""
    ) {
      initTweetsAndTags()
        .then((res) => {
          if (res.error) {
            setTweetsError(res.error);
          } else {
            fetchTweets()
              .then(() => {
                setTweetsLoaded(true);
              })
              .catch((e) => {
                setTweetsError(e);
              });
          }
        })
        .catch((e) => {
          setTweetsError(e);
        });
    }
  }, [
    fetchTweets,
    initTweetsAndTags,
    session.status,
    tweetsError,
    tweetsLoaded,
  ]);

  // Filtering and rendering
  const newUser = useStore((state) => state.newUser);

  const selectedList = useStore((state) => state.selectedLists);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedList]);

  // Key controls
  const [editMode, toggledEditMode] = useStore((state) => [
    state.editMode,
    state.toggleEditMode,
  ]);

  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editMode === "delete") {
        toggledEditMode();
      }
    };
    document.addEventListener("keyup", escape);

    return () => {
      document.removeEventListener("keyup", escape);
    };
  }, [editMode, toggledEditMode]);

  // TODO URL query

  if (tweetsError !== "") {
    return (
      <AppDiv className="App">
        <Header />
        <div className="main">{tweetsError as string}</div>
      </AppDiv>
    );
  }
  return (
    <AppDiv className="App">
      <Header />
      <GlobalStyle />
      <Overlay />
      <LoadingScene
        display={!tweetsLoaded || newUser}
        text={newUser ? "Creating new user..." : ""}
      />
      <TweetsGallery
        masonryKey={selectedList.join(",") + "-" + searchTerm}
        images={tweets}
        fetchItems={fetchTweets}
        maxItems={
          fetchState === "all_fetched" || searchTerm !== ""
            ? tweets.length
            : 9e9
        }
      />
    </AppDiv>
  );
}
