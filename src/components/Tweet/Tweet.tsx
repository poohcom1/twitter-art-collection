/* eslint-disable @next/next/no-img-element */
import { useCallback } from "react";
import { injectTweetLink } from "src/util/tweetUtil";

const ReplyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"
  >
    <g>
      <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"></path>
    </g>
  </svg>
);

const RetweetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"
  >
    <g>
      <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path>
    </g>
  </svg>
);

const LikeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"
  >
    <g>
      <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"></path>
    </g>
  </svg>
);

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
          <img
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
          <svg
            version="1.1"
            id="Logo"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="30px"
            height="30px"
            viewBox="0 0 248 204"
            xmlSpace="preserve"
          >
            <style type="text/css">{".st0{fill:#1D9BF0;}"}</style>
            <g id="Logo_1_">
              <path
                id="white_background"
                className="st0"
                d="M221.95,51.29c0.15,2.17,0.15,4.34,0.15,6.53c0,66.73-50.8,143.69-143.69,143.69v-0.04
		C50.97,201.51,24.1,193.65,1,178.83c3.99,0.48,8,0.72,12.02,0.73c22.74,0.02,44.83-7.61,62.72-21.66
		c-21.61-0.41-40.56-14.5-47.18-35.07c7.57,1.46,15.37,1.16,22.8-0.87C27.8,117.2,10.85,96.5,10.85,72.46c0-0.22,0-0.43,0-0.64
		c7.02,3.91,14.88,6.08,22.92,6.32C11.58,63.31,4.74,33.79,18.14,10.71c25.64,31.55,63.47,50.73,104.08,52.76
		c-4.07-17.54,1.49-35.92,14.61-48.25c20.34-19.12,52.33-18.14,71.45,2.19c11.31-2.23,22.15-6.38,32.07-12.26
		c-3.77,11.69-11.66,21.62-22.2,27.93c10.01-1.18,19.79-3.86,29-7.95C240.37,35.29,231.83,44.14,221.95,51.29z"
              />
            </g>
          </svg>
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
            <img
              className="tweet__image"
              src={im.url}
              key={im.url}
              alt=""
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
