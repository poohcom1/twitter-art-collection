import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";
import Image from "next/image";

const SignInButton = styled.div`
  cursor: pointer;
  height: 28px;
  width: 158px;
`;

export default function TwitterLogin() {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <SignInButton onClick={() => signIn("twitter")}>
        <Image
          src="/assets/twitter/twitter-signin.png"
          alt="Twitter Sign In"
          width={158}
          height={28}
        />
      </SignInButton>
    );
  }

  return <button onClick={() => signOut()}>Sign Out</button>;
}
