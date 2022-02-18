import ReactVisibilitySensor from "react-visibility-sensor";
import { Tweet } from "react-static-tweets";
import styled from "styled-components";
import { useRef, useLayoutEffect, useState } from "react";

const TweetWrapper = styled.div`
  width: 400px;
  height: fit-content;
  min-height: 300px;
  margin: 5px;
  padding: 5px;
  background-color: #6edfdf;
`;

const EmptyTweet = styled.div<{ height: number }>`
  min-height: ${(props) => props.height ?? 500}px;
`;

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
  const tweetRef = useRef<HTMLDivElement>(null);

  const [seen, setSeen] = useState(false);
  const [height, setHeight] = useState(500);

  useLayoutEffect(() => {
    const tweetHeight = tweetRef.current?.clientHeight;

    console.log(tweetHeight);

    if (tweetHeight) {
      setHeight(tweetHeight);
    }
  }, [tweetRef.current?.clientHeight]);

  return (
    <TweetWrapper>
      <ReactVisibilitySensor
        partialVisibility={true}
        offset={{ top: -500, bottom: -500 }}
      >
        {(sensor) => {
          if (sensor.isVisible) {
            return <Tweet id={props.tweetId} ref={tweetRef} />;
          } else {
            return <EmptyTweet height={height} />;
          }
        }}
      </ReactVisibilitySensor>
    </TweetWrapper>
  );
}
