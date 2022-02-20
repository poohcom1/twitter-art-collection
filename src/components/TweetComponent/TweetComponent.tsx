import { useRef, useLayoutEffect, useState, useEffect } from "react";
import ReactVisibilitySensor from "react-visibility-sensor";
import { Tweet } from "react-static-tweets";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import Controls from "./Controls";
import { useContext } from "react";
import TagsContext from "src/context/TagsContext";

const TweetWrapper = styled.div`
  width: 400px;
  height: fit-content;
  margin: 5px;
  padding: 5px;
  /* background-color: var(--bg-primary); */
`;

const fadeInAnim = keyframes`${fadeIn}`;

const RenderedTweet = styled.div`
  /* animation: 0.5s ${fadeInAnim}; */
`;

const EmptyTweet = styled.div<{ height: number }>`
  min-height: ${(props) => props.height ?? 50}px;
`;

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
  const tweetRef = useRef<HTMLDivElement>(null);

  const { tags, setTags } = useContext(TagsContext);

  const [load, setLoad] = useState(false);
  const [height, setHeight] = useState(50);

  useEffect(() => {
    setTimeout(() => setLoad(true), Math.min(props.order * 100, 2000));
  }, [props.order]);

  useLayoutEffect(() => {
    const tweetHeight = tweetRef.current?.clientHeight;

    if (tweetHeight && tweetHeight > height) {
      setHeight(tweetHeight);
    }
  }, [tweetRef.current?.clientHeight, height]);

  return (
    <ReactVisibilitySensor
      partialVisibility={true}
      offset={{ top: -2000, bottom: -2000 }}
    >
      {(sensor) => {
        if (load && sensor.isVisible) {
          return (
            <TweetWrapper>
              <Controls
                image={{
                  id: props.tweetId,
                  platform: "twitter",
                }}
              />
              <Tweet id={props.tweetId} ref={tweetRef} />
            </TweetWrapper>
          );
        } else {
          return (
            <TweetWrapper>
              <Controls
                image={{
                  id: props.tweetId,
                  platform: "twitter",
                }}
              />
              <EmptyTweet height={height} />
            </TweetWrapper>
          );
        }
      }}
    </ReactVisibilitySensor>
  );
}
