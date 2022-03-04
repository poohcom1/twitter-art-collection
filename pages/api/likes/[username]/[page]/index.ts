import { NextApiRequest, NextApiResponse } from "next";
import { getTwitterApi } from "lib/twitter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { username, pageString, useId } = req.query;

    if (Array.isArray(username) || Array.isArray(pageString)) {
      console.log("[likes] Query is array error");
      return res.status(500).send("Query error");
    }

    const page = parseInt(pageString);

    const twitterApi = await getTwitterApi();

    let id: string | null;

    if (!useId || useId === "false") {
      const user = await twitterApi.v2.userByUsername(username);
      id = user.data.id;
    } else {
      id = username;
    }

    if (!id) {
      console.log("[likes] No id received error");
      return res.status(500).send("[likes] No id error");
    }

    const likedTweets = await twitterApi.v2.userLikedTweets(id, {
      expansions: ["attachments.media_keys"],
      "media.fields": ["url"],
    });

    let tweets = await likedTweets.fetchNext();
    const i = 1;

    while (i >= page && !likedTweets.done) {
      tweets = await likedTweets.fetchNext();
    }

    res.send(tweets.data);
  } catch (e) {
    console.log(e);
    return res.status(500).send("Error: " + e);
  }
}
