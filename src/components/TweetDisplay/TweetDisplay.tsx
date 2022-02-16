import styled from "styled-components";

const TweetHeader = styled.div`
  display: flex;
`;

const TweetFooter = styled.div`
  display: flex;
`;

const NameDisplay = styled.div``;

export default function TweetDisplay(props: {
  tweetId: string;
  name: string;
  username: string;
  text: string;
  avatar: string;
  imgSrc: string;
  date: Date;
}) {
  return (
    <div>
      <TweetHeader>
        <img src={props.avatar} alt={props.username} />
        <NameDisplay>
          <p>{props.name}</p>
          <p>{props.username}</p>
        </NameDisplay>
        <img
          src="assets/twitter/twitter_logo_blue.png"
          width={25}
          alt="Twitter Logo"
        />
      </TweetHeader>

      <p>{props.text}</p>
      <TweetFooter>
        <script
          type="text/javascript"
          async
          src="https://platform.twitter.com/widgets.js"
        ></script>
        <a
          href={`https://twitter.com/intent/tweet?in_reply_to=${props.tweetId}`}
        >
          Reply
        </a>
        <a
          href={`https://twitter.com/intent/retweet?tweet_id=${props.tweetId}`}
        >
          Retweet
        </a>
        <a href={`https://twitter.com/intent/like?tweet_id=${props.tweetId}`}>
          Like
        </a>
      </TweetFooter>
    </div>
  );
}
