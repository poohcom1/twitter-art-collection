import { useRef, useLayoutEffect, useState, useEffect } from "react";
import ReactVisibilitySensor from "react-visibility-sensor";
import { Tweet } from "react-static-tweets";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import Controls from "./TweetTags";
import { Spinner } from "..";
import { useResizeDetector } from "react-resize-detector";

const VISIBILITY_RANGE = 2000;

const TweetWrapper = styled.div<{ height: number; loaded: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;

  width: 400px;
  height: fit-content;
  min-height: ${(props) => (props.loaded ? props.height : 500)}px;
  margin: 5px;
  padding: 5px;
`;

const fadeInAnim = keyframes`${fadeIn}`;

const RenderedTweet = styled.div`
  /* animation: 0.5s ${fadeInAnim}; */
`;

const EmptyTweet = styled.div`
  min-height: 50px;
`;

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
  const idRef = useRef("");

  const [loaded, setLoaded] = useState(false);
  // Expands to max height when tweet is loaded, so height is still retained when not visible
  const [divHeight, setHeight] = useState(0);

  const { ref, height } = useResizeDetector();

  useEffect(() => {
    // TweetComponents are reused on re-renders, so image could change
    //  When new image is loaded, reset height
    if (props.tweetId !== idRef.current) {
      idRef.current = props.tweetId;

      setHeight(0);
    }

    // Render the components in order with a cap, so higher up images get priority
    setTimeout(() => setLoaded(true), Math.min(props.order * 100, 2000));
  }, [props.order, props.tweetId]);

  // Expand image on layout change
  useLayoutEffect(() => {
    const tweetHeight = ref.current?.clientHeight;

    if (height && tweetHeight && tweetHeight > divHeight) {
      console.log("New height: " + height);
      setHeight(tweetHeight);
    }
  }, [divHeight, height, ref]);

  return (
    <ReactVisibilitySensor
      partialVisibility={true}
      offset={{ top: -VISIBILITY_RANGE, bottom: -VISIBILITY_RANGE }}
    >
      {(sensor) => (
        <TweetWrapper height={divHeight} ref={ref} loaded={loaded}>
          {loaded && sensor.isVisible ? (
            <div style={{ flex: 1 }}>
              <Controls
                image={{
                  id: props.tweetId,
                  platform: "twitter",
                }}
              />
              <Tweet id={props.tweetId} />
            </div>
          ) : (
            <Spinner size={30} />
          )}
        </TweetWrapper>
      )}
    </ReactVisibilitySensor>
  );
}
