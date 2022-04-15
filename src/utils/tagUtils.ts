
export function standardizeTagName(tagName: string) {
    return tagName.toLowerCase()
        .replace(" ", "-")
        .replace("_", "-")
        .replace(/[^0-9a-z-]/gi, '');
}

export type TagErrors =
    | "EMPTY_TAG"
    | "INVALID_CHAR"
    | "EXISTING_TAG"
    | ""


/**
 * Returns an error message if the tag is invalid. Otherwise, returns an empty string
 * @param tagName Name of tag to validate
 * @param tagList List of existing tags
 * @returns Error type. Empty string if no errors are found
 */
export function validateTagName(tagName: string, tagList: string[]): TagErrors {
    if (tagName === "") {
        return "EMPTY_TAG"
    } else if (!tagName.match(/^[a-z0-9-]+$/)) {
        return "INVALID_CHAR"
    } else if (tagList.includes(tagName)) {
        return "EXISTING_TAG"
    } else { return "" }
}