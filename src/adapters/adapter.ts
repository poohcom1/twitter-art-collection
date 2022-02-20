import fetchBuilder, { FetchRetryParams } from "fetch-retry-ts"

export enum FetchErrors {
    Server = "Server Error"
}

export const fetchRetry = fetchBuilder(fetch, { retries: 5 })

export const jsonOrError = (res: Response) => {
    if (res.ok) {
        return res.json()
    } else {
        throw new Error(FetchErrors.Server)
    }
}
