import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import TwitterApi from 'twitter-api-v2'

if (process.env.NODE_ENV === "development") {
    dotenv.config()
}

// Express setup
const app = express()
app.use(cors())

// Twitter setup
const userClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
});

let twitterApp: TwitterApi | null = null

userClient.appLogin().then(api => twitterApp = api);

app.get("/user/:username/:page", async (req, res) => {
    try {
        const username = req.params.username
        const page = parseInt(req.params.page)
        const user = await twitterApp.v2.userByUsername(username);

        const likedTweets = await twitterApp.v2.userLikedTweets(user.data.id, { "expansions": ["attachments.media_keys"], "media.fields": ["url"] })

        let tweets = await likedTweets.fetchNext()
        let i = 1

        while (i >= page && !likedTweets.done) {
            tweets = await likedTweets.fetchNext()
        }

        res.send(tweets.data)
    } catch (e) {
        console.log(e)
    }
})

app.listen(process.env.PORT, function () {
    console.log(`App listening on port ${process.env.PORT}`)
})