import { tweetExpansions } from "lib/twitter/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";
import { useRedis } from "lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.ids) {
    return res.send([]);
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).end();
  }

  const tweetIds: string[] = (req.query.ids as string).split(",");

  try {
    const tweets = await useRedis(tweetExpansions(tweetIds, session.user.id));
    res.send(tweets);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
}
