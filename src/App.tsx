import { useState } from "react";
import "./App.css";

function App() {
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
      .then((data) => {
        setTweetList(data.data.map((obj: { id: string }) => obj.id));
      })
      .catch(console.error);
  };

  return (
    <div className="App">
      <button onClick={getUser}>Click me</button>
      <div>
        {tweetList.map((id) => (
          <div id={id}>
            <blockquote className="twitter-tweet">
              <p lang="ja" dir="ltr">
                もう一本　
                <a href="https://twitter.com/hashtag/%E6%9D%B1%E6%96%B9Project?src=hash&amp;ref_src=twsrc%5Etfw">
                  #東方Project
                </a>{" "}
                <a href="https://twitter.com/hashtag/%E6%9D%B1%E6%96%B9?src=hash&amp;ref_src=twsrc%5Etfw">
                  #東方
                </a>{" "}
                <a href="https://twitter.com/hashtag/%E6%B2%B3%E5%9F%8E%E3%81%AB%E3%81%A8%E3%82%8A?src=hash&amp;ref_src=twsrc%5Etfw">
                  #河城にとり
                </a>{" "}
                <a href="https://t.co/EPOgR3Io9m">pic.twitter.com/EPOgR3Io9m</a>
              </p>
              &mdash; kajatony (@kajatony_tweet){" "}
              <a href="https://twitter.com/kajatony_tweet/status/1492828845975928837?ref_src=twsrc%5Etfw">
                February 13, 2022
              </a>
            </blockquote>
            n
            <script
              async
              src="https://platform.twitter.com/widgets.js"
              charSet="utf-8"
            ></script>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
