import React from "react";
import { useWindowSize } from "@react-hook/window-size";
import {
  useMasonry,
  usePositioner,
  useContainerPosition,
  useScroller,
  useResizeObserver,
  MasonryProps,
} from "masonic";

export default function ResizableMasonry<Item>(props: MasonryProps<Item>) {
  const containerRef = React.useRef(null);
  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
  ]);
  const { scrollTop, isScrolling } = useScroller(offset);
  const positioner = usePositioner({ width, ...props }, [props.items]);
  const resizeObserver = useResizeObserver(positioner);

  return useMasonry({
    ...props,
    positioner,
    resizeObserver,
    scrollTop,
    isScrolling,
    height,
    containerRef,
  });
}
