import {
  MasonryProps,
  useResizeObserver,
  useScrollToIndex,
  useMasonry,
} from "masonic";
import { useSize, useScroller } from "./miniVirtualList";
import React, { RefObject } from "react";
import useShrinkingPositioner from "./useShrinkingPositioner";

export default function ShrinkingMasonry(
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
    ...props,
  });
}
