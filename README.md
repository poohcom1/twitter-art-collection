# Twitter Art Collection (WIP)

A web app to organize arts and photos from your Twitter likes!

There are a surprising amount of amazing art on Twitter, and once you accumulate a large amount of likes it gets rather hard to go back and find old art, unless you're willing to scroll for while.

This app is designed for those who have this issue, whether you're an art connoisseur who wants to view their collection or an artist who's looking for reference.

## For Developers

The app is created entirely with Next.js, so it's easy to host on Vercel.

Twitter API access and a Mongo database is required.

### Setup

1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file in the project directory and fill in the [environment variables](#environment-variables).
4. Run `npm run dev` to start the web app.
5. View the app on `http://localhost:3000`.

#### Environment Variables

| Name                  | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| TWITTER_BEARER_TOKEN  | For Twitter api usage                                                                 |
| TWITTER_CLIENT_ID     | For user authentication                                                               |
| TWITTER_CLIENT_SECRET | For user authentication                                                               |
| NEXTAUTH_URL          | Base URL of website (i.e. http://localhost:3000). Not required if hosting via Vercel. |
| NEXTAUTH_SECRET       | Encryption key for authentication. Set it to a random string.                         |
| MONGODB_URI           | URI for mongodb                                                                       |
