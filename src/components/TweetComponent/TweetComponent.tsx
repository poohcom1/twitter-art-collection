import ReactVisibilitySensor from "react-visibility-sensor";
import { Tweet } from "react-static-tweets";
import styled from "styled-components";

const TweetWrapper = styled.div`
  width: 400px;
  height: fit-content;
  min-height: 300px;
  margin: 5px;
  padding: 5px;
  background-color: #6edfdf;
`;

const EmptyTweet = styled.div`
  min-height: 500px;
  height: 500px;
`;

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
  return (
    <TweetWrapper>
      <ReactVisibilitySensor>
        {(visible) => {
          if (visible) return <Tweet id={props.tweetId} />;
          else {
            console.log("Don't draw!!");
            return <EmptyTweet />;
          }
        }}
      </ReactVisibilitySensor>
    </TweetWrapper>
  );
}
