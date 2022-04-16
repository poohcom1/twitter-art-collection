import styled from "styled-components";
import React, { useEffect } from "react";
import Image from "next/image";
import { useWindowSize } from "@react-hook/window-size";
import {
  LoadMoreItemsCallback,
  useContainerPosition,
  useInfiniteLoader,
  useMasonry,
  usePositioner,
  useResizeObserver,
  useScroller,
} from "masonic";
import { TweetComponent } from "../../components";

const COLUMN_WIDTH = 300;
const COLUMN_GUTTER = 30;

const MainDiv = styled.div`
  padding: 120px 40px;
`;

interface TweetsGalleryProps {
  images: TweetSchema[];
  fetchItems: () => Promise<void>;
  maxItems: number;
  columnWidth?: number;
  columnGutter?: number;
}

/**
 * Draw tweets to a masonry depending on the current filter
 * Will infinitely load tweets for "all" and "uncategorized" filters
 * Will immediately load tweets for "tag" filters into "extraTweets"
 */
export default function TweetsGallery({
  images,
  fetchItems,
  maxItems,
  columnWidth = COLUMN_WIDTH,
  columnGutter = COLUMN_GUTTER,
}: TweetsGalleryProps) {
  const containerRef = React.useRef(null);
  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
  ]);
  const { scrollTop, isScrolling } = useScroller(offset);
  const positioner = usePositioner({ width, columnWidth, columnGutter }, [
    images.length,
  ]);

  const resizeObserver = useResizeObserver(positioner);

  const fetchMoreItems = async (
    _startIndex: number,
    _stopIndex: number,
    _currentItems: TweetSchema[]
  ) => {
    await fetchItems();
  };

  const maybeLoadMore = useInfiniteLoader<
    TweetSchema,
    LoadMoreItemsCallback<TweetSchema>
  >(fetchMoreItems, {
    isItemLoaded: (index, items) => index < items.length && !!items[index],
    totalItems: maxItems,
  });

  useEffect(() => {
    if (images.length === 0 && maxItems !== 0) {
      fetchItems().then();
    }
  }, [fetchItems, images.length, maxItems]);

  return (
    <MainDiv>
      {maxItems === 0 ? (
        <h4 style={{ textAlign: "center" }}>Nothing to see here!</h4>
      ) : (
        <></>
      )}
      {useMasonry({
        positioner,
        scrollTop,
        isScrolling,
        height,
        containerRef,
        resizeObserver,

        onRender: maybeLoadMore,

        items: images,
        render: MasonryCard,
      })}
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
      order={props.index}
    />
  );
};
