import {
  MasonryProps,
  useResizeObserver,
  useScrollToIndex,
  useMasonry,
  useContainerPosition,
  useScroller,
} from "masonic";
import { useWindowSize } from "@react-hook/window-size";
import React, { RefObject, useRef } from "react";
import useShrinkingPositioner from "./useShrinkingPositioner";

export default function WindowMasonry(
  props: MasonryProps<TweetSchema> & {
    containerDivRef?: RefObject<HTMLDivElement>;
  }
) {
  const containerRef = useRef(null);

  const { items: images } = props;

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
  ]);

  const { scrollTop, isScrolling } = useScroller(offset);
  const positioner = useShrinkingPositioner({ width, ...props }, images);

  const resizeObserver = useResizeObserver(positioner);
  const scrollToIndex = useScrollToIndex(positioner, {});

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
    resizeObserver,
    scrollToIndex,
    ...props,
  });
}
