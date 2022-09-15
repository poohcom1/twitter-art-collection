import { getMongoConnection } from "lib/mongodb";
import { getUserId } from "lib/nextAuth";
import { validateTagName } from "lib/tagValidation";
import UserModel from "models/User";
import { NextApiRequest, NextApiResponse } from "next";

/**
 *
 * @param req.query.oldName
 * @param req.query.newName
 */
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

  const oldName = req.query.oldName as string;
  const newName = req.query.newName as string;

  if (!oldName || !newName) {
    console.error("[rename-tag] 'oldName' or 'newName' undefined");
    return res.status(400).end();
  }

  if (validateTagName(newName)) {
    console.error("[rename-tag] Validation failed");
    return res.status(400).send("Validation failed");
  }

  try {
    if (oldName !== newName) {
      await UserModel.updateOne(
        { uid },
        {
          $rename: { [`tags.${oldName}`]: `tags.${newName}` },
        }
      );
    } else {
      console.warn("[rename-tag] oldName and newName are identical");
    }

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}
