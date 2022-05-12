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

  // Load URL params

  const setSelectedList = useStore((state) => state.setSelectedList);

  useEffect(() => {
    const tags = router.query.tag;

    if (tags) setSelectedList(typeof tags === "string" ? [tags] : tags);
  }, [router.query.tag, setSelectedList]);

  // Data
  const tweets = useStore((state) =>
    state.getTweets().filter(state.searchFilter)
  );

  const fetchUser = useStore((state) => state.fetchUser);
  const fetchTweets = useStore((state) => state.fetchMoreTweets);

  const fetchState = useStore((state) => {
    const tweetList = state.imageLists.get(state.selectedLists[0]);
    if (tweetList) return tweetList.fetchState;
    else return "all_fetched" as FetchState;
  });

  const searchTerm = useStore((state) => state.searchTerm);

  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);

  const [errorMessage, setError] = useStore((state) => [
    state.errorMessage,
    state.setError,
  ]);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      !tweetsLoaded &&
      errorMessage === ""
    ) {
      fetchUser()
        .then((res) => {
          if (res.error) setError(res.error);
          else
            fetchTweets()
              .then(() => setTweetsLoaded(true))
              .catch((e) => setError(e.toString()));
        })
        .catch((e) => setError(e.toString()));
    }
  }, [
    session.status,
    fetchTweets,
    fetchUser,
    setError,
    errorMessage,
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
