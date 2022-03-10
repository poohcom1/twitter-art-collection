import Head from "next/head";
import "react-static-tweets/styles.css";
import styled, {
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

const Body = styled.div`
  background: ${(props) => props.theme.color.primary};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.color.primary} 15%,
    ${(props) => props.theme.color.surface} 145%
  );

  color: white;

  width: 100vw;
  height: 100vh;
`;

const HeaderDiv = styled.div`
  color: white;

  padding: 10px 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const MainDiv = styled.div`
  padding: 50px 150px;
  display: flex;
  flex-direction: row;
`;

const TextDiv = styled.div`
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
`;

const GithubLink = withTheme(function GithubLink(props: {
  theme: DefaultTheme;
}) {
  return (
    <GithubLinkA href="https://github.com/poohcom1/twitter-art-collection">
      <Image
        src={
          props.theme === lightTheme
            ? "/assets/github/GitHub-Mark-32px.png"
            : "/assets/github/GitHub-Mark-Light-32px.png"
        }
        alt="Github Link"
        width={32}
        height={32}
      />
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

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <meta
          name="description"
          content="Organize your Twitter art and photos."
        />
        <link
          rel="canonical"
          href="https://twitter-art-collection.vercel.app/"
        />
      </Head>
      <LoadingScene display={session.status === "loading"} />
      <ThemeProvider theme={lightTheme}>
        <Body>
          <HeaderDiv>
            <a
              style={{ color: "white", textDecoration: "none" }}
              href="https://twitter-art-collection.vercel.app/"
            >
              <h2>Twitter Art Collection</h2>
            </a>
            <GithubLink />
          </HeaderDiv>
          <MainDiv>
            <TextDiv>
              <h1>A place to organized artworks from Twitter!</h1>
              <p style={{ fontSize: "larger", marginBottom: "50px" }}>
                Having trouble finding that one Tweet artwork? Organize your
                liked Tweets into tags so you can come back for them later!
              </p>
              <h3>Alright, let&apos;s do this!</h3>
              <TwitterLogin />
            </TextDiv>
            <SampleImageDiv>
              <Image
                src="/assets/sample_image.png"
                alt="Sample image"
                width={1901}
                height={904}
              />
            </SampleImageDiv>
          </MainDiv>
          <FooterDiv></FooterDiv>
        </Body>
      </ThemeProvider>
    </>
  );
}
