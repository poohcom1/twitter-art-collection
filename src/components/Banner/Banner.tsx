import Image from "next/image";
import { HTMLAttributes } from "react";
import { darkTheme, lightTheme } from "src/themes";
import styled, { DefaultTheme, WithTheme, withTheme } from "styled-components";
import { CANONICAL_URL } from "types/constants";

const HeaderDiv = styled.div`
  padding: 10px 30px;
  display: flex;
  flex-direction: row;
  align-items: center;

  background-color: ${(props) => props.theme.color.secondary};
`;

const GithubLinkA = styled.a`
  margin-left: auto;
  text-decoration: none;
`;

const GithubLink = withTheme(function GithubLink(props: {
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

const Banner = withTheme(
  (
    props: HTMLAttributes<HTMLDivElement> & {
      hideGithubLogo?: boolean;
    } & WithTheme
  ) => (
    <HeaderDiv {...props}>
      <a
        style={{ textDecoration: "none", color: props.theme.color.onSecondary }}
        href={CANONICAL_URL}
      >
        <h2>Twitter Art Collection</h2>
      </a>
      {!props.hideGithubLogo && (
        <GithubLink type={props.theme === darkTheme ? "dark" : "light"} />
      )}
    </HeaderDiv>
  )
);

export default Banner;
