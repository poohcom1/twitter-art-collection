import { MAX_TAG_LENGTH, standardizeTagName, validateTagName } from "../../lib/tagValidation"
import { BLACKLIST_TAG } from "../../types/constants";


describe("tagValidation.ts", () => {
    describe(validateTagName.name, () => {
        it("should detect tag names that are too long", () => {
            let tag = ""

            for (let i = 0; i < MAX_TAG_LENGTH + 1; i++) {
                tag += "a"
            }

            expect(validateTagName(tag)).toStrictEqual("TOO_LONG")
        })

        it("should detect tag names with underscores", () => {
            expect(validateTagName("hello_")).toStrictEqual("INVALID_CHAR")
        })

        it("should allow black list tag as an exception", () => {
            expect(validateTagName(BLACKLIST_TAG)).toStrictEqual("")
        })

        it("should detect duplicate tag names", () => {
            const tagList = ["tag"]

            expect(validateTagName("tag", tagList)).toStrictEqual("EXISTING_TAG")
        })

        it("should detect empty tags", () => {
            expect(validateTagName("")).toStrictEqual("EMPTY_TAG")
        })
    })

    describe(standardizeTagName.name, () => {
        it("should replace all underscores with space", () => {
            expect(standardizeTagName("hey_there")).toStrictEqual("hey-there")
        })

        it("should remove all excess characters beyond character limit", () => {
            let tag = ""
            
            for (let i = 0; i < MAX_TAG_LENGTH; i++) {
                tag += "a"
            }

            let longTag = tag

            for (let i = 0; i < 5; i++) {
                longTag += "b"
            }

            expect(standardizeTagName(longTag)).toStrictEqual(tag)
        });
    })
})