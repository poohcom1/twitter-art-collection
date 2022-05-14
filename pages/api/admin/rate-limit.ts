import { getMongoConnection } from "lib/mongodb";
import RateLimitRedisPlugin, {
  RateLimitData,
} from "lib/twitter/RateLimitRedisPlugin";
import UserModel from "models/User";
import { NextApiResponse, NextApiRequest } from "next";

export interface RateLimitResponse {
  lookups: RateLimitData;
  likes: Record<string, RateLimitData>;
  homeTimeline: Record<string, RateLimitData>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const appRateLimitPlugin = new RateLimitRedisPlugin();

  if (!appRateLimitPlugin) {
    console.warn("Redis not configured!");
    return res.status(500).end();
  }

  // APP Limits

  const [lookup] = await Promise.all([
    appRateLimitPlugin.v2.getRateLimitHistory("tweets", "GET"),
  ]);

  // User limits
  await getMongoConnection();

  const users = await UserModel.find({});

  const userIds = users.map((u) => u.uid);

  const likes: Record<string, RateLimitData> = {};
  const homeTimeline: Record<string, RateLimitData> = {};

  for (const id of userIds) {
    const userRateLimitPlugin = new RateLimitRedisPlugin(id);

    const [userLikes, userHomes] = await Promise.all([
      userRateLimitPlugin.v2.getRateLimitHistory(
        "users/:id/liked_tweets",
        "GET"
      ),
      userRateLimitPlugin.v1.getRateLimitHistory(
        "statuses/home_timeline.json",
        "GET"
      ),
    ]);

    if (userLikes) {
      likes[id] = userLikes;
    }

    if (userHomes) {
      homeTimeline[id] = userHomes;
    }
  }

  res.send({
    likes,
    lookup,
    homeTimeline,
  });
}
