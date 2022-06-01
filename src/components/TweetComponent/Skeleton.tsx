import { Instagram } from "react-content-loader";
import styled from "styled-components";

const SkeletonDiv = styled.div`
  padding: 15px;

  background-color: ${(props) => props.theme.color.surface};
  border-radius: 10px;
`;

export default function TweetSkeleton() {
  return (
    <SkeletonDiv>
      <Instagram
        animate={false}
        foregroundColor="#7c7c7c2d"
        backgroundColor="#7c7c7c2d"
        foregroundOpacity={0.3}
        backgroundOpacity={0.3}
      />
    </SkeletonDiv>
  );
}
