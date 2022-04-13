import styled from "styled-components";
import React from "react";
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

const COLUMN_WIDTH = 400;
const COLUMN_GUTTER = 30;

const MainDiv = styled.div`
  padding: 120px 40px;
`;

/**
 * Draw tweets to a masonry depending on the current filter
 * Will infinitely load tweets for "all" and "uncategorized" filters
 * Will immediately load tweets for "tag" filters into "extraTweets"
 */
export default function TweetsGallery(props: {
  images: TweetSchema[];
  fetchItems: () => Promise<void>;
  maxItems: number;
}) {
  const containerRef = React.useRef(null);
  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
  ]);
  const { scrollTop, isScrolling } = useScroller(offset);
  const positioner = usePositioner(
    { width, columnWidth: COLUMN_WIDTH, columnGutter: COLUMN_GUTTER },
    [props.images.length]
  );

  const resizeObserver = useResizeObserver(positioner);

  const fetchMoreItems = async (
    _startIndex: number,
    _stopIndex: number,
    _currentItems: TweetSchema[]
  ) => {
    await props.fetchItems();
  };

  const maybeLoadMore = useInfiniteLoader<
    TweetSchema,
    LoadMoreItemsCallback<TweetSchema>
  >(fetchMoreItems, {
    isItemLoaded: (index, items) => index < items.length && !!items[index],
    totalItems: props.maxItems,
  });

  return (
    <MainDiv>
      {useMasonry({
        positioner,
        scrollTop,
        isScrolling,
        height,
        containerRef,
        resizeObserver,

        onRender: maybeLoadMore,

        items: props.images,
        render: MasonryCard,
      })}
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
