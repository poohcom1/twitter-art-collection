import React, { useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";

// Styles

export default function MainScene() {
  const session = useSession();
  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);

  const initTags = useStore((state) => state.initTags);
  const loadTweets = useStore((state) => state.loadTweets);

  useEffect(() => {
    // TODO Use modal for alert
    if (session.status === "authenticated") {
      initTags().then().catch(alert);
      loadTweets()
        .then(() => setTweetsLoaded(true))
        .catch(alert);
    }
  }, [initTags, loadTweets, session.status]);

  return (
    <div
      className="App"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header />
      {tweetsLoaded ? <TweetsGallery /> : <LoadingScene display={true} />}
    </div>
  );
}
