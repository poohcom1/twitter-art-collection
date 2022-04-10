import type { NextApiRequest, NextApiResponse } from "next";
import UserModel from "models/User";
import { methodHandler } from "lib/restAPI";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";

export default methodHandler({
  GET: getTags,
  POST: postTag,
  PUT: putTag,
  DELETE: deleteTag,
});

async function getTags(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);

  try {
    const user = await UserModel.findOne({ uid: session!.user.id });

    if (user) {
      res.status(200).send(user.tags);
    } else {
      throw new Error
    }

  } catch (e) {
    console.error("[GET tag] " + e);
    res.status(500).send("Error: " + e);
  }
}

async function postTag(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);

  const tag: PostTagBody = req.body;

  if (!tag.name.match(/^[a-z0-9-]+$/)) {
    console.error("[POST tag] Validation failed");
    res.status(500).send("Server error");
  }

  console.info("[POST tag] Tag added: " + tag.name);

  try {
    const user = await UserModel.findOne({ uid: session!.user.id });

    if (!user || tag.name in user.tags) {
      throw new Error("Tag already exists");
    }

    user.tags.set(tag.name, tag);

    await user.save();

    res.status(200).send("Ok");
  } catch (e) {
    console.error("[POST tag] " + e);
    res.status(500).send("Error: " + e);
  }
}

async function putTag(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);
  const tag: PutTagBody = req.body;

  console.info("[PUT tag] Tag set: " + tag.name);
  try {
    await UserModel.updateOne(
      { uid: session!.user.id },
      {
        $set: {
          [`tags.${tag.name}`]: { name: tag.name, images: tag.images },
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
  const session = await getServerSession({ req, res }, authOptions);
  try {
    await UserModel.updateOne(
      { uid: session!.user.id },
      { $unset: { [`tags.${req.query.tag}`]: 1 } }
    );

    res.status(200).send("Ok");
  } catch (e) {
    console.error("[PUT tag] " + e);
    res.status(500).send("Error: " + e);
  }
}
