import styled from "styled-components";
import Image from "next/image";
import { useState } from "react";
import Spinner from "../Spinner/Spinner";
import { signIn } from "next-auth/react";

const SignInButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  width: fit-content;
  padding: 15px;

  border-style: solid;
  border-radius: 15em;
  border-width: 2px;
  border-color: transparent;

  background-color: #ffffff2a;

  .container:before {
    box-shadow: inset 0 0 2000px rgba(255, 255, 255, 0.5);
    filter: blur(10px);
  }

  &:hover {
    border-color: ${(props) => props.theme.color.onSecondary};
    background-color: #ffffff60;
  }

  * {
    margin: 0 15px;
  }

  transition: all 0.1s;
`;

export default function TwitterLogin() {
  const [clicked, setClicked] = useState(false);

  return (
    <SignInButton
      onClick={() => {
        setClicked(true);
        signIn("twitter").then().catch(alert);
      }}
    >
      {!clicked ? (
        <Image
          src="/assets/twitter/twitter_social_blue.svg"
          alt="Twitter Sign In"
          width="50px"
          height="50px"
        />
      ) : (
        <Spinner
          className="center"
          size="40px"
          style={{
            width: "50px",
            height: "50px",
            overflow: "hidden",
            margin: 0,
          }}
        />
      )}

      <h3>Sign in with Twitter</h3>
    </SignInButton>
  );
}
