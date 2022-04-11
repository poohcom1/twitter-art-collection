import getMongoConnection from "lib/mongodb";
import { authOptions } from "lib/nextAuth";
import { filterTweets, getTwitterApi, mergeTweets, tweetIdsToSchema } from "lib/twitter";
import UserModel from "models/User";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { fetchTweetAst } from "static-tweets";
import { TweetV2PaginableListParams, ApiResponseError } from "twitter-api-v2";
import { methodHandler } from "lib/restAPI"

export default methodHandler({
    GET: getUser,
    POST: postUser
})

const userLikedTweetsOptions: Partial<TweetV2PaginableListParams> = {
    // expansions: ["attachments.media_keys"],
    // "media.fields": ["url"],
    // max_results: PAGINATION_COUNT,
};

async function getUser(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const [twitterApi, session, _mongoConnection] = await Promise.all([
        getTwitterApi(),
        getServerSession({ req, res }, authOptions),
        getMongoConnection()
    ])

    try {
        if (session) {
            /* ------------------------------ User Database ----------------------------- */
            const user = await UserModel.findOne({ uid: session!.user.id }).lean()

            if (!user) {
                const newUserResponse: UserDataResponse = {
                    newUser: true,

                    tweets: [],
                    tags: new Map()
                }

                return res.send(newUserResponse)
            }

            const databaseTweetIds = user.tweetIds

            /* ------------------------------- Twitter API ------------------------------ */
            /// Make API call
            const payload = await twitterApi.v2.userLikedTweets(
                session.user.id,
                userLikedTweetsOptions
            );

            const newTweetIds = payload.data.data
                .filter(filterTweets(payload.data))
                .map((tweet) => tweet.id);

            // Merge tweets
            const tweetIds = mergeTweets(newTweetIds, databaseTweetIds)

            if (tweetIds.length === newTweetIds.length + databaseTweetIds.length) {
                // TODO Database sync
            }

            const tweets = tweetIds.map(id => ({ id, platform: "twitter", ast: null }));

            /* ------------------------------- Tweet ASTs ------------------------------- */

            if (req.query.ast === "true") {
                const tweetDataAsts = await Promise.all(
                    tweetIds.map((id) => fetchTweetAst(id))
                );


                for (let i = 0; i < tweetIds.length; i++) {
                    if (tweetDataAsts[i]) {
                        tweets[i].ast = tweetDataAsts[i]
                    }
                }

            }

            const responseObject: UserDataResponse = {
                tweets: tweets as TweetSchema[],
                tags: user.tags
            };

            res.status(200).send(responseObject);
        } else {
            res.status(400).send([]);
        }
    } catch (e) {
        if (e instanceof ApiResponseError) {
            if (e.code === 429) {
                return res.status(429).send("Too many tweets");
            }
        }

        console.error(e);
        res.status(500).send("Server Error");
    }
}

async function postUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const [twitterApi, session, _mongoConnection] = await Promise.all([
            getTwitterApi(),
            getServerSession({ req, res }, authOptions),
            getMongoConnection()
        ])

        const userLikedTweetsOptions: Partial<TweetV2PaginableListParams> = {
            expansions: ["attachments.media_keys"],
            "media.fields": ["url"],
        };

        try {
            const payload = await twitterApi.v2.userLikedTweets(session!.user.id, userLikedTweetsOptions);
            await payload.fetchLast()

            const tweetIds = payload.data.data
                .filter(filterTweets(payload.data))
                .map((tweet) => tweet.id)

            const user = new UserModel({
                uid: session!.user.id,
                tags: new Map(),
                tweetIds
            })

            try {
                await user.save()

                console.log("[user] User successfully created")

                const response: UserDataResponse = {
                    tweets: tweetIdsToSchema(tweetIds),
                    tags: new Map()
                }
                res.send(response)
            } catch (e) {
                console.error("[user] Database error: " + e)
                res.status(500).send("Failed to create user on database: " + e)
            }
        } catch (e) {
            console.error("[user] Fetch error: " + e)
            res.status(500).send("Failed to fetch tweets")
        }
    } catch (e) {
        console.error("[user] Service error: " + e)
        res.status(500).send("Database or API error")
    }
}