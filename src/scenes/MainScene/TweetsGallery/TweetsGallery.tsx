import styled from "styled-components";
import React, { RefObject, useEffect, useRef } from "react";
import Image from "next/image";
import {
  LoadMoreItemsCallback,
  MasonryProps,
  useInfiniteLoader,
  useMasonry,
  useResizeObserver,
  useScrollToIndex,
} from "masonic";
import { TweetComponent } from "../../../components";
import useShrinkingPositioner from "./useShrinkingPositioner";
import { useSize, useScroller } from "./miniVirtualList";
import { useDisplayStore } from "src/stores/displayStore";
import { useStore } from "src/stores/rootStore";

const MainDiv = styled.div`
  padding: 20px;

  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

interface TweetsGalleryProps {
  images: TweetSchema[];
  fetchItems: () => Promise<void>;
  maxItems: number;
  columnWidth?: number;
  columnGutter?: number;

  masonryKey: string;
}

export default function TweetsGallery({
  images,
  fetchItems,
  masonryKey,
  maxItems,
}: TweetsGalleryProps) {
  const [columnCount, columnGutter] = useDisplayStore((state) => [
    state.columnCount,
    state.getColumnGutter(),
  ]);

  const setError = useStore((state) => state.setError);

  useEffect(() => {
    if (images.length === 0 && maxItems !== 0) {
      fetchItems().then().catch(setError);
    }
  }, [fetchItems, images.length, maxItems, setError]);

  const fetchMoreItems = async (
    _startIndex: number,
    _stopIndex: number,
    _currentItems: TweetSchema[]
  ) => await fetchItems();

  const maybeLoadMore = useInfiniteLoader<
    TweetSchema,
    LoadMoreItemsCallback<TweetSchema>
  >(fetchMoreItems, {
    isItemLoaded: (index, items) => index < items.length && !!items[index],
    totalItems: maxItems,
    threshold: 16,
  });

  const containerRef = useRef(null);

  return (
    <MainDiv ref={containerRef}>
      {maxItems === 0 && (
        <h4 style={{ textAlign: "center" }}>Nothing to see here!</h4>
      )}
      <ShrinkingMasonry
        containerDivRef={containerRef}
        items={images}
        onRender={maybeLoadMore}
        render={MasonryCard}
        key={masonryKey}
        columnGutter={columnGutter}
        columnCount={columnCount}
      />
      {images.length < maxItems && (
        <div className="center" style={{ marginTop: "32px" }}>
          <Image
            src="/assets/pulse-loading.svg"
            alt="Loader"
            layout="fixed"
            width="80px"
            height="80px"
          />
        </div>
      )}
      {maxItems > 0 && maxItems === images.length && (
        <h4 style={{ textAlign: "center" }}>
          {"That's all the tweets for now!"}
        </h4>
      )}
    </MainDiv>
  );
}

function ShrinkingMasonry(
  props: MasonryProps<TweetSchema> & {
    containerDivRef: RefObject<HTMLDivElement>;
  }
) {
  const { items: images, containerDivRef } = props;

  const { width, height } = useSize(containerDivRef);

  const { scrollTop, isScrolling } = useScroller(containerDivRef);
  const positioner = useShrinkingPositioner({ width, ...props }, images);

  const resizeObserver = useResizeObserver(positioner);
  const scrollToIndex = useScrollToIndex(positioner, {});

  React.useEffect(() => {
    if (props.scrollToIndex) {
      scrollToIndex(props.scrollToIndex as number);
    }
  }, [props.scrollToIndex, scrollToIndex]);

  return useMasonry({
    positioner,
    scrollTop,
    isScrolling,
    height,
    resizeObserver,
    scrollToIndex,
    tabIndex: -1,
    ...props,
  });
}

const MasonryCard = (props: {
  index: number;
  data: TweetSchema;
  width: number;
}) => {
  return (
    <TweetComponent
      id={props.data.id}
      tweet={props.data}
      key={props.data.id}
      index={props.index}
    />
  );
};
