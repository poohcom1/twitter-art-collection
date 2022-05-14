import Head from "next/head";
import Link from "next/link";
import { Banner, StyledButton } from "src/components";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => props.theme.color.background};
    color: ${(props) => props.theme.color.onBackground};
  }
`;

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Twitter Art Collection - Privacy Policy</title>
        <meta name="description" content="Privacy Policy" />
        <link
          rel="canonical"
          href="https://twitter-art-collection.vercel.app/privacy"
        />
      </Head>
      <GlobalStyle />
      <Banner />
      <div className="container" style={{ marginTop: "0", paddingTop: "0" }}>
        <h1 style={{ marginBottom: "0" }}>Privacy Policy</h1>
        <p style={{ color: "grey", marginTop: "0" }}>Last updated: 4/16/2022</p>
        <p>
          The purpose of this website is to be a useful tool for artists, so we
          only collect necessary data for the webapp. This website is entirely
          open-sourced, so it is completely transparent about how data are
          recorded and processed. The only processing we would do on your data
          is to train an machine learning model to automatically organize images
          into tags or create data visualization for everybody&apos;s tags.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Your Twitter Account ID</li>
          <li>Tags created from the web app</li>
          <li>Liked tweet IDs</li>
        </ul>
        <h2>Why is this information collected? </h2>
        <ul>
          <li>For display on the web app</li>
          <li>To analyze patterns in image tagging for academic purposes</li>
        </ul>
        <h2>Contact</h2>
        <p>
          If you have any concerns, you can create an issue on this
          website&apos;s repository on Github:
          <span> </span>
          <a href="https://github.com/poohcom1/twitter-art-collection/issues">
            github.com/poohcom1/twitter-art-collection/issues
          </a>
        </p>

        <Link href={"/"} passHref>
          <StyledButton>Home</StyledButton>
        </Link>
      </div>
    </>
  );
}
