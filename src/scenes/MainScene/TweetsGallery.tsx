import styled from "styled-components";
import React, { useEffect, useRef } from "react";
import { useCallback, useMemo } from "react";
import { useStore } from "src/stores/rootStore";
import { TweetComponent } from "../../components";
import Masonry from "react-masonry-css";

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  padding: 32px;
  padding-top: 120px;
  overflow-y: scroll;
`;

function LoadingMasonry(props: { children: React.ReactNode[] }) {
  return (
    <Masonry
      breakpointCols={4}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {props.children}
    </Masonry>
  );
}

export default function TweetsGallery() {
  // Filtering and rendering
  const tweets = useStore((state) => state.tweets);
  const imageFilter = useStore((state) => state.imageFilter);
  // For scroll to top
  const mainDivRef = useRef<HTMLDivElement>(null);

  const images: TweetSchema[] = useMemo(() => {
    if (tweets)
      return tweets.map((tweet) => ({ ...tweet, platform: "twitter" }));
    else return [];
  }, [tweets]);

  const filteredTags = useStore(
    useCallback((state) => images.filter(state.imageFilter), [images])
  );

  // Scroll to top on filter change
  useEffect(() => {
    if (mainDivRef.current) mainDivRef.current.scrollTo(0, 0);
  }, [imageFilter]);

  return (
    <MainDiv ref={mainDivRef}>
      <LoadingMasonry>
        {filteredTags.map((data, i) => (
          <TweetComponent id={data.id} ast={data.ast} key={data.id} order={i} />
        ))}
      </LoadingMasonry>
    </MainDiv>
  );
}
