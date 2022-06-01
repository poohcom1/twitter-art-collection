/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import styled from "styled-components";

const MainDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
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
    <MainDiv
      className="loadingScreen"
      style={{
        visibility: visible ? "visible" : "hidden",
        opacity: display ? "100%" : "0",
      }}
    >
      <Text>{text !== "" ? text : "Please wait a moment..."}</Text>
      <img src="assets/pulse-loading.svg" alt="" height="100px" />
    </MainDiv>
  );
}
