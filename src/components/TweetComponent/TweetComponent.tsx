import React from "react";
import dynamic from "next/dynamic";
import TweetTags from "./TweetTags";
import styled, { keyframes } from "styled-components";
const Tweet = dynamic<{ id: string; ast: object[] }>(() =>
  import("react-static-tweets").then((module) => module.Tweet)
);

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
  return (
    <TweetDiv>
      <TweetTags
        image={{
          id: props.id,
          platform: "twitter",
          ast: props.ast,
        }}
      />
      <MemoTweet id={props.ast[0].data.id} ast={props.ast} />
    </TweetDiv>
  );
}

export default React.memo(TweetComponent);
