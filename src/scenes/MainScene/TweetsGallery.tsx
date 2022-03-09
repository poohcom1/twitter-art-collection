import styled from "styled-components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCallback } from "react";
import { useStore } from "src/stores/rootStore";
import { Spinner, TweetComponent } from "../../components";
import Masonry from "react-masonry-css";
import ReactVisibilitySensor from "react-visibility-sensor";

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  padding: 120px 32px;
  overflow-y: scroll;
`;

export default function TweetsGallery() {
  // Filtering and rendering
  const tweets = useStore((state) => state.tweets);
  const imageFilter = useStore((state) => state.imageFilter);

  // For scroll to top
  const mainDivRef = useRef<HTMLDivElement>(null);

  const filteredImages = useStore(
    useCallback((state) => tweets.filter(state.imageFilter), [tweets])
  );

  // Scroll to top on filter change
  useEffect(() => {
    if (mainDivRef.current) mainDivRef.current.scrollTo(0, 0);
  }, [imageFilter]);

  // Loading more tweets
  const [moreTweetsLoading, setMoreTweetsLoading] = useState(false);

  const loadMoreTweet = useStore((state) => state.loadTweets);
  const [filterType, filterTagName] = useStore((state) => [
    state.filterType,
    state.filterTagName,
  ]);

  const tags = useStore().tags;

  const loadMoreCallback = useCallback(
    (isVisible: boolean) => {
      if (isVisible && !moreTweetsLoading) {
        setMoreTweetsLoading(true);

        setTimeout(
          () =>
            loadMoreTweet()
              .then(() => setMoreTweetsLoading(false))
              .catch(alert),
          1000
        );
      }
    },
    [loadMoreTweet, moreTweetsLoading]
  );

  const shouldLoadMore = useMemo(() => {
    if (filterType === "tag") {
      console.log(
        filteredImages.length,
        " ",
        tags.get(filterTagName)?.images.length
      );
      return filteredImages.length !== tags.get(filterTagName)?.images.length;
    }

    return true;
  }, [filterType, filteredImages, tags, filterTagName]);

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
        {shouldLoadMore ? (
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
