import React, { useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import Overlay from "./Overlay";
import { ContextMenu } from "../../components";
import TweetsGallery from "./TweetsGallery/TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";
import styled, { createGlobalStyle } from "styled-components";
import { FetchState } from "src/stores/ImageList";
import { useRouter } from "next/router";

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
  height: 100vh;
  overflow: hidden;
`;

export default function MainScene() {
  const session = useSession();
  const router = useRouter();

  // Data
  const tweets = useStore((state) =>
    state.getTweets().filter(state.searchFilter)
  );

  const fetchTweets = useStore((state) => state.fetchMoreTweets);

  const fetchState = useStore((state) => {
    const tweetList = state.imageLists.get(state.selectedLists[0]);
    if (tweetList) return tweetList.fetchState;
    else return "all_fetched" as FetchState;
  });

  const searchTerm = useStore((state) => state.searchTerm);

  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);

  const initTweetsAndTags = useStore((state) => state.initTweetsAndTags);

  const errorMessage = useStore((state) => state.errorMessage);
  const setError = useStore((state) => state.setError);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      !tweetsLoaded &&
      errorMessage === ""
    ) {
      initTweetsAndTags()
        .then((res) => {
          if (res.error) {
            setError(res.error);
          } else {
            fetchTweets()
              .then(() => {
                setTweetsLoaded(true);
              })
              .catch((e) => {
                setError(e.toString());
              });
          }
        })
        .catch((e) => {
          setError(e.toString());
        });
    }
  }, [
    errorMessage,
    fetchTweets,
    initTweetsAndTags,
    session.status,
    setError,
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

  return (
    <>
      <GlobalStyle />
      <Overlay />
      <ContextMenu />
      <LoadingScene
        display={!tweetsLoaded || newUser}
        text={newUser ? "Creating new user..." : ""}
      />
      <AppDiv className="App">
        <Header />

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
    </>
  );
}
