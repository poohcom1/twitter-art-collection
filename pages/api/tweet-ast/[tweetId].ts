import { NextApiRequest, NextApiResponse } from "next";
import { fetchTweetAst } from "static-tweets";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const tweetId = req.query.tweetId as string;

  if (!tweetId) {
    return res
      .status(400)
      .send({ error: 'missing required parameter "tweetId"' });
  }

  const tweetAst = await fetchTweetAst(tweetId);

  res.status(200).json(tweetAst);
}
