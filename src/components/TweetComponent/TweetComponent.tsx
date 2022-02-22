import { Tweet } from "react-static-tweets";
import Controls from "./TweetTags";

export default function TweetComponent(props: { id: string; index?: number }) {
  return (
    <div style={{ flex: 1 }}>
      <Controls
        image={{
          id: props.id,
          platform: "twitter",
        }}
      />
      <Tweet id={props.id} />
    </div>
  );
}
