import { tweetExpansions } from "lib/twitter/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.ids) {
    return res.send([]);
  }
  const session = await getServerSession({ req, res }, authOptions);

  if (!session) {
    return res.status(401).end();
  }

  const tweetIds: string[] = (req.query.ids as string).split(",");

  const tweets = await tweetExpansions(tweetIds, session.user.id);

  // End
  res.send(tweets);
}
