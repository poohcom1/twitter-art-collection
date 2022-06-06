import React from "react";
import TweetTags from "./TweetTags";
import styled, { keyframes, useTheme } from "styled-components";
import { Tweet } from "..";
import { darkTheme } from "src/themes";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
  tweetData: TweetExpansions | undefined;
  index: number;
}) {
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
        imageSrcs={props.tweetData?.content.media?.map((m) => m.url) ?? []}
      />
      <SkeletonTheme baseColor="#3d3d3d" highlightColor="#818181">
        <Tweet data={props.tweetData} darkMode={theme === darkTheme} />
      </SkeletonTheme>
    </TweetDiv>
  );
}

export default TweetComponent;
