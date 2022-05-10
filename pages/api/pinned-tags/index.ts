import type { NextApiRequest, NextApiResponse } from "next";
import UserModel from "models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";
import { getMongoConnection } from "lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [session, _mongo] = await Promise.all([
    getServerSession({ req, res }, authOptions),
    getMongoConnection(),
  ]);

  if (!session) {
    return res.status(400).end();
  }

  const pinnedTags = (req.query.tags as string).split(",") ?? [];

  try {
    await UserModel.updateOne(
      { uid: session.user.id },
      { $set: { pinnedTags: pinnedTags } }
    );
    console.log(pinnedTags);

    res.status(200).end();
  } catch (e) {
    console.error(e);

    res.status(500).end();
  }
}
