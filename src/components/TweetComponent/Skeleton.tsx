import { Instagram } from "react-content-loader";
import styled from "styled-components";

const SkeletonDiv = styled.div`
  padding: 15px;

  background-color: ${(props) => props.theme.color.surface};
  border-radius: 10px;
`;

const COLOR = "#5b5b5b";

export default function TweetSkeleton() {
  return (
    <SkeletonDiv>
      <Instagram
        animate={false}
        foregroundColor={COLOR}
        backgroundColor={COLOR}
        foregroundOpacity={0.3}
        backgroundOpacity={0.3}
      />
    </SkeletonDiv>
  );
}
