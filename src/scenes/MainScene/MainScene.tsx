import React, { useMemo } from "react";
import type { APITweet, MultipleTweetsLookupResponse } from "twitter-types";
import Header from "./Header/Header";
import styled, { ThemeProvider } from "styled-components";
import { TweetComponent } from "../../components";
import { useTags } from "src/context/TagsContext";
import { useSelectedTag } from "src/context/SelectedTagContext";
import { lightTheme } from "src/themes";
import Masonry from "react-masonry-css";
import { useTweets } from "src/context/TweetsContext";

// Styles
const HEADER_HEIGHT = 100;

const MainDiv = styled.div`
  background-color: ${(props) => props.theme.color.bg.primary};
`;

export default function MainScene() {
  const { tweets } = useTweets();

  const { tags } = useTags();
  const { selectedTag, inverted } = useSelectedTag();

  const filteredTags = useMemo(() => {
    // Regular filter
    if (selectedTag) {
      const images = selectedTag.images.map((im) => im.id);
      return tweets.filter((data) => images.includes(data.id));
    } else {
      // Untagged
      if (inverted) {
        const tagList = Array.from(tags.values());
        const categorized = new Set<string>();

        for (const tag of tagList) {
          for (const image of tag.images) {
            categorized.add(image.id);
          }
        }

        const uncategorized = tweets.filter(
          (data) => !categorized.has(data.id)
        );

        return uncategorized;
      } else {
        // All tags
        return tweets;
      }
    }
  }, [inverted, selectedTag, tags, tweets]);

  return (
    <div className="App">
      <ThemeProvider theme={lightTheme}>
        <Header height={HEADER_HEIGHT} />
        <div style={{ minHeight: `${HEADER_HEIGHT}px` }} />
        <MainDiv style={{ padding: "32px" }}>
          <Masonry
            breakpointCols={4}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {filteredTags.map((data, key) => (
              <TweetComponent id={data.id} ast={data.ast} key={key} />
            ))}
          </Masonry>
        </MainDiv>
      </ThemeProvider>
    </div>
  );
}
