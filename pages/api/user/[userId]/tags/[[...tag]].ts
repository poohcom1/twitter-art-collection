import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import UserModel from "schemas/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getTags(req, res)
        case "POST":
            return postTag(req, res)
        case "PUT":
            return putTag(req, res)
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
    const tag: PostTagBody = req.body

    console.info("[POST tag] Tag added: " + tag.name)

    try {
        const user = await UserModel.findOne({ uid: req.query.userId })

        if (!user || tag.name in user.tags) {
            throw new Error("Tag already exists")
        }

        user.tags.set(tag.name, tag)

        await user.save()

        res.status(200).send("Ok")

    } catch (e) {
        console.error("[POST tag] " + e)
        res.status(500).send("Error: " + e)
    }
}

async function putTag(req: NextApiRequest, res: NextApiResponse) {
    const body: PutTagBody = req.body

    try {
        await UserModel.updateOne(
            { uid: req.query.userId },
            { $push: { name: body.name, images: body.images } }
        );

        res.status(200)

    } catch (e) {
        console.error("[POST tag] " + e)
        res.status(500).send("Error: " + e)
    }
}