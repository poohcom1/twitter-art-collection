import { tweetExpansions } from "lib/twitter/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getUserId } from "lib/nextAuth";
import { useRedis } from "lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.ids) {
    return res.send([]);
  }

  const uid = await getUserId(req);

  if (!uid) {
    return res.status(401).end();
  }

  const tweetIds: string[] = (req.query.ids as string).split(",");

  try {
    const tweets = await useRedis(tweetExpansions(tweetIds, uid));
    res.send(tweets);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
}
