import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";
import Image from "next/image";

const SignInButton = styled.div`
  border-radius: 15px;
  color: white;
  background-color: rgb(29, 161, 242);
  display: flex;
  width: fit-content;
  padding: 5px 15px;

  align-items: center;
`;

export default function TwitterLogin() {
  const session = useSession();

  if (session.status === "unauthenticated") {
    return (
      <a onClick={() => signIn("twitter", {}, {})}>
        <Image
          src="/assets/twitter/twitter-signin.png"
          alt="Twitter Sign In"
          width={158}
          height={28}
        />
      </a>
    );
  }

  return <button onClick={() => signOut()}>Sign Out</button>;
}
