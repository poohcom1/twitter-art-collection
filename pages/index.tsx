import Head from "next/head";
import styled, {
  createGlobalStyle,
  DefaultTheme,
  ThemeProvider,
  withTheme,
} from "styled-components";
import { lightTheme } from "src/themes";
import Image from "next/image";
// Next SSR
import { TwitterLogin } from "src/components";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingScene } from "src/scenes";
import { CANONICAL_URL } from "types/constants";
import { useStore } from "src/stores/rootStore";

const GlobalCSS = createGlobalStyle`
  body {
    background: ${(props) => props.theme.color.primary};
    background: linear-gradient(
      135deg,
      ${(props) => props.theme.color.primary} 15%,
      ${(props) => props.theme.color.surface} 145%
    );

    color: white;

    min-height: 100vh;
    min-width: 100vw;
  }
`;

export const HeaderDiv = styled.div`
  color: white;

  padding: 10px 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const MainDiv = styled.div`
  padding: 25px 25px;
  @media only screen and (min-width: 768px) {
    padding: 16px 150px;
  }
`;

const FlexDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media only screen and (min-width: 768px) {
    flex-wrap: nowrap;
  }
  margin-bottom: 32px;
`;

export const TextDiv = styled.div`
  padding: 15px;
  margin-right: 25px;
`;

const GithubLinkA = styled.a`
  margin-left: auto;
  text-decoration: none;
`;

const SampleImageDiv = styled.div`
  width: fit-content;
  height: fit-content;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 15px 15px 0 #ffffff3e;
  margin-top: 50px;
`;

export const GithubLink = withTheme(function GithubLink(props: {
  theme: DefaultTheme;
  type?: "dark" | "light";
}) {
  const darkImg = "/assets/github/GitHub-Mark-32px.png";
  const lightImg = "/assets/github/GitHub-Mark-Light-32px.png";

  let img = darkImg;

  if (props.type) {
    img = props.type === "dark" ? darkImg : lightImg;
  } else {
    img =
      props.theme === lightTheme
        ? "/assets/github/GitHub-Mark-32px.png"
        : "/assets/github/GitHub-Mark-Light-32px.png";
  }

  return (
    <GithubLinkA href="https://github.com/poohcom1/twitter-art-collection">
      <Image src={img} alt="Github Link" width={32} height={32} />
    </GithubLinkA>
  );
});

const FooterDiv = styled.div`
  color: white;

  background-color: #ffffff42;

  margin-top: auto;

  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default function Index() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/collection");
    }
  });

  const theme = useStore((state) => state.theme);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <meta
          name="description"
          content="Organize your Twitter art and photos."
        />
        <link rel="canonical" href={CANONICAL_URL} />
      </Head>
      <LoadingScene display={session.status === "loading"} />
      <ThemeProvider theme={theme}>
        <GlobalCSS />
        <HeaderDiv>
          <a
            style={{ color: "white", textDecoration: "none" }}
            href={CANONICAL_URL}
          >
            <h2>Twitter Art Collection</h2>
          </a>
          <GithubLink />
        </HeaderDiv>
        <MainDiv>
          <FlexDiv>
            <TextDiv>
              <h1>A place to organize artworks from Twitter!</h1>
              <p style={{ fontSize: "larger", marginBottom: "50px" }}>
                Having trouble finding that one Tweet artwork? Organize your
                liked Tweets into tags so you can come back for them later!
              </p>
            </TextDiv>
            <SampleImageDiv>
              <Image
                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                src="/assets/sample_image.png"
                alt="Sample image"
                width={1901}
                height={904}
                placeholder="blur"
                blurDataURL="sample_image_small.png"
              />
            </SampleImageDiv>
          </FlexDiv>
          <h3>Alright, let&apos;s do this!</h3>
          <TwitterLogin />
        </MainDiv>
        <FooterDiv></FooterDiv>
      </ThemeProvider>
    </>
  );
}
