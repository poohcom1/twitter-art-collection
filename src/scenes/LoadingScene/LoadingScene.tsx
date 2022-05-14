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
      <div className="center" style={{ width: "100vw", marginTop: "-15px" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          style={{
            height: "100px",
            margin: "auto",
            background: "rgba(0, 0, 0, 0) none repeat scroll 0% 0%",
            display: "block",
            shapeRendering: "auto",
          }}
          width="200px"
          height="200px"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
        >
          <rect x="16.5" y="34" width="17" height="32" fill="#5938a7">
            <animate
              attributeName="y"
              repeatCount="indefinite"
              dur="0.9s"
              calcMode="spline"
              keyTimes="0;0.5;1"
              values="21.2;34;34"
              keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
              begin="-0.25641025641025644s"
            ></animate>
            <animate
              attributeName="height"
              repeatCount="indefinite"
              dur="0.9s"
              calcMode="spline"
              keyTimes="0;0.5;1"
              values="57.6;32;32"
              keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
              begin="-0.25641025641025644s"
            ></animate>
          </rect>
          <rect x="41.5" y="34" width="17" height="32" fill="#7c51e1">
            <animate
              attributeName="y"
              repeatCount="indefinite"
              dur="0.9s"
              calcMode="spline"
              keyTimes="0;0.5;1"
              values="24.4;34;34"
              keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
              begin="-0.12820512820512822s"
            ></animate>
            <animate
              attributeName="height"
              repeatCount="indefinite"
              dur="0.9s"
              calcMode="spline"
              keyTimes="0;0.5;1"
              values="51.2;32;32"
              keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
              begin="-0.12820512820512822s"
            ></animate>
          </rect>
          <rect x="66.5" y="34" width="17" height="32" fill="#9b71ff">
            <animate
              attributeName="y"
              repeatCount="indefinite"
              dur="0.9s"
              calcMode="spline"
              keyTimes="0;0.5;1"
              values="24.4;34;34"
              keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
            ></animate>
            <animate
              attributeName="height"
              repeatCount="indefinite"
              dur="0.9s"
              calcMode="spline"
              keyTimes="0;0.5;1"
              values="51.2;32;32"
              keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
            ></animate>
          </rect>
        </svg>
      </div>
    </MainDiv>
  );
}
