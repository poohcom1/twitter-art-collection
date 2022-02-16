import { useState } from "react";
import { MultipleTweetsLookupResponse } from "twitter-types";
import { TweetComponent } from "../../components";
import styled from "styled-components";

const DisplayDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

function Main() {
  const [tweetList, setTweetList] = useState<Array<string>>([]);

  let username = "poohcom1";

  const getUser = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${username}/0`, {
      method: "GET",
      mode: "cors",
      cache: "force-cache",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((payload: MultipleTweetsLookupResponse) => {
        const imageTweets = payload.data.filter(
          (tweet) => "attachments" in tweet
        );

        setTweetList(imageTweets.map((data) => data.id));
      })
      .catch(console.error);
  };

  return (
    <div className="App">
      <button onClick={getUser}>Click me</button>
      <DisplayDiv>
        {tweetList.map((id, i) => (
          <div key={i}>
            <TweetComponent tweetId={`${id}`} order={i} />
          </div>
        ))}
      </DisplayDiv>
    </div>
  );
}

export default Main;
