import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { StyledPopup, PopupItem } from "src/components";
import styled from "styled-components";
import { useCallback, useMemo } from "react";
import { useStore } from "src/stores/rootStore";
import { BLACKLIST_TAG } from "types/constants";
import Link from "next/link";

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

  // Blacklist

  const showBlacklist = useStore(
    (state) =>
      state.tags.has(BLACKLIST_TAG) &&
      state.tags.get(BLACKLIST_TAG)!.images.length > 0
  );

  const onBlacklistClicked = useStore((state) => () => {
    window.history.replaceState(null, "", `?filter=tag&tag=__blacklist`);

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
          <button className="clear">
            <Avatar>
              <Image
                src={props.image ?? ""}
                alt={props.name ?? "usernames"}
                height={48}
                width={48}
              />
            </Avatar>
          </button>
        ),
        [props.image, props.name]
      )}
      closeOnDocumentClick
    >
      {(close: () => void) => (
        <>
          {showBlacklist ? (
            <PopupItem
              onClick={() => {
                close();
                onBlacklistClicked();
              }}
            >
              <div>Blacklist</div>
            </PopupItem>
          ) : (
            <></>
          )}
          <a
            tabIndex={-1}
            className="invis-link"
            href="https://github.com/poohcom1/twitter-art-collection/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            <PopupItem>Give feedback</PopupItem>
          </a>
          <Link href="/privacy" passHref>
            <PopupItem>Privacy</PopupItem>
          </Link>
          <PopupItem onClick={onSignoutClicked}>Logout</PopupItem>
        </>
      )}
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
