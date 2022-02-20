import { ImSpinner8 as SpinnerIcon } from "react-icons/im";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const SpinnerDiv = styled.div`
  animation: ${rotate} 1s linear infinite;

  padding: 0;
  display: flex;
`;

export default function Spinner(props: { size: number }) {
  return (
    <SpinnerDiv>
      <SpinnerIcon size={props.size} />
    </SpinnerDiv>
  );
}
