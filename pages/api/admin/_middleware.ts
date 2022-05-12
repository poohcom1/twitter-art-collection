import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function handler(req: NextRequest) {
  if (!process.env.ADMIN_ID) {
    console.warn("Please set the ADMIN_ID env var to access the admin page");
    return new Response("Server error", {
      status: 500,
    });
  }
  const session = await getToken({ req });

  if (!session || session.uid !== process.env.ADMIN_ID) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  NextResponse.next();
}
