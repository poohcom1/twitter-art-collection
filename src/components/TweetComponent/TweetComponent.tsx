import React from "react";
import { Tweet } from "react-static-tweets";
import TweetTags from "./TweetTags";

const MemoTweet = React.memo(Tweet);

export default function TweetComponent(props: {
  id: string;
  ast?: any;
  index?: number;
}) {
  return (
    <div style={{ flex: 1 }}>
      <TweetTags
        image={{
          id: props.id,
          platform: "twitter",
        }}
      />
      <MemoTweet id={props.ast[0].data.id} ast={props.ast} />
    </div>
  );
}
