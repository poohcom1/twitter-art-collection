import { NextApiRequest, NextApiResponse } from "next";
import { getTwitterApi } from "../../../lib/twitter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { username, pageString } = req.query

        if (Array.isArray(username) || Array.isArray(pageString)) {
            return
        }

        const page = parseInt(pageString)

        const twitterApi = await getTwitterApi()
        const user = await twitterApi.v2.userByUsername(username);

        const likedTweets = await twitterApi.v2.userLikedTweets(user.data.id, {
            "expansions": ["attachments.media_keys"],
            "media.fields": ["url"]
        })

        let tweets = await likedTweets.fetchNext()
        let i = 1

        while (i >= page && !likedTweets.done) {
            tweets = await likedTweets.fetchNext()
        }

        res.send(tweets.data)
    } catch (e) {
        console.log(e)
    }
}