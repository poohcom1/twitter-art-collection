import { mergeTweets, fetchAndMergeTweets } from "../../lib/twitter";
import { MockTwitterApi } from "./twitterApiMocks";

describe("twitter lib", () => {
  describe(mergeTweets.name, () => {
    it("should merge arrays with overlap without repeat", () => {
      const upstream = [1, 2, 3, 4, 5]
      const database = [4, 5, 6]

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual([1, 2, 3, 4, 5, 6])
    })

    it("should concat arrays with no overlap", () => {
      const upstream = [1, 2, 3, 4, 5]
      const database = [7, 8, 9]

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual([1, 2, 3, 4, 5, 7, 8, 9])
    })

    it("should ignore upstream when upstream is empty", () => {
      const upstream = []
      const database = [1, 2, 3, 4, 5]

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual([1, 2, 3, 4, 5])
    })

    it("should merge if first element of database is deleted from upstream", () => {
      const upstream = [1, 2, 3, 5]
      const database = [4, 5, 6]

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual([1, 2, 3, 5, 6])
    })

    it("should merge multiple rounds of upstream", () => {
      const upstream1 = [1, 2, 3]
      const upstream2 = [4, 5, 6]
      const upstream3 = [7, 8, 9]

      const database = [8, 9, 10]

      const merged = mergeTweets(mergeTweets(mergeTweets(upstream1, upstream2), upstream3), database)

      expect(merged).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it("should merge from the first diff when multiple elements from database are deleted", () => {
      const upstream = [1, 3, 6, 10]
      const database = [5, 6, 7, 8, 9, 10]

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual([1, 3, 6, 7, 8, 9, 10])
    })
  })

  describe(fetchAndMergeTweets.name, () => {

    it("should fetch and merge partially new tweets", async () => {
      const databaseTweets = ['3', '4', '5', '6', '7', '8', '9', '10']
      const upstream = ['1', '2', '3', '4', '5']

      const twitterApi = new MockTwitterApi(upstream, 5)

      const { tweetIds } = await fetchAndMergeTweets(twitterApi, "", databaseTweets)

      expect(tweetIds).toStrictEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])

    })

    it("should fetch upstream until tweets reached database", async () => {
      const databaseTweets = ['8', '9', '10']
      const upstream = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

      const twitterApi = new MockTwitterApi(upstream, 5)

      const { tweetIds } = await fetchAndMergeTweets(twitterApi, "", databaseTweets)

      expect(tweetIds).toStrictEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    })
    
    it("should fetch all upstream if database is empty", async () => {
      const databaseTweets = []
      const upstream = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

      const twitterApi = new MockTwitterApi(upstream, 5)

      const { tweetIds } = await fetchAndMergeTweets(twitterApi, "", databaseTweets)

      expect(tweetIds).toStrictEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    })
  })
});
