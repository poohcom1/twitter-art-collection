import getMongoClient from "lib/mongodb";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import UserModel from "schemas/User";
import { getTwitterApi } from "../../lib/twitter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await getTwitterApi()

        await getMongoClient()

        const session = await getSession({ req })

        if (session) {
            await UserModel.findOneAndUpdate({ uid: session.user.id }, {
                $setOnInsert: {
                    uid: session.user.id,
                    tags: {}
                }
            },
                {
                    upsert: true
                })
        }

        res.status(200).send("Ok")
    } catch (e) {
        console.log(e)
        res.status(500).send("Error")
    }
}