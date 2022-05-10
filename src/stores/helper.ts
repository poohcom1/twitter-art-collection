import { ImageList, isTagList, TagList } from "./ImageList";

// Image List helpers
export function getTag(
  imageLists: Map<string, ImageList>,
  tagName: string
): TagSchema | undefined {
  const tagList = imageLists.get(tagName);

  if (tagList && isTagList(tagList)) {
    return tagList.tag;
  }
}

export function getTagList(
  imageLists: Map<string, ImageList>,
  tagName: string
): TagList | undefined {
  const tagList = imageLists.get(tagName);

  if (tagList && isTagList(tagList)) {
    return tagList;
  }
}

// Filters helpers

export type TweetPredicate = <S extends TweetSchema>(
  image: S,
  index?: number,
  array?: S[]
) => image is S;

// Search Filter helper
export interface TweetTextData {
  text?: string;
  name?: string;
  username?: string;
}

export function getTweetTexts(tweet: TweetSchema): TweetTextData {
  return {
    text: tweet.data?.content.text,
    name: tweet.data?.name,
    username: tweet.data?.username,
  };
}
