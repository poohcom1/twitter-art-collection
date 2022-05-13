import { RefObject } from "preact";
import { useState, useEffect } from "react";

const useIntersection = (
  ref: RefObject<HTMLElement>,
  rootMargin: string,
  callback: () => void = () => undefined
) => {
  const [isVisible, setState] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;

        if (visible !== isVisible) {
          callback();
        }

        setState(entry.isIntersecting);
      },
      { rootMargin }
    );

    const element = ref.current;

    if (element) {
      observer.observe(element);

      return () => observer.unobserve(element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isVisible;
};

export default useIntersection;
