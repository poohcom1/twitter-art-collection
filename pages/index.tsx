import Head from "next/head";
import styled, { createGlobalStyle } from "styled-components";
import Image from "next/image";
// Next SSR
import { Banner, TwitterLogin } from "src/components";
import { CANONICAL_URL, COLLECTION_URL } from "types/constants";
import type { GetServerSidePropsContext } from "next";
import { getUserId } from "lib/nextAuth";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const uid = await getUserId(context.req);

  if (uid) {
    return {
      redirect: {
        destination: "/" + COLLECTION_URL,
        permanent: false,
      },
    };
  }

  return { props: {} };
}

const GlobalCSS = createGlobalStyle`
  html {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  body {

    margin: 0;
    padding: 0;

    background-image: linear-gradient(
      135deg,
      ${(props) => props.theme.color.primary} 15%,
      ${(props) => props.theme.color.surface} 145%
    );
    background-repeat: no-repeat;

    color: white;

    min-height: 100vh;
    width: 100%;

    overflow-x: hidden;

  }
`;

export const MainDiv = styled.div`
  @media only screen and (min-width: 768px) {
    padding: 0 150px;
  }
  margin-top: -32px;
`;

const FlexDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media only screen and (min-width: 768px) {
    flex-wrap: nowrap;
  }
  margin-bottom: 32px;
  margin-top: 0;
  justify-content: center;
  align-items: center;
`;

export const TextDiv = styled.div`
  padding: 32px;
  margin-right: 25px;
`;

const SampleImageDiv = styled.div`
  width: 70vw;
  height: fit-content;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 15px 15px 0 #ffffff3e;
  margin-top: 50px;
`;

const FooterDiv = styled.div`
  color: ${(props) => props.theme.color.onPrimary};

  width: 100%;
  margin: 32px;
  margin-top: 64px;
  padding-bottom: 64px;
`;

const Badge = styled.a<{ badgeColor?: string }>`
  text-decoration: none;
  padding: 0;
  margin: 16px;

  height: fit-content;
  width: fit-content;

  border-radius: 10px;

  overflow: hidden;

  display: flex;
  justify-content: center;

  position: relative;
  z-index: 5;

  &::after {
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2);
    content: "";
    display: block;
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
  }

  * {
    z-index: 0;
    color: white;

    height: 50px;

    margin: 0;
    padding: 8px 16px;

    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    font-size: larger;
    font-weight: 600;
    text-decoration: none;

    display: flex;
    align-items: center;
    position: relative;
  }

  *:first-child {
    background-color: rgb(43, 43, 44);
    text-align: right;
  }

  *:nth-child(2) {
    background-color: ${(props) => props.badgeColor ?? "rgb(204, 103, 45)"};
    text-align: left;
  }
`;

const TITLE = "Twitter Art Collection";
const DESCRIPTION = "Organize your Twitter art and photos";

const PREVIEW_IMAGE = "/assets/sample_image.jpeg";
const PREVIEW_IMAGE_WIDTH = "1005";
const PREVIEW_IMAGE_HEIGHT = "888";

export default function Index() {
  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL_URL + "/"} />
        <meta property="og:site_name" content={TITLE} />
        <meta property="og:image" content={CANONICAL_URL + PREVIEW_IMAGE} />
        <meta property="og:image:height" content={PREVIEW_IMAGE_HEIGHT} />
        <meta property="og:image:width" content={PREVIEW_IMAGE_WIDTH} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={CANONICAL_URL + "/"} />
        <meta name="twitter:site" content="@poohcom1" />
        <meta name="twitter:creator" content="@poohcom1" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={CANONICAL_URL + PREVIEW_IMAGE} />
        <meta name="twitter:image:alt" content={TITLE} />
        <link rel="canonical" href={CANONICAL_URL} />
      </Head>
      <GlobalCSS />
      <Banner style={{ backgroundColor: "transparent" }} />
      <MainDiv>
        <FlexDiv>
          <TextDiv>
            <h1>Organize artworks from Twitter!</h1>
            <p style={{ fontSize: "larger", marginBottom: "50px" }}>
              Having trouble finding that one Tweet artwork? Group Tweets into
              tags so you can come back for them later!
            </p>
            <h3>Just sign in with Twitter!</h3>
            <TwitterLogin />
          </TextDiv>
          <SampleImageDiv>
            <Image
              style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
              src={PREVIEW_IMAGE}
              alt="Sample image"
              layout="responsive"
              width={PREVIEW_IMAGE_WIDTH}
              height={PREVIEW_IMAGE_HEIGHT}
              placeholder="blur"
              blurDataURL="/assets/sample_image_small.jpeg"
              priority={true}
            />
          </SampleImageDiv>
        </FlexDiv>
      </MainDiv>
      <FooterDiv>
        <div style={{ display: "flex", flexWrap: "wrap" }}></div>

        <h2>Created with the help of:</h2>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <Badge
            href="https://github.com/vercel/next.js"
            badgeColor="white"
            target="_blank"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              color="white"
              style={{ height: "50px", fill: "white" }}
            >
              <title>Next.js</title>
              <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.495.0445h-.406l-.1078-.068a.4383.4383 0 01-.1572-.1712l-.0493-.1056.0053-4.703.0067-4.7054.0726-.0915c.0376-.0493.1174-.1125.1736-.143.0962-.047.1338-.0517.5396-.0517.4787 0 .5584.0187.6827.1547.0353.0377 1.3373 1.9987 2.895 4.3608a10760.433 10760.433 0 004.7344 7.1706l1.9002 2.8782.096-.0633c.8518-.5536 1.7525-1.3418 2.4657-2.1627 1.5179-1.7429 2.4963-3.868 2.8247-6.134.0961-.6591.1078-.854.1078-1.7475 0-.8937-.012-1.0884-.1078-1.7476-.6522-4.506-3.8592-8.2919-8.2087-9.6945-.7672-.2487-1.5836-.42-2.4985-.5232-.169-.0176-1.0835-.0366-1.6123-.037zm4.0685 7.217c.3473 0 .4082.0053.4857.047.1127.0562.204.1642.237.2767.0186.061.0234 1.3653.0186 4.3044l-.0067 4.2175-.7436-1.14-.7461-1.14v-3.066c0-1.982.0093-3.0963.0234-3.1502.0375-.1313.1196-.2346.2323-.2955.0961-.0494.1313-.054.4997-.054z" />
            </svg>
            <p style={{ color: "black" }}>Next.js</p>
          </Badge>
          <Badge
            className="blank"
            href={"https://github.com/jaredLunde/masonic"}
            target="_blank"
          >
            <p>jaredLunde</p>
            <p>🧱 MASONIC</p>
          </Badge>
          <Badge
            className="blank"
            href={"https://github.com/pmndrs/zustand"}
            badgeColor="rgb(25, 93, 64)"
            target="_blank"
          >
            <p>Poimandres</p>
            <p>ZUSTAND</p>
          </Badge>
          <Badge
            className="blank"
            href={"https://github.com/yjose/reactjs-popup"}
            badgeColor="rgb(162, 53, 162)"
            target="_blank"
          >
            <p>yjose</p>
            <p>🎀reactjs-popup</p>
          </Badge>
        </div>
      </FooterDiv>
    </>
  );
}
