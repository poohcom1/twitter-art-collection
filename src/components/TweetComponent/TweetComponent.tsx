import { useRef, useLayoutEffect, useState, useEffect } from "react";
import ReactVisibilitySensor from "react-visibility-sensor";
import { Tweet } from "react-static-tweets";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import Controls from "./TweetTags";
import { useContext } from "react";
import TagsContext from "src/context/TagsContext";
import { Spinner } from "..";

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
  background-color: ${(props) =>
    props.loaded ? "transparent" : props.theme.color.field.hover};
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
  const idRef = useRef(props.tweetId);
  const tweetRef = useRef<HTMLDivElement>(null);

  const [load, setLoad] = useState(false);
  // Expands to max height when tweet is loaded, so height is still retained when not visible
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // TweetComponents are reused on re-renders, so image could change
    //  When new image is loaded, reset height
    if (props.tweetId !== idRef.current) {
      idRef.current = props.tweetId;

      setHeight(0);
    }

    // Render the components in order with a cap, so higher up images get priority
    setTimeout(() => setLoad(true), Math.min(props.order * 100, 2000));
  }, [props.order, props.tweetId]);

  // Expand image on layout change
  useLayoutEffect(() => {
    const tweetHeight = tweetRef.current?.clientHeight;

    if (tweetHeight && tweetHeight > height) {
      setHeight(tweetHeight);
    }
  }, [tweetRef.current?.clientHeight, height]);

  return (
    <TweetWrapper height={height} ref={tweetRef} loaded={load}>
      <ReactVisibilitySensor
        partialVisibility={true}
        offset={{ top: -500, bottom: -500 }}
      >
        {(sensor) => {
          if (load && sensor.isVisible) {
            return (
              <div style={{ flex: 1 }}>
                <Controls
                  image={{
                    id: props.tweetId,
                    platform: "twitter",
                  }}
                />
                <Tweet id={props.tweetId} />
              </div>
            );
          } else {
            return <Spinner size={30} />;
          }
        }}
      </ReactVisibilitySensor>
    </TweetWrapper>
  );
}
