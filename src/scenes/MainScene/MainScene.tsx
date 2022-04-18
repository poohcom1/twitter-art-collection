import React, { useCallback, useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { isFilterType, useStore } from "src/stores/rootStore";
import styled, { createGlobalStyle } from "styled-components";
import { useRouter } from "next/router";
import Overlay from "./Overlay";

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
    const _filter = (router.query.filter as string) ?? "all";
    const _tag = router.query.tag;

    if (isFilterType(_filter) && _tag) {
      switch (_filter) {
        case "all":
        case "uncategorized":
          setFilter({ type: _filter });
          break;
        case "tag":
          if (typeof _tag === "string") {
            const tag = tags.get(_tag);

            if (tag) setFilter({ type: "tag", tag });
          } else {
            const __tags = _tag.reduce((pre: TagSchema[], cur) => {
              const tag = tags.get(cur);

              if (tag) {
                pre.push(tag);
              }

              return pre;
            }, []);

            setFilter({ type: "multi", tags: __tags });
          }

          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags]);

  // Filter image
  const filteredImages = useStore((state) => state.getFilteredTweets());
  const allImages = useStore((state) => state.getFilteredTweets(true));

  const loadTweetData = useStore((state) => state.loadTweetData);

  // Load more tweets
  const loadMoreTweets = useCallback(async () => {
    const unfetchedImages = allImages.filter((im: TweetSchema) => !im.data);
    const imagesToFetch = unfetchedImages.slice(0, 100);

    const err = await loadTweetData(imagesToFetch.filter((im: TweetSchema) => !im.loading));

    if (err) {
      alert("Server error attempting to fetch more tweets! Please try again later");
    }
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
      <Overlay />
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
