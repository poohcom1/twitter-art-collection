import Head from "next/head";
// Next SSR
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CANONICAL_URL } from "types/constants";
import { useStore } from "src/stores/rootStore";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getUserId } from "lib/nextAuth";
import { FetchState } from "src/stores/ImageList";
import { createGlobalStyle, useTheme } from "styled-components";
import { LoadingScene, Tweet } from "src/components";
import { darkTheme } from "src/themes";
import MobileTweetsGallery from "src/components/TweetsGallery/MobileTweetsGallery";

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

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <link rel="canonical" href={`${CANONICAL_URL}/m/collection`} />
      </Head>

      <MobileCollection />
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
  }`;

function MobileCollection() {
  const router = useRouter();

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
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editMode === "delete") {
        toggledEditMode();
      }
    };
    document.addEventListener("keyup", escape);

    return () => {
      document.removeEventListener("keyup", escape);
    };
  }, [editMode, toggledEditMode]);

  return (
    <>
      <GlobalStyle />
      <LoadingScene display={!userLoaded} />
      <MobileTweetsGallery
        columnCount={1}
        render={MobileTweet}
        masonryKey={selectedList.join(",") + "-" + searchTerm}
        images={tweets}
        fetchItems={fetchTweets}
        maxItems={
          fetchState === "all_fetched" || searchTerm !== ""
            ? tweets.length
            : 9e9
        }
      />
    </>
  );
}

// Helper components

function MobileTweet(props: {
  index: number;
  data: TweetSchema;
  width: number;
}) {
  const theme = useTheme();
  return (
    <div>
      <Tweet
        key={props.data.id}
        data={props.data.data!}
        darkMode={theme === darkTheme}
      />
    </div>
  );
}
