
export const BACKEND_URL = process.env.BACKEND_URL

export async function createUser(user: UserSchema) {
    if (!BACKEND_URL) {
        throw new Error("Backend URL not specified")
    }

    await fetch(`${BACKEND_URL}/user`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user })
    })
}