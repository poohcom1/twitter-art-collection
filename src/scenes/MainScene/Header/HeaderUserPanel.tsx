import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { StyledPopup, PopupItem } from "src/components";
import styled from "styled-components";
import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useStore } from "src/stores/rootStore";
import { BLACKLIST_TAG } from "src/utils/constants";

const Avatar = styled.div`
  border-radius: 50%;
  overflow: hidden;
  height: 48px;
  width: 48px;

  cursor: pointer;
`;

function UserAvatar(props: {
  image: string | null | undefined;
  name: string | null | undefined;
}) {
  const onSignoutClicked = useCallback(() => signOut(), []);

  const onBlacklistClicked = useStore((state) => () => {
    const blacklistTag = state.tags.get(BLACKLIST_TAG);
    if (blacklistTag)
      state.setFilter({
        type: "tag",
        tag: blacklistTag,
      });
  });

  return (
    <StyledPopup
      position={"bottom left"}
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
      <PopupItem onClick={onBlacklistClicked}>
        <div>Blacklist</div>
      </PopupItem>
      <PopupItem
        onClick={() =>
          (window.location.href =
            "https://github.com/poohcom1/twitter-art-collection/issues/new")
        }
      >
        Give feedback
      </PopupItem>
      <PopupItem>
        <Link href="privacy" passHref>
          <div>Privacy</div>
        </Link>
      </PopupItem>
      <PopupItem onClick={onSignoutClicked}>Logout</PopupItem>
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