import type { NextApiRequest, NextApiResponse } from "next";
import type { PostTagBody } from "api";
import { getSession } from "next-auth/react";
import UserModel from "schemas/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getTags(req, res)
        case "POST":
            return postTag(req, res)
    }
}

async function getTags(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await UserModel.findOne({ uid: req.query.userId })

        res.status(200).send(user?.tags)
    } catch (e) {
        console.error("[GET tag] " + e)
        res.status(500).send("Error: " + e)
    }
}


async function postTag(req: NextApiRequest, res: NextApiResponse) {
    const body: PostTagBody = req.body

    const session = await getSession({ req })

    if (!session) {
        return res.status(500)
    }

    try {
        UserModel.updateOne(
            { uid: req.query.userId },
            { $push: { name: body.name, images: body.images } }
        );

        res.status(200)

    } catch (e) {
        console.error("[POST tag] " + e)
        res.status(500).send("Error: " + e)
    }
}