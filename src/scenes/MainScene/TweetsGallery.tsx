import styled from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import { useStore } from "src/stores/rootStore";
import { Spinner, TweetComponent } from "../../components";
import Masonry from "react-masonry-css";
import ReactVisibilitySensor from "react-visibility-sensor";

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  padding: 120px 32px;
  overflow-y: scroll;
  height: 100vh;
`;

/**
 * Draw tweets to a masonry depending on the current filter
 * Will infinitely load tweets for "all" and "uncategorized" filters
 * Will immediately load tweets for "tag" filters into "extraTweets"
 */
export default function TweetsGallery() {
  // Filtering and rendering
  const imageFilter = useStore((state) => state.imageFilter);

  // Filter image, and add extra image if tag is selected
  const filteredImages = useStore(
    useCallback((state) => {
      let tweets = state.tweets;

      if (state.filterType === "tag") {
        tweets = tweets.concat(Array.from(state.extraTweets));
      }

      return tweets.filter(state.imageFilter);
    }, [])
  );

  // For scroll to top
  const mainDivRef = useRef<HTMLDivElement>(null);

  // Scroll to top on filter change
  useEffect(() => {
    if (mainDivRef.current) {
      mainDivRef.current.scrollTo(0, 0);
    }
  }, [imageFilter]);

  // Loading more tweets
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const [moreTweetsLoading, setMoreTweetsLoading] = useState(false);

  const loadMoreTweet = useStore((state) => state.loadTweets);
  const [filterType, filterTagName] = useStore((state) => [
    state.filterType,
    state.filterTagName,
  ]);

  const loadMoreCallback = useCallback(
    (isVisible: boolean) => {
      if (isVisible && !moreTweetsLoading) {
        setMoreTweetsLoading(true);

        if (filterType === "tag") {
        }
        setTimeout(
          () =>
            loadMoreTweet()
              .then(() => setMoreTweetsLoading(false))
              .catch(alert),
          200
        );
      }
    },
    [filterType, loadMoreTweet, moreTweetsLoading]
  );

  /// Check if should load more
  const tags = useStore().tags;
  const loadExtraTweets = useStore().loadExtraTweets;

  useEffect(() => {
    switch (filterType) {
      case "tag":
        // Tags could have unloaded images, so load their AST immediately to extra tweets
        loadExtraTweets(tags.get(filterTagName)!.images.map((im) => im.id))
          .then()
          .catch(console.error);

        setShouldLoadMore(false);
        break;
      case "all":
      case "uncategorized":
        setShouldLoadMore(true);
        break;
    }
  }, [filterTagName, filterType, loadExtraTweets, tags]);

  return (
    <MainDiv ref={mainDivRef}>
      <Masonry
        breakpointCols={4}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {filteredImages.map((data, i) => (
          <TweetComponent id={data.id} ast={data.ast} key={data.id} order={i} />
        ))}
      </Masonry>
      <div className="center">
        {shouldLoadMore && filteredImages.length > 0 ? (
          <>
            {moreTweetsLoading ? (
              <Spinner />
            ) : (
              <ReactVisibilitySensor onChange={loadMoreCallback}>
                <p>Loading...</p>
              </ReactVisibilitySensor>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </MainDiv>
  );
}
