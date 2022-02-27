import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * This middleware checks if the userId in the API query matches the session ID.
 * As such, all endpoints can use the userId without getSession().
 */
export default async function middleware(req: NextRequest) {
  /**
   * Not currently possible. getMongoClient should be put in all handler endpoints
   * @see https://github.com/vercel/next.js/issues/32369
   */
  // await getMongoClient()

  const session = await getToken({
    req: req as unknown as NextApiRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!session || !req.page.params || session.uid !== req.page.params.userId) {
    console.error("[user] Unauthorized access from " + req.ip);
    return new Response("Auth required", {
      status: 401,
    });
  }

  return NextResponse.next();
}
