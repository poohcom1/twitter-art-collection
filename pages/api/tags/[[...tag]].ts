import type { NextApiRequest, NextApiResponse } from "next";
import UserModel from "models/User";
import { dbMethodHandler } from "lib/apiHelper";
import { getUserId } from "lib/nextAuth";
import { convertToDBTag, validateTagName } from "lib/tagValidation";

export default dbMethodHandler({
  GET: getTags,
  POST: postTag,
  PUT: putTag,
  DELETE: deleteTag,
});

/**
 * @deprecated All tags should be fetched from the user endpoint
 */
async function getTags(req: NextApiRequest, res: NextApiResponse) {
  const uid = await getUserId(req);

  if (uid) {
    try {
      const user = await UserModel.findOne({ uid });

      if (user) {
        res.status(200).send(user.tags);
      }
    } catch (e) {
      console.error("[GET tag] " + e);
      res.status(500).send("Error: " + e);
    }
  } else {
    res.status(401).send("Forbidden");
  }
}

async function postTag(req: NextApiRequest, res: NextApiResponse) {
  const uid = await getUserId(req);

  if (!uid) {
    return res.status(500).send("");
  }

  const tag: PostTagBody = req.body;

  if (validateTagName(tag.name)) {
    console.error("[POST tag] Validation failed");
    return res.status(500).send("Server error");
  }

  console.info("[POST tag] Tag added: " + tag.name);

  try {
    await UserModel.updateOne(
      { uid },
      { $set: { [`tags.${tag.name}`]: convertToDBTag(tag) } }
    );

    res.status(200).send("Ok");
  } catch (e) {
    console.error("[POST tag] " + e);
    res.status(500).send("Error: " + e);
  }
}

async function putTag(req: NextApiRequest, res: NextApiResponse) {
  const uid = await getUserId(req);
  const tag: PutTagBody = req.body;

  console.info("[PUT tag] Tag set: " + tag.name);
  try {
    await UserModel.updateOne(
      { uid },
      {
        $set: {
          [`tags.${tag.name}`]: convertToDBTag(tag),
        },
      }
    );

    res.status(200).send("Ok");
  } catch (e) {
    console.error("[PUT tag] " + e);
    res.status(500).send("Error: " + e);
  }
}

async function deleteTag(req: NextApiRequest, res: NextApiResponse) {
  const uid = await getUserId(req);
  try {
    await UserModel.updateOne(
      { uid },
      { $unset: { [`tags.${req.query.tag}`]: 1 } }
    );

    res.status(200).send("Ok");
  } catch (e) {
    console.error("[DELETE tag] " + e);
    res.status(500).send("Error: " + e);
  }
}
