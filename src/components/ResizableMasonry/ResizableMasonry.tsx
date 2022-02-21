import React from "react";
import { useWindowSize } from "@react-hook/window-size";
import {
  useMasonry,
  usePositioner,
  useContainerPosition,
  useScroller,
  UseMasonryOptions,
  RenderComponentProps,
  useResizeObserver,
} from "masonic";

interface MasonryProps {
  columnWidth: number;
  columnGutter: number;
  items: Array<{ id: string }>;
  render: React.ComponentType<RenderComponentProps<{ id: string }>>;
}

export default function ResizableMasonry(props: MasonryProps) {
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
    positioner,
    resizeObserver,
    scrollTop,
    isScrolling,
    height,
    containerRef,
    ...props,
  });
}
