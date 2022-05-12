import React, { ForwardedRef, forwardRef, HTMLAttributes } from "react";
import { ImSpinner8 as SpinnerIcon } from "react-icons/im";
import styled, { keyframes } from "styled-components";

interface SpinnerDivProps extends HTMLAttributes<HTMLDivElement> {
  size?: string;
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const SpinnerDiv = styled.div<SpinnerDivProps>`
  animation: ${rotate} 1s linear infinite;

  width: fit-content;
  height: fit-content;

  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function Spinner(props: SpinnerDivProps, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <div {...props} ref={ref}>
      <SpinnerDiv>
        <SpinnerIcon size={props.size} style={{ padding: 0, margin: 0 }} />
      </SpinnerDiv>
    </div>
  );
}

export default forwardRef(Spinner);
