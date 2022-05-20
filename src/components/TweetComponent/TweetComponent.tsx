import React, { useRef } from "react";
import TweetTags from "./TweetTags";
import styled, { keyframes, useTheme } from "styled-components";
import { Tweet } from "..";
import { darkTheme } from "src/themes";

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
  outline-color: blue;
  outline-width: 2px;

  &:focus {
    outline-style: solid;
  }
  border-radius: 10px;
`;

function TweetComponent(props: {
  id: string;
  tweet: TweetSchema;
  index: number;
}) {
  const tweetRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  return (
    <TweetDiv
      id={`tweetComp${props.index}`}
      className={`tweetComp`}
      data-index={props.index}
    >
      <TweetTags
        image={{
          id: props.id,
          platform: "twitter",
        }}
        tweetRef={tweetRef}
        imageSrcs={props.tweet.data?.content.media?.map((m) => m.url) ?? []}
      />
      <Tweet data={props.tweet.data!} darkMode={theme === darkTheme} />
    </TweetDiv>
  );
}

export default React.memo(TweetComponent);
