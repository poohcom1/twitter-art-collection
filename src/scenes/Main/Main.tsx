import { useState } from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import { TweetComponent, TwitterLogin } from "../../components";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import Header from "./Header/Header";

const Rows = styled.div`
  display: flex;
`;

const DisplayDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

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

function Main() {
  const session = useSession();

  const [columns, setColumns] = useState(4);
  const [tweetList, setTweetList] = useState<Array<TweetWrapper>>([]);

  const getUser = () => {
    fetch(`/api/likes/${usernameOrId}/0?useId=${useId}`, {
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
  };

  let usernameOrId = "poohcom1";
  let useId = false;

  if (session.data) {
    usernameOrId = session.data.user.id;
    useId = true;
    getUser();
  }

  return (
    <div className="App">
      <Header />
      <Rows>{createColumns(columns, tweetList)}</Rows>
    </div>
  );
}

export default Main;
