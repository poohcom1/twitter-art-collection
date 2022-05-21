import { useEffect, useState } from "react";

/**
 * Courtesy of https://stackoverflow.com/a/64218472
 * A hook to detect when window width goes below 768
 * @returns Whether or not page is mobile
 */
const useMediaQuery = () => {
  const [width, setWidth] = useState(1920);
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    setWidth(window.innerWidth);

    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return width <= 768;
};

export default useMediaQuery;
