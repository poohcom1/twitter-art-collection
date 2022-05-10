# Twitter Art Collection (WIP)

[![Join the chat at https://gitter.im/twitter-art-collection/community](https://badges.gitter.im/twitter-art-collection/community.svg)](https://gitter.im/twitter-art-collection/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![Sample image](public/assets/sample_image.png)

A web app to organize arts and photos from your Twitter likes!

There are a surprising amount of amazing art on Twitter, and once you accumulate a large amount of likes it gets rather hard to go back and find old art, unless you're willing to scroll for while.

This app is designed for those who have this issue, whether you're an art connoisseur who wants to view their collection or a Twitter artist who's looking to organize their references.

## Usage

1. Sign into Twitter through the app to load your liked images.
2. Click on "+ New" in the header to create a new Tag.
3. Click the plus icon above each Tweet to add it to a Tag.

## For Developers

Twitter API access and a Mongo database is required.

### Setup

1. Clone the repository.
2. Run `npm install`.
3. Copy [`sample.env`](./sample.env) and rename it to `.env` and fill in the [environment variables](#environment-variables).
4. Run `npm run dev` to start the web app for development.
5. View the app on `http://localhost:3000`.

#### Environment Variables

Environment variables are required for authorizing various services used by the application. Locally, these are loaded from the `.env` file. When hosting online, environment variables are usually found in each app's setting page.

| Name                                     | Description                                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TWITTER_AUTH_VER                         | The twitter auth version (1.0 or 2.0) to use. Set either                                                                                                                    |
| TWITTER_BEARER_TOKEN                     | For Twitter api usage                                                                                                                                                       |
| TWITTER_API_KEY/TWITTER_CLIENT_ID        | Twitter consumer key (for user authentication)                                                                                                                              |
| TWITTER_API_SECRET/TWITTER_CLIENT_SECRET | Twitter consumer secret (for user authentication)                                                                                                                           |
| NEXTAUTH_URL                             | Base URL of website for redirecting (i.e. http://localhost:3000). See [next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options#nextauth_url) |
| NEXTAUTH_SECRET                          | Encryption key for authentication. Set it to a random string. See [next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options#nextauth_secret)  |
| MONGODB_URI                              | URI for mongodb                                                                                                                                                             |
| REDIS_URL                                | URL for redis                                                                                                                                                               |
