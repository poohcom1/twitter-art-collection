import React, { useRef } from "react";
import TweetTags from "./TweetTags";
import styled, { keyframes } from "styled-components";
import { Tweet } from "react-static-tweets";

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

const MemoTweet = React.memo(Tweet);

function TweetComponent(props: {
  id: string;
  ast: TweetAst;
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
          ast: props.ast,
        }}
        tweetRef={tweetRef}
      />
      <MemoTweet id={props.id} ref={tweetRef} />
    </TweetDiv>
  );
}

export default React.memo(TweetComponent);
