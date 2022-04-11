import React, { useEffect, useState, useCallback } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";
import { ERR_LAST_PAGE } from "src/adapters";
import styled from "styled-components";
import { imageEqual } from "src/utils/objectUtils";

// Styles
const AppDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  display: flex;
  flex-direction: column;
  height: fit-content;
`;

export default function MainScene() {
  const session = useSession();
  // Loading
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  const initTweetsAndTags = useStore((state) => state.initTweetsAndTags);

  useEffect(() => {
    // TODO Use modal for alert
    if (session.status === "authenticated") {
      initTweetsAndTags()
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
  }, [initTweetsAndTags, session.status]);

  // Filtering and rendering
  const imageFilter = useStore((state) => state.imageFilter);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [imageFilter]);

  // Filter image, and add extra image if tag is selected
  const filteredImages = useStore(
    useCallback((state) => {
      let tweets = state.getTweets();

      if (state.filterType === "tag")
        tweets = tweets.concat(
          // Concat unique tweets from
          state.extraTweets.filter(
            (extraTweet) => !tweets.find((t) => imageEqual(t, extraTweet))
          )
        );

      const filteredTweets = tweets.filter(state.imageFilter);

      return filteredTweets;
    }, [])
  );

  return (
    <AppDiv className="App">
      <Header />
      {tweetsError !== "" ? (
        <div className="main">{tweetsError}</div>
      ) : tweetsLoaded ? (
        <TweetsGallery images={filteredImages} />
      ) : (
        <LoadingScene display={true} />
      )}
    </AppDiv>
  );
}
