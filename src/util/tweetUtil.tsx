const IMAGE_LINK_REGEX = /https:\/\/t.co\/[A-z0-9]*/;

export function fillCachedTweets(
  tweetMap: Map<string, TweetSchema>,
  tweets: TweetSchema[]
) {
  for (const tweet of tweets) {
    const match = tweetMap.get(tweet.id);

    if (match) tweet.data = match.data;
  }
}

export function cacheTweets(
  tweetMap: Map<string, TweetSchema>,
  tweets: TweetSchema[]
) {
  for (const tweet of tweets) {
    tweetMap.set(tweet.id, tweet);
  }
}

export function injectTweetLink(text: string) {
  const linkStripped = text.replace(IMAGE_LINK_REGEX, "");

  const lines = linkStripped.split("\n");

  const jsxElements = [];

  for (let i = 0; i < lines.length; i++) {
    const tokens = lines[i].split(" ");

    let currentText = "";

    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j];

      if (
        token.startsWith("#") ||
        token.startsWith("＃") ||
        token.startsWith("@")
      ) {
        jsxElements.push(<span key={`text-${i}-${j}`}>{currentText}</span>);
        currentText = " ";

        jsxElements.push(
          <a
            key={`a-${i}-${j}`}
            href={
              token.startsWith("@")
                ? `https://twitter.com/${token.slice(1)}`
                : `https://twitter.com/hashtag/${token.slice(1)}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {token}
          </a>
        );
      } else {
        currentText += token + " ";
      }
    }

    if (currentText) {
      jsxElements.push(
        <span key={`text-${i}-${tokens.length}`}>{currentText}</span>
      );
      currentText = "";
    }

    jsxElements.push(<br key={`br-${i}`} />);
  }

  return jsxElements;
}
