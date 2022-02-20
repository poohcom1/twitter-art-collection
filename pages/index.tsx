import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { useEffect, useState } from "react";
import { getTags } from "src/adapters";
import TagsContext from "src/context/TagsContext";
import { Main, LoadingScene } from "../src/scenes";

const TAG_FETCH_RETRY_MAX = 5;
const TAG_FETCH_RETRY_KEY = "fetchRetryCount";

const TAG_FETCH_ERROR = "tagsFetchFailed";

export default function Index() {
  const router = useRouter();

  const [tags, setTags] = useState<TagCollection>(new Map());
  const [setup, setSetup] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const session = useSession();

  useEffect(() => {
    let retryCount = router.query[TAG_FETCH_RETRY_KEY] ?? "0";

    if (session.data && router.query["error"] === undefined) {
      const uid = session.data.user.id;

      fetch("/api/setup")
        .then(() => {
          setSetup(true);
          console.log("Setup ok!");
        })
        .catch((err) => console.log("[Setup error] " + err));

      // Get tags
      getTags(uid)
        .then((tags) => {
          setTags(tags);
          setLoaded(true);
        })
        .catch((err) => {
          console.error(err);

          // FIXME: Hack to force refresh since API seems to always fail on first load
          if (parseInt(retryCount as string) >= TAG_FETCH_RETRY_MAX) {
            router.replace({ query: { error: TAG_FETCH_ERROR } });
          } else {
            router.push({
              query: {
                [TAG_FETCH_RETRY_KEY]: `${parseInt(retryCount as string) + 1}`,
              },
            });
          }
        });
    }
  });

  if (router.query["error"] !== undefined) {
    return <div className="main">Oh noes something went wrong</div>;
  } else {
    return (
      <>
        <Head>
          <title>Twitter Art Collection</title>
        </Head>{" "}
        <TagsContext.Provider value={{ tags, setTags }}>
          {setup && loaded ? <Main /> : <LoadingScene />}
        </TagsContext.Provider>
      </>
    );
  }
}
