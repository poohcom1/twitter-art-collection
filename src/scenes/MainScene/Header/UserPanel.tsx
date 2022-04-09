import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { StyledPopup, PopupItem } from "src/components";
import styled from "styled-components";
import { useCallback, useMemo } from "react";

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
  const onClick = useCallback(() => signOut(), []);

  return (
    <StyledPopup
      trigger={useMemo(
        () => (
          <Avatar>
            <Image
              src={props.image ?? ""}
              alt={props.name ?? "usernames"}
              height={48}
              width={48}
            />
          </Avatar>
        ),
        [props.image, props.name]
      )}
      closeOnDocumentClick
    >
      <PopupItem onClick={onClick}>Logout</PopupItem>
    </StyledPopup>
  );
}

export default function UserSection() {
  const session = useSession();

  return (
    <>
      {session.data ? (
        <div className="center">
          <UserAvatar
            name={session.data.user.name}
            image={session.data.user.image}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
