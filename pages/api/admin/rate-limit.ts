import { getTwitterRateLimit } from "lib/twitter";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [rateLimitPlugin] = await Promise.all([getTwitterRateLimit()]);

  if (!rateLimitPlugin) {
    console.warn("Redis not configured!");
    return res.status(500).end();
  }

  const [likes, lookup] = await Promise.all([
    rateLimitPlugin.v2.getRateLimitHistory("users/:id/liked_tweets", "GET"),
    rateLimitPlugin.v2.getRateLimitHistory("tweets", "GET"),
  ]);

  res.send({
    likes: likes,
    lookup: lookup,
  });
}
