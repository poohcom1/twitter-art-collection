import styled from "styled-components";
import React, { ComponentType, useEffect, useRef } from "react";
import Image from "next/image";
import {
  LoadMoreItemsCallback,
  MasonryProps,
  RenderComponentProps,
  useInfiniteLoader,
  useMasonry,
  useScrollToIndex,
  useScroller,
  useContainerPosition,
  useResizeObserver,
} from "masonic";
import { TweetComponent } from "..";
import useShrinkingPositioner from "./useShrinkingPositioner";
import { useWindowSize } from "@react-hook/window-size";
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
  columnCount?: number;
  columnGutter?: number;

  masonryKey: string;
  render?: ComponentType<RenderComponentProps<TweetSchema>>;
}

export default function MobileTweetsGallery({
  images,
  fetchItems,
  masonryKey,
  maxItems,
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
    isItemLoaded: (index, items) => index < items.length && !!items[index],
    totalItems: maxItems,
    threshold: 16,
  });

  const selectedList = useStore((state) => state.selectedLists);
  const galleryMessage = useStore(
    (state) => state.galleryErrors[state.selectedLists[0]] ?? ""
  );

  useEffect(() => {
    if (images.length === 0 && maxItems !== 0) {
      fetchItems().then().catch(setError);
    }
  }, [fetchItems, images.length, maxItems, setError, selectedList]);

  return (
    <MainDiv>
      {galleryMessage && (
        <h4 style={{ textAlign: "center" }}>{galleryMessage}</h4>
      )}
      {maxItems === 0 && (
        <h4 style={{ textAlign: "center" }}>Nothing to see here!</h4>
      )}
      <ShrinkingMasonry
        items={images}
        onRender={maybeLoadMore}
        render={render}
        key={masonryKey}
        columnCount={1}
        columnGutter={20}
      />
      {!galleryMessage && images.length < maxItems && (
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
    </MainDiv>
  );
}

function ShrinkingMasonry(props: MasonryProps<TweetSchema>) {
  const { items: images } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
  ]);
  const { scrollTop, isScrolling } = useScroller(offset);
  const positioner = useShrinkingPositioner({ width, ...props }, images);

  const scrollToIndex = useScrollToIndex(positioner, {});

  const resizeObserver = useResizeObserver(positioner);

  React.useEffect(() => {
    if (props.scrollToIndex) {
      scrollToIndex(props.scrollToIndex as number);
    }
  }, [props.scrollToIndex, scrollToIndex]);

  return useMasonry({
    containerRef,
    positioner,
    scrollTop,
    isScrolling,
    height,
    scrollToIndex,
    resizeObserver,
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
