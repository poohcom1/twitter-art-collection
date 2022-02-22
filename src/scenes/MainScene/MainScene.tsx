import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import { useSession } from "next-auth/react";
import Header from "./Header/Header";
import styled, { keyframes, ThemeProvider } from "styled-components";
import { fadeIn } from "react-animations";
import { TweetComponent, ResizableMasonry } from "../../components";
import { useTags } from "src/context/TagsContext";
import { useSelectedTag } from "src/context/SelectedTagContext";
import { getLikes } from "src/adapters";
import { lightTheme } from "src/themes";

// Styles
const HEADER_HEIGHT = 100;

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.bg.primary};
`;
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

  const { tags } = useTags();
  const { selectedTag, inverted } = useSelectedTag();

  const [tweetIds, setTweetIds] = useState<string[]>([]);

  useEffect(() => {
    if (session.data) {
      const uid = session.data.user.id;

      // Get tweets
      getLikes(uid)
        .then((payload) => {
          setTweetIds(
            payload.data
              .filter((t) => tweetFilter(t, payload))
              .map((data) => data.id)
          );
        })
        .catch(console.error);
    }
  }, [session.data]);

  const filteredTags = useMemo(() => {
    // Regular filter
    if (selectedTag) {
      return selectedTag.images.map((im) => im.id);
    } else {
      // Untagged
      if (inverted) {
        const tagList = Array.from(tags.values());
        const categorized = new Set<string>();

        console.time("untaggedTime");
        for (const tag of tagList) {
          for (const image of tag.images) {
            categorized.add(image.id);
          }
        }

        const uncategorized = tweetIds.filter((id) => !categorized.has(id));

        return uncategorized;
      } else {
        // All tags
        return tweetIds;
      }
    }
  }, [inverted, selectedTag, tags, tweetIds]);

  return (
    <div className="App">
      <ThemeProvider theme={lightTheme}>
        <Header height={HEADER_HEIGHT} />
        <div style={{ minHeight: `${HEADER_HEIGHT}px` }} />
        <MainDiv style={{ padding: "32px" }}>
          <ResizableMasonry
            items={filteredTags.map((tag) => ({
              id: tag,
            }))}
            render={function TweetWithMasonry(props: {
              data: { id: string };
              index: number;
              width: number;
            }) {
              return <TweetComponent id={props.data.id} />;
            }}
            columnWidth={300}
            columnGutter={24}
          />
        </MainDiv>
      </ThemeProvider>
    </div>
  );
}
