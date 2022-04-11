import { jsonOrError } from "./adapter"


export async function getUser(): Promise<Result<UserDataResponse>> {
    const userRes = await fetch("/api/user", { method: "GET" })

    return await jsonOrError<UserDataResponse>(userRes)
}

export async function postUser(): Promise<Result<UserDataResponse>> {
    const userRes = await fetch("/api/user", { method: "POST" })

    return await jsonOrError<UserDataResponse>(userRes)
}