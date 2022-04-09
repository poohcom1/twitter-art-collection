
export function standardizeTagName(tagName: string) {
    return tagName.toLowerCase()
        .replace(" ", "-")
        .replace("_", "-")
        .replace(/[^0-9a-z-]/gi, '');
}

/**
 * Returns an error message if the tag is invalid. Otherwise, returns an empty string
 * @param tagName Name of tag to validate
 * @param tagList List of existing tags
 * @returns 
 */
export function validateTagName(tagName: string, tagList: string[]): string {
    if (tagName === "") {
        return "Tag name must not be empty"
    } else if (!tagName.match(/^[a-z0-9-]+$/)) {
        return "Tag name must only contains letters and characters."
    } else if (tagList.includes(tagName)) {
        return "Tag already exists!"
    } else { return "" }
}