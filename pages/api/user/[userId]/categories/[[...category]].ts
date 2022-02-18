import type { NextApiRequest, NextApiResponse } from "next";
import type { PostCategoryBody } from "api";
import { getSession } from "next-auth/react";
import UserModel from "schemas/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getCategory(req, res)
        case "POST":
            return postCategory(req, res)
    }
}

async function getCategory(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await UserModel.findOne({ uid: req.query.userId })

        res.status(200).send(user?.categories)
    } catch (e) {
        console.error("[GET category] " + e)
        res.status(500).send("Error: " + e)
    }
}


async function postCategory(req: NextApiRequest, res: NextApiResponse) {
    const body: PostCategoryBody = req.body

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
        console.error("[POST category] " + e)
        res.status(500).send("Error: " + e)
    }
}