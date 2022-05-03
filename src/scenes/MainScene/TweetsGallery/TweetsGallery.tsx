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

const COLUMN_WIDTH = 240;
const COLUMN_GUTTER = 20;

const MainDiv = styled.div`
  padding: 20px 20px 0 20px;

  width: 100%;
  height: 89vh;
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
  columnWidth = COLUMN_WIDTH,
  columnGutter = COLUMN_GUTTER,
}: TweetsGalleryProps) {
  useEffect(() => {
    if (images.length === 0 && maxItems !== 0) {
      fetchItems().then().catch(alert);
    }
  }, [fetchItems, images.length, maxItems]);

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
      {maxItems === 0 ? (
        <h4 style={{ textAlign: "center" }}>Nothing to see here!</h4>
      ) : (
        <></>
      )}
      <ShrinkingMasonry
        containerDivRef={containerRef}
        items={images}
        onRender={maybeLoadMore}
        render={MasonryCard}
        key={masonryKey}
        columnWidth={columnWidth}
        columnGutter={columnGutter}
      />
      {images.length < maxItems ? (
        <div className="center" style={{ marginTop: "32px" }}>
          <Image
            src="/assets/pulse-loading.svg"
            alt="Loader"
            layout="fixed"
            width="80px"
            height="80px"
          />
        </div>
      ) : (
        <></>
      )}
    </MainDiv>
  );
}

function ShrinkingMasonry(
  props: MasonryProps<TweetSchema> & {
    containerDivRef: RefObject<HTMLDivElement>;
  }
) {
  const { columnWidth, columnGutter, items: images, containerDivRef } = props;

  const { width, height } = useSize(containerDivRef);

  const { scrollTop, isScrolling } = useScroller(containerDivRef);
  const positioner = useShrinkingPositioner(
    { width, columnWidth, columnGutter },
    images
  );

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
