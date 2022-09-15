import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { CANONICAL_URL, SPECIAL_LIST_KEYS } from "types/constants";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getUserId } from "lib/nextAuth";
import { useStore } from "src/stores/rootStore";
import {
  ContextMenu,
  DeleteOverlay,
  GitterOverlay,
  Header,
  LoadingScene,
  OverlayContainer,
  TagTitleHeader,
  ThemeOverlay,
  TweetsGallery,
  ZoomOverlay,
} from "src/components";
import { useDisplayStore } from "src/stores/displayStore";
import { FetchState } from "src/stores/ImageList";
import styled, { createGlobalStyle } from "styled-components";
import useMediaQuery from "src/hooks/useMediaQuery";

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const uid = await getUserId(context.req);

  if (!uid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function Index() {
  const router = useRouter();

  const errorMessage = useStore((state) => state.errorMessage);

  useEffect(() => {
    if (errorMessage) {
      router
        .push("/error?message=" + errorMessage)
        .then()
        .catch(console.error);
    }
  }, [errorMessage, router]);

  useEffect(() => {
    const gitterScript = document.createElement("script");

    gitterScript.id = "gitter";
    gitterScript.innerHTML = `
            ;((window.gitter = {}).chat = {}).options = {
            room: "twitter-art-collection/community",
            activationElement: "#open-gitter-button",}`;

    const gitterSource = document.createElement("script");
    gitterSource.src = "https://sidecar.gitter.im/dist/sidecar.v1.js";
    gitterSource.defer = true;
    gitterSource.async = true;

    document.body.appendChild(gitterScript);
    document.body.appendChild(gitterSource);
  }, []);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <link rel="canonical" href={`${CANONICAL_URL}/collection`} />
      </Head>

      <MainScene />
    </>
  );
}

// Styles
const GlobalStyle = createGlobalStyle`
  html {
      width: 100vw;
  }
  
  body {
    background-color: ${(props) => props.theme.color.background};
    color: ${(props) => props.theme.color.onBackground};
    width: 100vw;
    overflow-x: hidden;

    transition: background-color 0.1s;
  }
`;

const AppDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

function MainScene() {
  const router = useRouter();
  const isMobile = useMediaQuery();

  const selectedLists = useStore((state) =>
    state.selectedLists.filter((list) => !SPECIAL_LIST_KEYS.includes(list))
  );

  // Load URL params
  const setSelectedList = useStore((state) => state.setSelectedList);

  useEffect(() => {
    const tags = router.query.tag;

    if (tags) setSelectedList(typeof tags === "string" ? [tags] : tags);
  }, [router.query.tag, setSelectedList]);

  // Data
  const tweets = useStore((state) =>
    state.getTweets().filter(state.searchFilter)
  );

  const fetchUser = useStore((state) => state.fetchUser);
  const fetchTweets = useStore((state) => state.fetchMoreTweets);

  const fetchState = useStore((state) => {
    const tweetList = state.imageLists.get(state.selectedLists[0]);
    if (tweetList) return tweetList.fetchState;
    else return "all_fetched" as FetchState;
  });

  // Loading
  const [userLoaded, setUserLoaded] = useState(false);

  const [errorMessage, setError] = useStore((state) => [
    state.errorMessage,
    state.setError,
  ]);

  useEffect(() => {
    if (!userLoaded && errorMessage === "") {
      fetchUser()
        .then((res) => {
          if (res.error) setError(res.error);
          else setUserLoaded(true);
        })
        .catch((e) => setError(e.toString()));
    }
  }, [errorMessage, fetchUser, setError, userLoaded]);

  // Filtering and rendering
  const selectedList = useStore((state) => state.selectedLists);
  const searchTerm = useStore((state) => state.searchTerm);

  // Key controls
  const [editMode, toggledEditMode] = useStore((state) => [
    state.editMode,
    state.toggleEditMode,
  ]);

  useEffect(() => {
    const keyControls = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": {
          if (editMode === "delete") toggledEditMode();
          break;
        }
      }
    };
    document.addEventListener("keyup", keyControls);

    return () => {
      document.removeEventListener("keyup", keyControls);
    };
  }, [editMode, toggledEditMode]);

  // Masonry Style
  const [columnCount, columnGutter] = useDisplayStore((state) => [
    state.columnCount,
    state.getColumnGutter(),
  ]);

  return (
    <>
      <GlobalStyle />
      <OverlayContainer>
        <DeleteOverlay />
        {!isMobile && <ZoomOverlay />}
        <ThemeOverlay />
        {!isMobile && <GitterOverlay />}
      </OverlayContainer>
      <ContextMenu />
      <LoadingScene display={!userLoaded} />
      <AppDiv className="App">
        <Header />
        {isMobile && selectedLists.length > 0 && (
          <TagTitleHeader>
            <h3>{selectedLists[0]}</h3>
          </TagTitleHeader>
        )}

        <TweetsGallery
          columnCount={isMobile ? 1 : columnCount}
          columnGutter={isMobile ? 10 : columnGutter}
          masonryKey={selectedList.join(",") + "-" + searchTerm}
          images={tweets}
          fetchItems={fetchTweets}
          maxItems={
            fetchState === "all_fetched" || searchTerm !== ""
              ? tweets.length
              : 9e9
          }
        />
      </AppDiv>
    </>
  );
}
