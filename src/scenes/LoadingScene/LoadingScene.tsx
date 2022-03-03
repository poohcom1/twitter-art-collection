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
  background-color: ${(props) => props.theme.color.background};
  width: 100vw;
  height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-weight: 800;
`;

const SpinnerDiv = styled.div`
  animation: ${rotate} 1s linear infinite;

  padding: 0;
  display: flex;
`;

export default function LoadingScene(props: { display?: boolean }) {
  return (
    <MainDiv style={{ display: props.display ? "flex" : "none" }}>
      <h1>Loading...</h1>
      <SpinnerDiv>
        <Spinner size={40} />
      </SpinnerDiv>
    </MainDiv>
  );
}
