import { Banner } from "src/components";
import { useDisplayStore } from "src/stores/displayStore";
import styled, { ThemeProvider } from "styled-components";

const BodyDiv = styled.div`
  background-color: ${(props) => props.theme.color.background};
  width: 100vw;
  height: 100vh;
`;

const MainDiv = styled.div`
  margin: 0;
  height: 70vh;

  display: flex;

  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-weight: 800;

  transition: opacity 0.5s;
  pointer-events: none;
`;

const HText = styled.h1`
  margin-bottom: 5px;
  z-index: 10;
  color: ${(props) => props.theme.color.onBackground};
`;

const Text = styled.p`
  margin-bottom: 5px;
  z-index: 10;
  color: ${(props) => props.theme.color.onBackground};
  font-weight: 600;
`;

export default function ErrorScene({ errorText = "" }) {
  const theme = useDisplayStore((state) => state.theme);

  return (
    <ThemeProvider theme={theme}>
      <BodyDiv>
        <Banner hideGithubLogo />
        <MainDiv>
          <HText>Oh noes... something went wrong</HText>
          <Text>{errorText}</Text>
          {/* <div className="center" style={{ width: "100vw", marginTop: "-15px" }}>
          <Image
            src="/assets/pulse-loading.svg"
            alt=""
            layout="fixed"
            width="120px"
            height="120px"
          />
        </div> */}
        </MainDiv>
      </BodyDiv>
    </ThemeProvider>
  );
}
