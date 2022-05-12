import { COLLECTION_URL, SPECIAL_LIST_KEYS } from "types/constants";
import { ImageList, isTagList, TagList } from "./ImageList";

// URL param helpers

export function setURLParam(tag: string) {
  // Set multiple tags to param
  //  - unused because images from multiple tags cannot be fetched from page load yet
  // if (tags.length >= 1 && !SPECIAL_LIST_KEYS.includes(tags[0])) {
  //   window.history.replaceState(null, "", `?${tags.map((tag) => "tag=" + tag).join("&")}`);
  // } else {
  //   window.history.replaceState(null, "", "/" + COLLECTION_URL);
  // }

  // Set single tag to param
  if (!SPECIAL_LIST_KEYS.includes(tag)) {
    window.history.replaceState(null, "", "?tag=" + tag);
  } else {
    window.history.replaceState(null, "", "/" + COLLECTION_URL);
  }
}

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
