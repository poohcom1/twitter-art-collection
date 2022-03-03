import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TweetTags from "./TweetTags";
import VisibilitySensor from "react-visibility-sensor";
import styled, { DefaultTheme, keyframes } from "styled-components";
const Tweet = dynamic<{ id: string; ast: object[] }>(() =>
  import("react-static-tweets").then((module) => module.Tweet)
);

const blink = (props: { theme: DefaultTheme }) => keyframes`  
  from {
    background-color: ${props.theme.color.background};
  }

  to {
    background-color: ${props.theme.color.surface};
  }
`;

const PlaceholderDiv = styled.div`
  min-height: 500px;

  animation: ${(props) => blink(props)} 1s linear infinite;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 100%;
  }
`;

const TweetDiv = styled.div`
  animation: ${fadeIn} 0.2s linear;
`;

const MemoTweet = React.memo(Tweet);

const MIN_RENDER_QUEUE = 0; // How many Tweets to render automatically
const MAX_RENDER_QUEUE = 8; // How many Tweets to render until everything else loads at once
const RENDER_INTERVAL = 10; // in ms

function TweetComponent(props: {
  id: string;
  ast: TweetAst;
  index?: number;
  order: number;
}) {
  const [rendered, setRendered] = useState(props.order < MIN_RENDER_QUEUE);
  const [delayedRender, setDelayedRender] = useState(false);

  useEffect(() => {
    setRendered(false);
    setTimeout(
      () => setDelayedRender(true),
      Math.min(
        props.order * RENDER_INTERVAL,
        MAX_RENDER_QUEUE * RENDER_INTERVAL
      )
    );
  }, [props.order]);

  return (
    <VisibilitySensor
      partialVisibility={true}
      onChange={useCallback(() => {
        if (!rendered) setRendered(true);
      }, [rendered])}
    >
      {({ isVisible }) => (
        <>
          {(isVisible && delayedRender) || rendered ? (
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
          ) : (
            <PlaceholderDiv />
          )}
        </>
      )}
    </VisibilitySensor>
  );
}

export default TweetComponent;
