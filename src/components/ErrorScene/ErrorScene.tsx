import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Banner } from "src/components";
import { useDisplayStore } from "src/stores/displayStore";
import styled from "styled-components";

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

export default function ErrorScene({
  headingText = "Oh noes... something went wrong",
  errorText = "",
}) {
  const theme = useDisplayStore((state) => state.theme);
  const router = useRouter();

  useEffect(() => {
    if (router.query.error === "true") {
      router.push("/").then().catch(alert);
    }
  }, [router]);

  useEffect(() => window.history.replaceState(null, "", "?error=true"), []);

  return (
    <BodyDiv>
      <Banner hideGithubLogo style={{ color: theme.color.onSurface }} />
      <MainDiv>
        <HText>{headingText}</HText>
        <Text>{errorText}</Text>

        <Link href="/" passHref>
          <a
            style={{
              color: theme.color.onBackground,
              textDecoration: "none",
              marginTop: "64px",
            }}
          >
            Reload
          </a>
        </Link>

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
  );
}
