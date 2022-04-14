import Image from "next/image";
import { lightTheme } from "src/themes";
import styled, { ThemeProvider } from "styled-components";

const MainDiv = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  margin: 0;

  z-index: 50;

  display: flex;

  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: ${(props) => props.theme.color.background};

  font-weight: 800;

  transition: opacity 0.5s;
  pointer-events: none;
`;

const Text = styled.h1`
  margin-bottom: 5px;
  z-index: 10;
`;

export default function LoadingScene({ display = true, text = "" }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <MainDiv style={{ opacity: display ? "100%" : "0" }}>
        <Text>{text !== "" ? text : "Please wait a moment..."}</Text>
        <div className="center" style={{ width: "100vw", marginTop: "-15px" }}>
          <Image
            src="/assets/pulse-loading.svg"
            alt="Loader"
            layout="fixed"
            width="120px"
            height="120px"
          />
        </div>
      </MainDiv>
    </ThemeProvider>
  );
}
