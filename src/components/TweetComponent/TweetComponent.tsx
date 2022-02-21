import { Tweet } from "react-static-tweets";
import TweetTags from "./TweetTags";

export default function TweetComponent(props: {
  tweetId: string;
  order: number;
}) {
  return (
    <div style={{ flex: 1 }}>
      <TweetTags
        image={{
          id: props.tweetId,
          platform: "twitter",
        }}
      />
      <Tweet id={props.tweetId} />
    </div>
  );
}
