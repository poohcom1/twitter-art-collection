import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { StyledPopup, PopupItem, TwitterLogin } from "src/components";
import styled from "styled-components";

const Avatar = styled.div`
  border-radius: 50%;
  overflow: hidden;
  height: 48px;
  width: 48px;

  cursor: pointer;
`;

const UserSectionDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  & p {
    vertical-align: middle;
  }
`;

function UserAvatar(props: {
  image: string | null | undefined;
  name: string | null | undefined;
}) {
  return (
    <StyledPopup
      trigger={
        <Avatar>
          <Image
            src={props.image ?? ""}
            alt={props.name ?? "usernames"}
            height={48}
            width={48}
          />
        </Avatar>
      }
      closeOnDocumentClick
    >
      <PopupItem text="Logout" onClick={() => signOut()} />
    </StyledPopup>
  );
}

export default function UserSection() {
  const session = useSession();

  switch (session.status) {
    case "unauthenticated":
      return (
        <UserSectionDiv>
          <TwitterLogin />
          {/* <p>or enter your username:</p>

          <SearchDiv placeholder="@username" />
          <StyledPopup
            trigger={
              <div style={{ verticalAlign: "center" }}>
                <QuestionCircle size={20} />
              </div>
            }
            position="right center"
            on={["hover", "focus"]}
            arrow={true}
            closeOnDocumentClick
          >
            <span>
              You can load your likes without signing-in, but your actions will
              be stored locally.
            </span>
          </StyledPopup> */}
        </UserSectionDiv>
      );
    case "loading":
      return (
        <Avatar>
          <div
            style={{
              backgroundColor: "lightgray",
              height: "48px",
              width: "48px",
            }}
          ></div>
        </Avatar>
      );
    case "authenticated":
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserAvatar
            name={session.data.user.name}
            image={session.data.user.image}
          />
        </div>
      );
  }
}
