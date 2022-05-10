import { getMongoConnection } from "lib/mongodb";
import { authOptions } from "lib/nextAuth";
import { validateTagName } from "lib/tagValidation";
import UserModel from "models/User";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

/**
 *
 * @param req.query.oldName
 * @param req.query.newName
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [session, _mongo] = await Promise.all([
    getServerSession({ req, res }, authOptions),
    getMongoConnection(),
  ]);

  if (!session) {
    return res.status(401).end();
  }

  const oldName = req.query.oldName as string;
  const newName = req.query.newName as string;

  if (!oldName || !newName) {
    console.error("[rename-tag] 'Tag' or 'Rename' undefined");
    return res.status(400).end();
  }

  if (validateTagName(newName)) {
    console.error("[rename-tag] Validation failed");
    return res.status(400).send("Validation failed");
  }

  try {
    await UserModel.updateOne(
      { uid: session.user.id },
      {
        $rename: { [`tags.${oldName}`]: `tags.${newName}` },
      }
    );

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}
