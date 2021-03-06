import styled from "styled-components";
import React, { ComponentType, useEffect, useMemo, useRef } from "react";
import {
  LoadMoreItemsCallback,
  RenderComponentProps,
  useInfiniteLoader,
} from "masonic";
import { TweetComponent } from "..";
import { useStore } from "src/stores/rootStore";
import WindowMasonry from "./WindowMasonry";

const MainDiv = styled.div`
  padding: 20px;
  margin-top: 100px;

  width: 100vw;
  height: 100vh;
`;

interface TweetsGalleryProps {
  images: TweetSchema[];
  fetchItems: () => Promise<void>;
  maxItems: number;
  columnCount?: number;
  columnGutter?: number;

  masonryKey: string;
  render?: ComponentType<RenderComponentProps<TweetSchema>>;
}

export default function TweetsGallery({
  images,
  fetchItems,
  masonryKey,
  maxItems,
  columnCount = 4,
  columnGutter = 20,
  render = MasonryCard,
}: TweetsGalleryProps) {
  const setError = useStore((state) => state.setError);

  const fetchMoreItems = async (
    _startIndex: number,
    _stopIndex: number,
    _currentItems: TweetSchema[]
  ) => await fetchItems();

  const maybeLoadMore = useInfiniteLoader<
    TweetSchema,
    LoadMoreItemsCallback<TweetSchema>
  >(fetchMoreItems, {
    isItemLoaded: (index, items) =>
      index < items.length && !!items[index] && !!items[index].data,
    totalItems: maxItems,
    threshold: 16,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedList = useStore((state) => state.selectedLists);
  const galleryMessage = useStore(
    (state) => state.galleryErrors[state.selectedLists[0]] ?? ""
  );

  useEffect(() => {
    if (images.length === 0 && maxItems !== 0) {
      fetchItems().then().catch(setError);
    }
  }, [fetchItems, images.length, maxItems, setError, selectedList]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // containerRef.current?.scrollTo(0, 0); if masonic is in a container
  }, [selectedList]);

  // For likes or timeline, display a bunch of partial tweets
  const imagesOrLoaders = useMemo((): TweetSchema[] => {
    if (maxItems > 0 && images.length === 0) {
      const skeletonTweets: TweetSchema[] = [];

      for (let i = 0; i < 50; i++) {
        skeletonTweets.push({
          id: i + "",
          platform: "twitter",
        });
      }

      return skeletonTweets;
    } else {
      return images;
    }
  }, [images, maxItems]);

  return (
    <MainDiv ref={containerRef}>
      {galleryMessage && (
        <h4 style={{ textAlign: "center" }}>{galleryMessage}</h4>
      )}
      {maxItems === 0 && (
        <h4 style={{ textAlign: "center" }}>Nothing to see here!</h4>
      )}
      <WindowMasonry
        containerDivRef={containerRef}
        items={imagesOrLoaders}
        onRender={maybeLoadMore}
        render={render}
        key={masonryKey}
        columnGutter={columnGutter}
        columnCount={columnCount}
        tabIndex={-1}
        style={{ outline: "none" }}
      />
    </MainDiv>
  );
}

const MasonryCard = (props: {
  index: number;
  data: TweetSchema;
  width: number;
}) => {
  return (
    <TweetComponent
      id={props.data.id}
      tweetData={props.data.data}
      key={props.data.id}
      index={props.index}
    />
  );
};
