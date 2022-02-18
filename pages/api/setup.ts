import { NextApiRequest, NextApiResponse } from "next";
import { getTwitterApi } from "./lib/twitter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await getTwitterApi()

    res.status(200).send("Ok")
}