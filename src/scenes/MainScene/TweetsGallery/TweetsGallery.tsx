import styled from "styled-components";
import React from "react";
import { useCallback, useMemo } from "react";
import { useTweets } from "src/context/TweetsContext";
import { useStore } from "src/stores/rootStore";
import { TweetComponent } from "../../../components";
import Masonry from "react-masonry-css";

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.bg.primary};
`;

interface TagSchema extends ImageSchema {
  ast: any;
}

let tweetComponents: React.ReactNode[] = [];

export default function TweetsGallery() {
  // Filtering and rendering
  const { tweets } = useTweets();

  const images: TagSchema[] = useMemo(() => {
    return tweets.map((tweet) => ({ ...tweet, platform: "twitter" }));
  }, [tweets]);

  const filteredTags = useStore(
    useCallback((state) => images.filter(state.imageFilter), [])
  );

  return (
    <MainDiv style={{ padding: "32px" }}>
      <Masonry
        breakpointCols={4}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {filteredTags.map((data) => (
          <TweetComponent id={data.id} ast={data.ast} key={data.id} />
        ))}
      </Masonry>
    </MainDiv>
  );
}
