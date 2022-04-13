import Image from "next/image";

export default function Tweet(props: { data: TweetExpansions }) {
  const { data } = props;

  const reg = /https:\/\/t.co\/[A-z0-9]*/;

  return (
    <div
      className="tweet"
      onClick={() => {
        window.open(data.url, "_blank");
      }}
    >
      <div className="tweet-header">
        <div>
          <Image
            className="tweet-header-avatar"
            src={data.avatar!}
            alt={`${data.username} profile`}
            width="52px"
            height="52px"
            objectFit="contain"
          />
        </div>
        <div className="tweet-header-username">
          <h3 className="tweet-header-name">{data.name}</h3>
          <p className="tweet-header-username">@{data.username}</p>
        </div>

        <div className="tweet-header-logo">
          <Image
            src={"/assets/twitter/twitter_logo_blue.svg"}
            alt="Twitter Logo"
            height="42px"
            width="42px"
            objectFit="contain"
          />
        </div>
      </div>

      <div className="tweet-content">
        <div className="tweet-content-text">
          {data.content.text?.replace(reg, "") ?? ""}
        </div>
        <div
          className={`tweet-content-media tweet-image-${
            data.content.media!.length > 1 ? "grid" : "container"
          }`}
        >
          {data.content.media!.length > 1 ? (
            data.content.media?.map((im) => (
              <Image
                src={im.url}
                alt="Twitter Image"
                key={im.url}
                width="100%"
                height="100%"
                layout="responsive"
                objectFit="cover"
              />
            ))
          ) : (
            <Image
              src={data.content.media![0].url}
              alt="Twitter Image"
              key={data.content.media![0].url}
              layout="responsive"
              width={data.content.media![0].width}
              height={data.content.media![0].height}
            />
          )}
        </div>
      </div>

      <div className="tweet-footer">
        <a href={data.url}>View on twitter</a>

        <div className="tweet-footer-date">
          <time>{new Date(data.date!).toDateString()}</time>
        </div>
      </div>
    </div>
  );
}
