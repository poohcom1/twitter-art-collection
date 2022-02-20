import UserModel from "models/User";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  res.json(await UserModel.findOne({ uid: session?.user.id }).lean())
}