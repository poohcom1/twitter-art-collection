import React, { useRef } from "react";
import TweetTags from "./TweetTags";
import styled, { keyframes } from "styled-components";
import { Tweet } from "..";
import { useStore } from "src/stores/rootStore";
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
  const theme = useStore((state) => state.theme);

  return (
    <TweetDiv data-cy="tweet" tabIndex={props.index + 1}>
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
