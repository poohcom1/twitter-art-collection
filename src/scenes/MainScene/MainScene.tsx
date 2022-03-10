import React, { useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";
import { ERR_LAST_PAGE } from "src/adapters";

// Styles

export default function MainScene() {
  const session = useSession();
  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  const initTags = useStore((state) => state.initTags);
  const loadTweets = useStore((state) => state.loadTweets);

  useEffect(() => {
    // TODO Use modal for alert
    if (session.status === "authenticated") {
      initTags().then().catch(alert);
      loadTweets()
        .then((err) => {
          switch (err) {
            case 0:
            case ERR_LAST_PAGE:
              setTweetsLoaded(true);
              break;
            case 429:
              setTweetsError("Server overloaded! Please try again later");
              break;
            default:
              setTweetsError(`An error occured! Error code: ${err}`);
          }
        })
        .catch(alert);
    }
  }, [initTags, loadTweets, session.status]);

  return (
    <div
      className="App"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header />
      {tweetsError !== "" ? (
        <div className="main">{tweetsError}</div>
      ) : tweetsLoaded ? (
        <TweetsGallery />
      ) : (
        <LoadingScene display={true} />
      )}
    </div>
  );
}
