import { useEffect, useState } from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import { TweetComponent, TwitterLogin } from "../../components";
import { useSession } from "next-auth/react";
import Header from "./Header/Header";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import TagsContext from "src/context/TagsContext";
import { TagSchema } from "api";

// Styles
const HEADER_HEIGHT = 150;

const Columns = styled.div`
  display: flex;
  justify-content: center;
`;

const DisplayDiv = styled.div``;

const LoadingDiv = styled.div`
  animation: 0.5s ${keyframes`${fadeIn}`};
`;

// Helper functions
function createColumns(columns: number, tweetList: Array<TweetWrapper>) {
  const columnDivs = [];

  for (let i = 0; i < columns; i++) {
    columnDivs.push(
      <DisplayDiv key={i}>
        {(() => {
          const tweets = [];
          for (let j = i; j < tweetList.length; j += columns) {
            tweets.push(
              <TweetComponent
                tweetId={`${tweetList[j].tweetId}`}
                order={j}
                key={j}
              />
            );
          }
          return tweets;
        })()}
      </DisplayDiv>
    );
  }

  return columnDivs;
}

function tweetFilter(tweet: APITweet, payload: MultipleTweetsLookupResponse) {
  if (!tweet.attachments) {
    return false;
  }

  const keys = tweet.attachments?.media_keys;

  for (const key of keys!) {
    const media = payload.includes?.media?.find((obj) => obj.media_key === key);

    if (media?.type === "photo") return true;
  }
  return false;
}

export default function Main() {
  const session = useSession();

  const [tags, setTags] = useState<TagCollection>([]);

  const [loaded, setLoaded] = useState(false);
  const [columns, setColumns] = useState(4);
  const [tweetList, setTweetList] = useState<Array<TweetWrapper>>([]);

  useEffect(() => {
    if (session.data) {
      const username = session.data.user.id;

      fetch(`/api/likes/${username}/0?useId=true`, {
        method: "GET",
        cache: "force-cache",
      })
        .then((res) => res.json())
        .then((payload: MultipleTweetsLookupResponse) => {
          setTweetList(
            payload.data
              .filter((t) => tweetFilter(t, payload))
              .map((data) => ({ tweetId: data.id, tags: [] }))
          );
        })
        .catch((err) => console.log("[Likes fetch error] " + err));
    }
  }, [session.data]);

  return (
    <div className="App">
      <TagsContext.Provider value={{ tags, setTags }}>
        <Header height={HEADER_HEIGHT} />
        <div style={{ height: `${HEADER_HEIGHT}px` }} />
        <Columns>{createColumns(columns, tweetList)}</Columns>
      </TagsContext.Provider>
    </div>
  );
}
