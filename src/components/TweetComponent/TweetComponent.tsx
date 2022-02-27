import React, { useCallback, useEffect, useState } from "react";
import { Tweet } from "react-static-tweets";
import TweetTags from "./TweetTags";
import VisibilitySensor from "react-visibility-sensor";

const MemoTweet = React.memo(Tweet);

const MIN_RENDER_COUNT = 8;

function TweetComponent(props: {
  id: string;
  ast?: any;
  index?: number;
  order: number;
}) {
  const [rendered, setRendered] = useState(props.order < MIN_RENDER_COUNT);

  useEffect(
    () => setRendered(props.order < MIN_RENDER_COUNT),
    [props.id, props.ast, props.order]
  );

  return (
    <VisibilitySensor
      partialVisibility={true}
      onChange={useCallback(() => {
        if (!rendered) setRendered(true);
      }, [rendered])}
    >
      {({ isVisible }) => (
        <>
          {isVisible || rendered ? (
            <div style={{ flex: 1 }}>
              <TweetTags
                image={{
                  id: props.id,
                  platform: "twitter",
                  ast: props.ast,
                }}
              />
              <MemoTweet id={props.ast[0].data.id} ast={props.ast} />
            </div>
          ) : (
            <div style={{ height: "200px" }}></div>
          )}
        </>
      )}
    </VisibilitySensor>
  );
}

export default TweetComponent;
