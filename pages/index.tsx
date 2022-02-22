import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { useEffect, useState } from "react";
import { getTags } from "src/adapters";
import TagsContext from "src/context/TagsContext";
import { MainScene, LoadingScene } from "../src/scenes";
import Link from "next/link";
import SelectedTagContext from "src/context/SelectedTagContext";

const TAG_FETCH_RETRY_MAX = 5;
const TAG_FETCH_RETRY_KEY = "fetchRetryCount";

const TAG_FETCH_ERROR = "tagsFetchFailed";

const USER_LOADED_DELAY = 500;

export default function Index() {
  const router = useRouter();

  const session = useSession();
  // State for delay timeout to prevent loading screen flash when session is being loaded.
  const [userExists, setUserExists] = useState<boolean>(true);

  const [tags, setTags] = useState<TagCollection>(new Map());
  const [selectedTag, setSelectedTag] = useState<TagSchema | undefined>();
  const [inverted, setInverted] = useState(false);

  const [setup, setSetup] = useState(false);
  const [tagsLoaded, setTagLoaded] = useState(false);

  const setSelection = (
    tag: TagSchema | undefined,
    invert: boolean = false
  ) => {
    setSelectedTag(tag);
    setInverted(invert);
  };

  useEffect(() => {
    let retryCount = router.query[TAG_FETCH_RETRY_KEY] ?? "0";

    setTimeout(() => setUserExists(!!session.data?.user.id), USER_LOADED_DELAY);

    if (session.data && router.query["error"] === undefined) {
      const uid = session.data.user.id;

      if (!setup) {
        fetch("/api/setup")
          .then(() => {
            setSetup(true);
            console.info("Setup ok!");
          })
          .catch((err) => console.error("[Setup error] " + err));
      }

      if (!tagsLoaded) {
        // Get tags
        getTags(uid)
          .then((tags) => {
            setTags(tags);
            setTagLoaded(true);
          })
          .catch((err) => {
            console.error(err);

            // FIXME: Hack to force refresh since API seems to always fail on first load
            if (parseInt(retryCount as string) >= TAG_FETCH_RETRY_MAX) {
              router.replace({ query: { error: TAG_FETCH_ERROR } });
            } else {
              router.push({
                query: {
                  [TAG_FETCH_RETRY_KEY]: `${
                    parseInt(retryCount as string) + 1
                  }`,
                },
              });
            }
          });
      }
    }
  }, [tagsLoaded, router, session.data, setup]);

  if (router.query["error"] !== undefined) {
    return (
      <div className="main">
        <h1>Oh noes something went wrong</h1>
        <Link href="/">Return to home</Link>
      </div>
    );
  } else {
    return (
      <>
        <Head>
          <title>Twitter Art Collection</title>
        </Head>{" "}
        <TagsContext.Provider value={{ tags, setTags }}>
          <SelectedTagContext.Provider
            value={{
              selectedTag,
              setSelection,
              inverted,
            }}
          >
            {!userExists || (setup && tagsLoaded) ? (
              <MainScene />
            ) : (
              <LoadingScene />
            )}
          </SelectedTagContext.Provider>
        </TagsContext.Provider>
      </>
    );
  }
}
