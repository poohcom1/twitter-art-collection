import styled from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import ReactVisibilitySensor from "react-visibility-sensor";
import Masonry from "@mui/lab/Masonry";
import { ERR_LAST_PAGE } from "src/adapters";
import { useStore } from "src/stores/rootStore";
import { Spinner, TweetComponent } from "../../components";
import { imageEqual } from "src/utils/objectUtils";

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  padding: 120px 0;
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

      if (state.filterType === "tag")
        tweets = tweets.concat(
          // Concat unique tweets from
          state.extraTweets.filter(
            (extraTweet) => !tweets.find((t) => imageEqual(t, extraTweet))
          )
        );

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
  const filterType = useStore((state) => state.filterType);

  useEffect(() => {
    switch (filterType) {
      case "all":
      case "uncategorized":
        setShouldLoadMore(true);
        break;
      case "tag":
        setShouldLoadMore(false);
        break;
    }
  }, [filterType]);

  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const [moreTweetsLoading, setMoreTweetsLoading] = useState(false);

  const loadMoreTweet = useStore((state) => state.loadTweets);

  const loadMoreCallback = useCallback(
    (isVisible: boolean) => {
      if (isVisible && !moreTweetsLoading) {
        setMoreTweetsLoading(true);

        loadMoreTweet()
          .then((err) => {
            if (err === ERR_LAST_PAGE) {
              setShouldLoadMore(false);
            }

            setMoreTweetsLoading(false);
          })
          .catch(alert);
      }
    },
    [loadMoreTweet, moreTweetsLoading]
  );

  const tweetsAllFetched = useStore((state) => state.tweetsAllFetched);

  return (
    <MainDiv ref={mainDivRef}>
      <Masonry columns={4} spacing={3} style={{ margin: "auto" }}>
        {filteredImages.map((data, i) => (
          <TweetComponent id={data.id} ast={data.ast} key={data.id} order={i} />
        ))}
      </Masonry>
      <div className="center" style={{ margin: "20px" }}>
        {moreTweetsLoading ? (
          <Spinner size={30} />
        ) : shouldLoadMore && filteredImages.length > 0 ? (
          <ReactVisibilitySensor onChange={loadMoreCallback}>
            <h3>Loading...</h3>
          </ReactVisibilitySensor>
        ) : (
          <h3>{tweetsAllFetched ? "That's all the Tweets you got!" : ""}</h3>
        )}
      </div>
    </MainDiv>
  );
}
