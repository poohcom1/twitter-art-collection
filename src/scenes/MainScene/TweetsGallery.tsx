import styled from "styled-components";
import React from "react";
import { Masonry } from "masonic";
import { TweetComponent } from "../../components";

const MainDiv = styled.div`
  padding: 120px 20px;
`;

/**
 * Draw tweets to a masonry depending on the current filter
 * Will infinitely load tweets for "all" and "uncategorized" filters
 * Will immediately load tweets for "tag" filters into "extraTweets"
 */
export default function TweetsGallery(props: { images: TweetSchema[] }) {
  return (
    <MainDiv>
      <Masonry
        items={props.images}
        render={MasonryCard}
        columnWidth={300}
        columnGutter={20}
      />
    </MainDiv>
  );
}

const MasonryCard = (props: {
  index: number;
  data: TweetSchema;
  width: number;
}) => {
  return (
    <TweetComponent
      id={props.data.id}
      ast={props.data.ast}
      key={props.data.id}
      order={props.index}
    />
  );
};
