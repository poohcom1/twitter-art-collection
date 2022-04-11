import type { NextApiRequest, NextApiResponse } from "next";
import { fetchTweetAst } from "static-tweets";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tweetIds: string[] = req.body.tweetIds;

  if (!tweetIds) {
    return res
      .status(500)
      .send("Malformed request body. Array of strings 'tweetIds' required.");
  }

  try {
    const tweetDataAsts = await Promise.all(
      tweetIds.map((id) => fetchTweetAst(id))
    );

    const tweetAsts: TweetSchema[] = [];

    for (let i = 0; i < tweetIds.length; i++) {
      if (tweetDataAsts[i]) {
        tweetAsts.push({
          id: tweetIds[i],
          ast: tweetDataAsts[i],
          platform: "twitter",
        });
      }
    }

    const response: TweetsResponse = {
      tweets: tweetAsts,
    };

    res.send(response);
  } catch (e) {
    return res.status(500).send(`Fetch AST error: ${e}`);
  }
}
