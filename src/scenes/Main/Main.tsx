import { useContext, useEffect, useState } from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import { useSession } from "next-auth/react";
import Header from "./Header/Header";
import fetchBuilder from "fetch-retry-ts";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import { TweetComponent } from "../../components";
import TagsContext from "src/context/TagsContext";
import { FetchErrors, getLikes, getTags } from "src/adapters";
import { useRouter } from "next/router";

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

  const { setTags } = useContext(TagsContext);

  const [columns, setColumns] = useState(4);
  const [tweetList, setTweetList] = useState<Array<string>>([]);

  useEffect(() => {
    if (session.data) {
      const uid = session.data.user.id;

      // Get tweets
      getLikes(uid)
        .then((payload) =>
          setTweetList(
            payload.data
              .filter((t) => tweetFilter(t, payload))
              .map((data) => data.id)
          )
        )
        .catch(console.error);
    }
  }, [session.data, setTags]);

  return (
    <div className="App">
      <Header height={HEADER_HEIGHT} />
      <div style={{ height: `${HEADER_HEIGHT}px` }} />
      <Columns>{createColumns(columns, tweetList)}</Columns>
    </div>
  );
}
