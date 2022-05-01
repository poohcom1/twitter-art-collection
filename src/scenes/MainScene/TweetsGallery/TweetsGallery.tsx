import styled from "styled-components";
import React, { useEffect } from "react";
import Image from "next/image";
import {
  LoadMoreItemsCallback,
  MasonryProps,
  useContainerPosition,
  useInfiniteLoader,
  useMasonry,
  useResizeObserver,
  useScroller,
  useScrollToIndex,
} from "masonic";
import { useWindowSize } from "@react-hook/window-size";
import { TweetComponent } from "../../../components";
import useShrinkingPositioner from "./useShrinkingPositioner";

const COLUMN_WIDTH = 250;
const COLUMN_GUTTER = 20;

const MainDiv = styled.div`
  padding: 120px 40px 0 40px;
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
      fetchItems().then();
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

  return (
    <MainDiv>
      {maxItems === 0 ? (
        <h4 style={{ textAlign: "center" }}>Nothing to see here!</h4>
      ) : (
        <></>
      )}
      <ShrinkingMasonry
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

function ShrinkingMasonry(props: MasonryProps<TweetSchema>) {
  const { columnWidth, columnGutter, items: images } = props;

  const containerRef = React.useRef(null);
  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
  ]);
  const { scrollTop, isScrolling } = useScroller(offset);
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
    containerRef,
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
