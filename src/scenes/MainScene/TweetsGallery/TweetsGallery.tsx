import styled from "styled-components";
import React, { useEffect } from "react";
import { useCallback, useMemo } from "react";
import { useTweets } from "src/context/TweetsContext";
import { useStore } from "src/stores/rootStore";
import { TweetComponent } from "../../../components";
import Masonry from "react-masonry-css";

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.bg.primary};
`;

class LoadingMasonryA extends React.Component {
  children: React.ReactNode;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.children = props.children;
  }

  componentDidUpdate() {
    console.log("Finished rendering");
  }

  render(): React.ReactNode {
    return (
      <Masonry
        breakpointCols={4}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {this.props.children}
      </Masonry>
    );
  }
}

function LoadingMasonry(props: { children: React.ReactNode }) {
  useEffect(() => {
    // stopLoading();
  }, [props.children]);

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
  const { tweets } = useTweets();

  const images: TweetSchema[] = useMemo(() => {
    if (tweets)
      return tweets.map((tweet) => ({ ...tweet, platform: "twitter" }));
    else return [];
  }, [tweets]);

  const filteredTags = useStore(
    useCallback((state) => images.filter(state.imageFilter), [])
  );

  return (
    <MainDiv style={{ padding: "32px" }}>
      <LoadingMasonry>
        {filteredTags.map((data) => (
          <TweetComponent id={data.id} ast={data.ast} key={data.id} />
        ))}
      </LoadingMasonry>
    </MainDiv>
  );
}
