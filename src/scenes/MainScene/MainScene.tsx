import React, { useEffect, useRef, useState } from "react";
import Header from "./Header/Header";
import { TweetProvider } from "src/context/TweetsContext";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery/TweetsGallery";

// Styles
const HEADER_HEIGHT = 100;

export default function MainScene() {
  // Loading
  const [loaded, setPageLoaded] = useState(false);

  const tweetDataRef: any = useRef();

  useEffect(() => {
    fetch("/api/tweets")
      .then((res) => res.json())
      .then((res) => {
        tweetDataRef.current = res.tweetData;
        setPageLoaded(true);
      });
  });

  return (
    <div className="App">
      <Header height={HEADER_HEIGHT} />
      {loaded ? (
        <TweetProvider value={tweetDataRef.current}>
          <div style={{ minHeight: `${HEADER_HEIGHT}px` }} />
          <TweetsGallery />
        </TweetProvider>
      ) : (
        <LoadingScene />
      )}
    </div>
  );
}
