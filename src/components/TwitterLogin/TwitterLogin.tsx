import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";
import Image from "next/image";

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

  background-color: #ffffff11;

  .container:before {
    box-shadow: inset 0 0 2000px rgba(255, 255, 255, 0.5);
    filter: blur(10px);
  }

  &:hover {
    border-color: ${(props) => props.theme.color.onSecondary};
    background-color: #ffffff34;
  }

  * {
    margin: 0 15px;
  }

  transition: all 0.1s;
`;

export default function TwitterLogin() {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <SignInButton onClick={() => signIn("twitter")}>
        <div className="image-div">
          <Image
            src="/assets/twitter/twitter_social_blue.svg"
            alt="Twitter Sign In"
            width={50}
            height={50}
          />
        </div>
        <h3>Sign in with Twitter</h3>
      </SignInButton>
    );
  }

  return <button onClick={() => signOut()}>Sign Out</button>;
}
