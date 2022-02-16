import ReactVisibilitySensor from "react-visibility-sensor";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { useState } from "react";

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <ReactVisibilitySensor>
      {(isVisible) => {
        if (isVisible) {
          setTimeout(() => setVisible(true), props.order * 500);
          if (visible) {
            return (
              <div>
                <TwitterTweetEmbed tweetId={props.tweetId} />
              </div>
            );
          } else {
            return <></>;
          }
        } else {
          return <></>;
        }
      }}
    </ReactVisibilitySensor>
  );
}
