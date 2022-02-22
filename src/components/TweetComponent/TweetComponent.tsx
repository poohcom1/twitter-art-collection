import { Tweet } from "react-static-tweets";
import TweetTags from "./TweetTags";

export default function TweetComponent(props: { id: string; index?: number }) {
  return (
    <div style={{ flex: 1 }}>
      <TweetTags
        image={{
          id: props.id,
          platform: "twitter",
        }}
      />
      <Tweet id={props.id} />
    </div>
  );
}
