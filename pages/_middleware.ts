import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const session = await getToken({ req: req as unknown as NextApiRequest, secret: process.env.NEXTAUTH_SECRET })
    const { pathname } = req.nextUrl
    if (pathname === '/') {
        if (session) {
            return NextResponse.redirect(process.env.NEXTAUTH_URL + '/collection')
        }
        else {
            NextResponse.next()
        }
    }

    return NextResponse.next()
}