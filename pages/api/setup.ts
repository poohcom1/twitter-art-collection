import { NextApiRequest, NextApiResponse } from "next";
import { getTwitterApi } from "../../lib/twitter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await getTwitterApi()

        res.status(200).send("Ok")
    } catch (e) {
        console.log(e)
        res.status(501)
    }
}