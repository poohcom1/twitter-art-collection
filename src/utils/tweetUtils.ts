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
        const img = node.children[j]?.children[0]?.children[0]?.children[0]?.children[0] as HTMLImageElement;

        if (!img) {
          return []
        }

        imageSrcs.push(img.src);
      }

      return imageSrcs;
    }
  }

  return [];
}