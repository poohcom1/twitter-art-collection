import { getUserId } from "lib/nextAuth";

import UserModel from "models/User";
import type { NextApiRequest, NextApiResponse } from "next";
import { dbMethodHandler } from "lib/apiHelper";
import { convertDBTagToTag } from "lib/tagValidation";

export default dbMethodHandler({
  GET: getUser,
});

async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const uid = await getUserId(req);

  try {
    if (!uid) {
      res.status(500).send("Server auth Error");
    }
    /* ------------------------------ User Database ----------------------------- */
    const user = await UserModel.findOne({ uid }).lean();

    // New user
    if (!user) {
      console.log("[GET USER] New user found.");

      const newUser = new UserModel({
        uid,
        tags: {},
        pinnedTags: [],
      });

      await newUser.save();

      const response: UserDataResponse = {
        tags: {},
        pinnedTags: [],
      };

      return res.send(response);
    }

    // Fill out tag names
    const convertedTags: Record<string, TagSchema> = {};

    for (const [tagName, tag] of Object.entries(user.tags)) {
      convertedTags[tagName] = convertDBTagToTag(tag, { name: tagName });
    }

    const response: UserDataResponse = {
      tags: convertedTags,
      pinnedTags: user.pinnedTags,
    };

    return res.send(response);
  } catch (e) {
    res.status(500).send("Server Error");
  }
}
