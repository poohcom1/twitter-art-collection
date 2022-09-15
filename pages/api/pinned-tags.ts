import type { NextApiRequest, NextApiResponse } from "next";
import UserModel from "models/User";
import { getUserId } from "lib/nextAuth";
import { getMongoConnection } from "lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [uid, _mongo] = await Promise.all([
    getUserId(req),
    getMongoConnection(),
  ]);

  if (!uid) {
    return res.status(401).end();
  }

  const pinnedTags = (req.query.tags as string).split(",") ?? [];

  try {
    await UserModel.updateOne({ uid }, { $set: { pinnedTags: pinnedTags } });

    res.status(200).end();
  } catch (e) {
    console.error(e);

    res.status(500).end();
  }
}
