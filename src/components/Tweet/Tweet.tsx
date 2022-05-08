import Image from "next/image";
import { useCallback } from "react";
import { injectTweetLink } from "src/util/tweetUtil";

export default function Tweet(props: {
  data: TweetExpansions;
  darkMode?: boolean;
}) {
  const { data } = props;

  const onImageClick = useCallback(
    (index: number) => {
      window.open(`${data.url}/photo/${index + 1}`, "_blank");
    },
    [data.url]
  );

  return (
    <div className={`tweet ${props.darkMode ? "dark" : ""}`}>
      <div className="tweet__header">
        <a
          className="tweet__header-avatar"
          style={{ textDecoration: "none" }}
          href={`https://twitter.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
          tabIndex={-1}
        >
          <Image
            className="tweet__header-avatar-img"
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
          tabIndex={-1}
        >
          <h3 className={`tweet__header-name ${props.darkMode ? "dark" : ""}`}>
            {data.name}
          </h3>
          <p className="tweet__header-username">@{data.username}</p>
        </a>

        <a
          className="tweet__header-logo"
          href={data.url}
          target="_blank"
          rel="noreferrer"
          tabIndex={-1}
        >
          <Image
            src={"/assets/twitter/twitter_logo_blue.svg"}
            alt="Twitter Logo"
            height="30px"
            width="30px"
            objectFit="contain"
          />
        </a>
      </div>

      <div className="tweet__content">
        <div className={`tweet__content-text ${props.darkMode ? "dark" : ""}`}>
          {data.content.text ? injectTweetLink(data.content.text) : ""}
        </div>
        <div
          className={`tweet__content-media tweet__image-${
            data.content.media!.length > 1 ? "grid" : "container"
          }`}
        >
          {data.content.media?.map((im, index) => (
            <Image
              className="tweet__image"
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

      <div className="tweet__footer">
        <a href={data.url} target="_blank" rel="noreferrer" tabIndex={-1}>
          View on twitter
        </a>

        <div className="tweet__footer-date">
          <time>{new Date(data.date!).toDateString()}</time>
        </div>
      </div>
    </div>
  );
}
