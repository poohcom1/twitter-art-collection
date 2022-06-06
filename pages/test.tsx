import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Tweet } from "src/components";

export default function Test() {
  return (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <Skeleton />
      <Tweet />
    </SkeletonTheme>
  );
}
