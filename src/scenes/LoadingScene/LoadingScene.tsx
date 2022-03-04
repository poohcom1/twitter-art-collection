import { ImSpinner8 as Spinner } from "react-icons/im";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const MainDiv = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: white;

  font-weight: 800;
`;

const SpinnerDiv = styled.div`
  animation: ${rotate} 1s linear infinite;

  padding: 0;
  display: flex;
`;

export default function LoadingScene({ display = true }) {
  return (
    <MainDiv style={{ display: display ? "flex" : "none" }}>
      <h1>Loading...</h1>
      <SpinnerDiv>
        <Spinner size={40} />
      </SpinnerDiv>
    </MainDiv>
  );
}
