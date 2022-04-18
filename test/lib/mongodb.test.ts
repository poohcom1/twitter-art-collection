

describe("mongodb", () => {
  describe(`removeDeletedTweets`, () => {
    // it("should delete tweets from tweetIds", async () => {
    //   const uid = "userid";

    //   const user = new UserModel({
    //     uid,
    //     tweetIds: ["1", "2", "3", "4"],
    //     tags: new Map(),
    //   });

    //   await user.save();

    //   await removeDeletedTweets(uid, ["2", "4"]);

    //   const updatedUser = await UserModel.findOne({ uid }).lean();

    //   expect(updatedUser.tweetIds).toStrictEqual(["1", "3"]);
    // });

    it.todo(
      "create test when memory server issue is resolved: https://github.com/nodkz/mongodb-memory-server/issues/628"
    );
  });
});
