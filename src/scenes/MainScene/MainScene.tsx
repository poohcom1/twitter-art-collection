import React, { useEffect } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery/TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";

// Styles
const HEADER_HEIGHT = 100;

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
    <div className="App">
      <Header height={HEADER_HEIGHT} />
      {tweetsLoaded ? (
        <div>
          <div style={{ minHeight: `${HEADER_HEIGHT}px` }} />
          <TweetsGallery />
        </div>
      ) : (
        <LoadingScene display={true} />
      )}
    </div>
  );
}
