import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { StyledPopup, PopupItem } from "src/components";
import styled from "styled-components";
import { HTMLAttributes, useCallback, useMemo } from "react";
import { useStore } from "src/stores/rootStore";
import { BLACKLIST_TAG } from "types/constants";
import Link from "next/link";
import { TagList } from "src/stores/ImageList";

const Avatar = styled.button`
  border-radius: 50%;
  overflow: hidden;
  height: 48px;
  width: 48px;

  background-color: transparent;
  border: none;
  margin: 0;
  padding: 0;

  cursor: pointer;
`;

function UserAvatar(
  props: {
    image: string | null | undefined;
    name: string | null | undefined;
  } & HTMLAttributes<HTMLButtonElement>
) {
  const { image, name, ...buttonProps } = props;

  const onSignoutClicked = useCallback(() => signOut(), []);

  // Blacklist
  const showBlacklist = useStore(
    (state) =>
      state.imageLists.has(BLACKLIST_TAG) &&
      (state.imageLists.get(BLACKLIST_TAG)! as TagList).tag.images.length > 0
  );

  const onBlacklistClicked = useStore((state) => () => {
    window.history.replaceState(null, "", `?filter=tag&tag=__blacklist`);

    const blacklistTag = state.imageLists.get(BLACKLIST_TAG);
    if (blacklistTag) state.setSelectedList([BLACKLIST_TAG]);
  });

  return (
    <StyledPopup
      position={"bottom left"}
      trigger={useMemo(
        () => (
          <Avatar title="User settings" {...buttonProps}>
            <Image
              src={image ?? ""}
              alt={name ?? "usernames"}
              height={48}
              width={48}
              quality={100}
            />
          </Avatar>
        ),
        [buttonProps, image, name]
      )}
      closeOnDocumentClick
    >
      {(close: () => void) => (
        <>
          {showBlacklist ? (
            // FIXME Broswer accessibility outline not showing on open
            <PopupItem
              className="header__blacklist"
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
            className="blank"
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

  if (session.status === "authenticated") {
    return (
      <div className="center" style={{ margin: "0 15px 0 0" }}>
        <UserAvatar
          className="header__user"
          name={session.data.user.name}
          image={session.data.user.image}
        />
      </div>
    );
  } else {
    return <></>;
  }
}
