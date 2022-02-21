import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import { useSession } from "next-auth/react";
import Header from "./Header/Header";
import fetchBuilder from "fetch-retry-ts";
import styled, { keyframes, ThemeProvider } from "styled-components";
import { fadeIn } from "react-animations";
import { TweetComponent } from "../../components";
import TagsContext from "src/context/TagsContext";
import SelectedTagContext from "src/context/SelectedTagContext";
import { getLikes } from "src/adapters";
import { lightTheme } from "src/themes";

// Styles
const HEADER_HEIGHT = 150;

const Columns = styled.div`
  display: flex;
  justify-content: center;
`;

const DisplayDiv = styled.div``;

const LoadingDiv = styled.div`
  animation: 0.5s ${keyframes`${fadeIn}`};
`;

// Helper functions
function createColumns(columns: number, tweetList: Array<string>) {
  const columnDivs = [];

  for (let i = 0; i < columns; i++) {
    columnDivs.push(
      <DisplayDiv key={i}>
        {(() => {
          const tweets = [];
          for (let j = i; j < tweetList.length; j += columns) {
            tweets.push(
              <TweetComponent tweetId={`${tweetList[j]}`} order={j} key={j} />
            );
          }
          return tweets;
        })()}
      </DisplayDiv>
    );
  }

  return columnDivs;
}

function tweetFilter(tweet: APITweet, payload: MultipleTweetsLookupResponse) {
  if (!tweet.attachments) {
    return false;
  }

  const keys = tweet.attachments?.media_keys;

  for (const key of keys!) {
    const media = payload.includes?.media?.find((obj) => obj.media_key === key);

    if (media?.type === "photo") return true;
  }
  return false;
}

export default function MainScene() {
  const session = useSession();

  const { tags } = useContext(TagsContext);
  const { selectedTag, inverted } = useContext(SelectedTagContext);

  const [columns] = useState(4);
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  let tweetIds = useRef<Array<string>>([]);

  useEffect(() => {
    if (session.data) {
      const uid = session.data.user.id;

      // Get tweets
      getLikes(uid)
        .then((payload) => {
          tweetIds.current = payload.data
            .filter((t) => tweetFilter(t, payload))
            .map((data) => data.id);

          setTweetsLoaded(true);
        })
        .catch(console.error);
    }
  }, [session.data]);

  const filterTags = useMemo(() => {
    if (!tweetsLoaded) {
      return [];
    }

    if (selectedTag) {
      return tweetIds.current.filter((id) =>
        selectedTag.images.find((image) => image.id === id)
      );
    } else {
      if (inverted) {
        const tagList = Array.from(tags.values());
        const categorized = new Set<string>();

        for (const tag of tagList) {
          for (const image of tag.images) {
            categorized.add(image.id);
          }
        }

        const uncategorized = tweetIds.current.filter(
          (id) => !categorized.has(id)
        );

        return uncategorized;
      } else {
        return tweetIds.current;
      }
    }
  }, [inverted, selectedTag, tags, tweetsLoaded]);

  return (
    <div className="App">
      <ThemeProvider theme={lightTheme}>
        <Header height={HEADER_HEIGHT} />
        <div style={{ height: `${HEADER_HEIGHT}px` }} />
        <Columns>{createColumns(columns, filterTags)}</Columns>
      </ThemeProvider>
    </div>
  );
}
