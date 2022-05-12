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

  const [tweetsLookup] = await Promise.all([
    rateLimitPlugin.v2.getRateLimit("users/732184093/liked_tweets"),
  ]);

  console.log(tweetsLookup);

  res.send({
    tweetsLookup,
  });
}
