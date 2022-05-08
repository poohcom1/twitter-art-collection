import { RefObject, useEffect, useRef, useState } from "react";

export function useOverflowDetector(): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);

  const [overflow, setOverflow] = useState(
    ref.current ? ref.current.offsetWidth < ref.current.scrollWidth : false
  );

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new window.ResizeObserver(() => {
        if (ref.current) {
          setOverflow(ref.current.offsetWidth < ref.current.scrollWidth);
        }
      });

      resizeObserver.observe(ref.current);
    }
  }, []);

  return [ref, overflow];
}
