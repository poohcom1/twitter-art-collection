import Image from "next/image";
import { useCallback } from "react";
import { injectTweetLink } from "src/utils/tweetUtils";

export default function Tweet(props: { data: TweetExpansions }) {
  const { data } = props;

  const onImageClick = useCallback(
    (index: number) => {
      window.open(`${data.url}/photo/${index + 1}`, "_blank");
    },
    [data.url]
  );

  return (
    <div className="tweet">
      <div className="tweet-header">
        <a
          className="tweet-header-avatar"
          style={{ textDecoration: "none" }}
          href={`https://twitter.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            className="tweet-header-avatar-img"
            src={data.avatar!}
            alt={`${data.username} profile`}
            width="52px"
            height="52px"
          />
        </a>
        <a
          style={{ textDecoration: "none" }}
          href={`https://twitter.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
        >
          <h3 className="tweet-header-name">{data.name}</h3>
          <p className="tweet-header-username">@{data.username}</p>
        </a>

        <a
          className="tweet-header-logo"
          href={data.url}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={"/assets/twitter/twitter_logo_blue.svg"}
            alt="Twitter Logo"
            height="42px"
            width="42px"
            objectFit="contain"
          />
        </a>
      </div>

      <div className="tweet-content">
        <div className="tweet-content-text">
          {data.content.text ? injectTweetLink(data.content.text) : ""}
        </div>
        <div
          className={`tweet-content-media tweet-image-${
            data.content.media!.length > 1 ? "grid" : "container"
          }`}
        >
          {data.content.media?.map((im, index) => (
            <Image
              className="tweet-image"
              src={im.url}
              alt="Twitter Image"
              key={im.url}
              layout="responsive"
              objectFit={data.content.media!.length > 1 ? "cover" : "contain"}
              width={im.width}
              height={im.height}
              onClick={() => onImageClick(index)}
            />
          ))}
        </div>
      </div>

      <div className="tweet-footer">
        <a href={data.url} target="_blank" rel="noreferrer">
          View on twitter
        </a>

        <div className="tweet-footer-date">
          <time>{new Date(data.date!).toDateString()}</time>
        </div>
      </div>
    </div>
  );
}
