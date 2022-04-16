import React, { useCallback, useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { isFilterType, useStore } from "src/stores/rootStore";
import styled, { createGlobalStyle } from "styled-components";
import { useRouter } from "next/router";

// Styles
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => props.theme.color.background};
  }
`;

const AppDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function MainScene() {
  const session = useSession();

  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  const initTweetsAndTags = useStore((state) => state.initTweetsAndTags);

  useEffect(() => {
    if (session.status === "authenticated") {
      initTweetsAndTags()
        .then((err) => {
          setTweetsLoaded(true);

          if (err) {
            setTweetsError(err);
          }
        })
        .catch(alert);
    }
  }, [initTweetsAndTags, session.status]);

  // Filtering and rendering
  const imageFilter = useStore((state) => state.imageFilter);

  const newUser = useStore((state) => state.newUser);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [imageFilter]);

  // URL query
  const router = useRouter();

  const tags = useStore((state) => state.tags);
  const setFilter = useStore((state) => state.setFilter);

  useEffect(() => {
    const filter: string = router.query.filter as string;
    const tag: string = router.query.tag as string;

    if (isFilterType(filter) && tags.has(tag)) {
      setFilter({ type: filter, tag: tags.get(tag)! });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags]);

  // Filter image
  const filteredImages = useStore((state) => state.getFilteredTweets());
  const allImages: TweetSchema[] = useStore((state) =>
    state.getFilteredTweets(true)
  );

  const loadTweetData = useStore((state) => state.loadTweetData);

  // Load more tweets
  const loadMoreTweets = useCallback(async () => {
    const unfetchedImages = allImages.filter((im: TweetSchema) => !im.data);
    const imagesToFetch = unfetchedImages.slice(0, 100);

    await loadTweetData(imagesToFetch.filter((im) => !im.loading));
  }, [allImages, loadTweetData]);

  if (tweetsError !== "") {
    return (
      <AppDiv className="App">
        <Header />
        <div className="main">{tweetsError}</div>
      </AppDiv>
    );
  }

  return (
    <AppDiv className="App">
      <Header />
      <GlobalStyle />
      <LoadingScene
        display={!tweetsLoaded || newUser}
        text={newUser ? "Creating new user..." : ""}
      />
      <TweetsGallery
        images={filteredImages}
        fetchItems={loadMoreTweets}
        maxItems={allImages.length}
      />
    </AppDiv>
  );
}
