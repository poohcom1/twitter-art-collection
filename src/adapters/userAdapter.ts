import { jsonOrError } from "./adapter";

const MAX_AGE = 0;

export async function getUser(): Promise<Result<UserDataResponse>> {
  const userRes = await fetch("/api/user", {
    method: "GET",
    headers: {
      "Cache-Control": `private, max-age=${MAX_AGE}`,
    },
  });

  return await jsonOrError<UserDataResponse>(userRes);
}

export async function postUser(): Promise<Result<UserDataResponse>> {
  const userRes = await fetch("/api/user", { method: "POST" });

  return await jsonOrError<UserDataResponse>(userRes);
}
