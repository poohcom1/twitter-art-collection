import { signOut, useSession } from "next-auth/react";
import { TwitterLogin } from "src/components";
import styled from "styled-components";
import { AiOutlineQuestionCircle as QuestionCircle } from "react-icons/ai";
import Image from "next/image";
import { useState } from "react";
import { StyledPopup, PopupItem } from "src/components";
import { CategorySchema } from "api";

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
  return (
    <StyledPopup
      trigger={
        <Avatar>
          <Image
            className="image"
            src={props.image}
            alt={props.name ?? "usernames"}
            height={48}
            width={48}
            quality={100}
          />
        </Avatar>
      }
      closeOnDocumentClick
    >
      <PopupItem text="Logout" onClick={() => signOut()} />
    </StyledPopup>
  );
}

const UserSectionDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  & p {
    vertical-align: middle;
  }

  & * {
    margin-left: 5px;
  }
`;

function UserSection() {
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
        <UserAvatar
          name={session.data.user.name}
          image={session.data.user.image}
        />
      );
  }
}

const SearchDiv = styled.input`
  flex-grow: 1;
  padding: 15px;
  border-radius: 50px;
  border-width: 0;
  background-color: #d3e7e7;

  &:focus {
    outline: none;
    background-color: #b3e5f8;
  }
`;

function SearchBar() {
  return <SearchDiv type="search" placeholder="Search" />;
}

const HeaderDiv = styled.div`
  display: flex;

  background-color: white;
  width: 100%;
  height: 15%;

  padding: 30px;

  & * {
    margin-left: 5px;
  }
`;

export default function Header() {
  const session = useSession();

  const [categories, setCategories] = useState<Array<CategorySchema> | null>(
    null
  );

  if (!categories) {
    if (session.data) {
      fetch(`/api/user/${session.data.user.id}/categories`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then(setCategories);
    }
  }

  return (
    <HeaderDiv>
      <UserSection />
      <SearchBar />
    </HeaderDiv>
  );
}
