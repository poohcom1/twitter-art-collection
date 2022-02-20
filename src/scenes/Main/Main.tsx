import { useEffect, useState } from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import { useSession } from "next-auth/react";
import Header from "./Header/Header";
import fetchBuilder from "fetch-retry-ts";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import { TweetComponent } from "../../components";
import TagsContext from "src/context/TagsContext";

//
const fetchRetry = fetchBuilder(fetch, {
  retries: 5,
});

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
function createColumns(columns: number, tweetList: Array<string>) {
  const columnDivs = [];

  for (let i = 0; i < columns; i++) {
    columnDivs.push(
      <DisplayDiv key={i}>
        {(() => {
          const tweets = [];
          for (let j = i; j < tweetList.length; j += columns) {
            tweets.push(
              <TweetComponent tweetId={`${tweetList[j]}`} order={j} key={j} />
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

  const [tags, setTags] = useState<TagCollection>(new Map());

  const [loaded, setLoaded] = useState(false);
  const [columns, setColumns] = useState(4);
  const [tweetList, setTweetList] = useState<Array<string>>([]);

  useEffect(() => {
    if (session.data) {
      const username = session.data.user.id;

      // Get tweets
      fetchRetry(`/api/likes/${username}/0?useId=true`, {
        method: "GET",
        cache: "force-cache",
      })
        .then((res) => res.json())
        .then((payload: MultipleTweetsLookupResponse) => {
          setTweetList(
            payload.data
              .filter((t) => tweetFilter(t, payload))
              .map((data) => data.id)
          );
        })
        .catch((err) => console.log("[Likes fetch error] " + err));

      // Get tags

      fetchRetry(`/api/user/${session.data.user.id}/tags`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((newTags) => {
          setTags(new Map(Object.entries(newTags)));
        })
        .catch(console.error);
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
