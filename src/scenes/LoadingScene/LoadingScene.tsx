import Image from "next/image";
import { useEffect, useState } from "react";
import { useDisplayStore } from "src/stores/displayStore";
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
  color: ${(props) => props.theme.color.onBackground};
`;

export default function LoadingScene({ display = true, text = "" }) {
  const theme = useDisplayStore((state) => state.theme);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!display) {
      timeout = setTimeout(() => setVisible(false), 500);
    } else {
      timeout = setTimeout(() => setVisible(true), 500);
    }

    return () => clearTimeout(timeout);
  }, [display]);

  return (
    <ThemeProvider theme={theme}>
      <MainDiv
        className="loadingScreen"
        style={{
          visibility: visible ? "visible" : "hidden",
          opacity: display ? "100%" : "0",
        }}
      >
        <Text>{text !== "" ? text : "Please wait a moment..."}</Text>
        <div className="center" style={{ width: "100vw", marginTop: "-15px" }}>
          <Image
            src="/assets/pulse-loading.svg"
            alt=""
            layout="fixed"
            width="120px"
            height="120px"
            priority={true}
          />
        </div>
      </MainDiv>
    </ThemeProvider>
  );
}
