import React, { useEffect, useState } from "react";
import Header from "./Header/Header";
import { LoadingScene } from "..";
import TweetsGallery from "./TweetsGallery";
import { useSession } from "next-auth/react";
import { useStore } from "src/stores/rootStore";
import { ERR_LAST_PAGE } from "src/adapters";
import styled from "styled-components";

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

  return (
    <AppDiv className="App">
      <Header />
      {tweetsError !== "" ? (
        <div className="main">{tweetsError}</div>
      ) : tweetsLoaded ? (
        <TweetsGallery />
      ) : (
        <LoadingScene display={true} />
      )}
    </AppDiv>
  );
}
