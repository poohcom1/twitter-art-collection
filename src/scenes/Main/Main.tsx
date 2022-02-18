import { useState } from "react";
import { MultipleTweetsLookupResponse } from "twitter-types";
import { TweetComponent, TwitterLogin } from "../../components";
import styled from "styled-components";
import { useSession } from "next-auth/react";

const Rows = styled.div`
  display: flex;
`;

const DisplayDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

function Main() {
  const session = useSession();

  const [columns, setColumns] = useState(4);
  const [tweetList, setTweetList] = useState<Array<TweetWrapper>>([]);

  let usernameOrId = "poohcom1";
  let useId = false;

  if (session.data) {
    usernameOrId = session.data.user.id;
    useId = true;
  }

  const getUser = () => {
    fetch(`/api/likes/${usernameOrId}/0?useId=${useId}`, {
      method: "GET",
      mode: "cors",
      cache: "force-cache",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((payload: MultipleTweetsLookupResponse) => {
        const imageTweets = payload.data.filter((tweet) => {
          if (!tweet.attachments) {
            return false;
          }

          const keys = tweet.attachments?.media_keys;

          for (const key of keys!) {
            const media = payload.includes?.media?.find(
              (obj) => obj.media_key === key
            );

            if (media?.type === "photo") return true;
          }
          return false;
        });

        setTweetList(
          imageTweets.map((data) => {
            return { tweetId: data.id, categories: [] };
          })
        );
      })
      .catch((err) => console.log("[Likes fetch error] " + err));
  };

  const createColumns = () => {
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
  };

  return (
    <div className="App">
      <TwitterLogin />
      <button onClick={getUser}>Click me</button>
      <Rows>{createColumns()}</Rows>
    </div>
  );
}

export default Main;
