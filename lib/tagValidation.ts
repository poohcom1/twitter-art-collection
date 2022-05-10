import { BLACKLIST_TAG } from "types/constants";

const INVALID_CHAR = /[&\/\\#,+()$~%.'":*?<>{}]/g;

export type TagErrors =
  | "EMPTY_TAG"
  | "INVALID_CHAR"
  | "EXISTING_TAG"
  | "TOO_LONG"
  | "";

export const MAX_TAG_LENGTH = 32;

export function standardizeTagName(tagName: string) {
  return tagName
    .replace("_", "-")
    .replace(INVALID_CHAR, "")
    .slice(0, MAX_TAG_LENGTH);
}

/**
 * Returns an error message if the tag is invalid. Otherwise, returns an empty string
 * @param tagName Name of tag to validate
 * @param tagList List of existing tags. Leave empty to bypass duplication check
 * @returns Error type. Empty string if no errors are found
 */
export function validateTagName(
  tagName: string,
  tagList: string[] = []
): TagErrors {
  if (tagName === BLACKLIST_TAG) {
    return "";
  }

  if (tagName === "") {
    return "EMPTY_TAG";
  } else if (tagName !== standardizeTagName(tagName)) {
    return "INVALID_CHAR";
  } else if (tagList.includes(tagName)) {
    return "EXISTING_TAG";
  } else if (tagName.length > MAX_TAG_LENGTH) {
    return "TOO_LONG";
  } else {
    return "";
  }
}
