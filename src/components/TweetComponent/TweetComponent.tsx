import React, { useRef } from "react";
import TweetTags from "./TweetTags";
import styled, { keyframes } from "styled-components";
import { Tweet } from "..";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 100%;
  }
`;

const TweetDiv = styled.div`
  /* animation: ${fadeIn} 0.2s linear; */
`;

function TweetComponent(props: {
  id: string;
  tweet: TweetSchema;
  index?: number;
  order: number;
}) {
  const tweetRef = useRef<HTMLDivElement>(null);

  return (
    <TweetDiv>
      <TweetTags
        image={{
          id: props.id,
          platform: "twitter",
          ast: props.tweet.ast,
        }}
        tweetRef={tweetRef}
        imageSrcs={props.tweet.data?.content.media?.map((m) => m.url) ?? []}
      />
      <Tweet data={props.tweet.data!} />
    </TweetDiv>
  );
}

export default React.memo(TweetComponent);
