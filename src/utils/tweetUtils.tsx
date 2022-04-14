export function getImagesSrc(tweet: TweetSchema): string[] {
  if (tweet.ast) {
    const ast = tweet.ast[0];

    const imageDiv = ast.nodes.find((node) => node.tag === "div");

    if (imageDiv) {
      const images = imageDiv.nodes.filter((node) => node.tag === "img");
      if (images) {
        return images.map((imageNode) => imageNode.props.src);
      }
    }
  }
  return [];
}

export function getImagesSrcFromElement(element: HTMLDivElement): string[] {
  const blockQuoteChildren = element.children[0]?.children[0]?.children;

  if (!blockQuoteChildren) {
    return [];
  }

  for (let i = 0; i < blockQuoteChildren.length; i++) {
    const node = blockQuoteChildren[i];

    if (node.classList.contains("image-container")) {
      const imageSrcs = [];

      for (let j = 0; j < node.children.length; j++) {
        // details => summary => a => span => img
        const img = node.children[j]?.children[0]?.children[0]?.children[0]
          ?.children[0] as HTMLImageElement;

        if (!img) {
          return [];
        }

        imageSrcs.push(img.src);
      }

      return imageSrcs;
    }
  }

  return [];
}

const IMAGE_LINK_REGEX = /https:\/\/t.co\/[A-z0-9]*/;

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
