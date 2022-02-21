import { Tweet } from "react-static-tweets";
import Controls from "./TweetTags";

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
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
}
