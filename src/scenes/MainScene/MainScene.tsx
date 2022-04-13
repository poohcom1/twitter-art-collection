import React, { useEffect, useState, useCallback } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";
import styled from "styled-components";

// Styles
const AppDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 100vh;
`;

export default function MainScene() {
  const session = useSession();
  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  const initTweetsAndTags = useStore((state) => state.initTweetsAndTags);

  useEffect(() => {
    if (session.status === "authenticated") {
      initTweetsAndTags()
        .then((err) => {
          setTweetsLoaded(true);

          if (err) {
            setTweetsError(err);
          }
        })
        .catch(alert);
    }
  }, [initTweetsAndTags, session.status]);

  // Filtering and rendering
  const imageFilter = useStore((state) => state.imageFilter);

  const newUser = useStore((state) => state.newUser);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [imageFilter]);

  // Filter image
  const filteredImages = useStore(
    useCallback((state) => state.getFilteredTweets(), [])
  );

  if (tweetsError !== "") {
    return (
      <AppDiv className="App">
        <Header />
        <div className="main">{tweetsError}</div>
      </AppDiv>
    );
  }

  if (!tweetsLoaded || newUser) {
    return (
      <AppDiv className="App">
        <LoadingScene
          display={true}
          text={newUser ? "Creating new user..." : ""}
        />
      </AppDiv>
    );
  }

  return (
    <AppDiv className="App">
      <Header />
      <TweetsGallery images={filteredImages} />
    </AppDiv>
  );
}
