import React, { useEffect } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery/TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";

// Styles

export default function MainScene() {
  const session = useSession();
  // Loading
  const tweetsLoaded = useStore((state) => state.tweetsLoaded);

  const initTags = useStore((state) => state.initTags);
  const initTweet = useStore((state) => state.initTweets);

  useEffect(() => {
    // TODO Use modal for alert
    if (session.status === "authenticated") {
      initTags().then().catch(alert);
      initTweet().then().catch(alert);
    }
  }, [initTags, initTweet, session.status]);

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
