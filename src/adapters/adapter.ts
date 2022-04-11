export async function jsonOrError<T extends object>(
  res: Response
): Promise<Result<T>> {
  if (res.ok) {
    return { error: null, data: await res.json() };
  } else {
    const error = await res.text()
    console.error(error);

    return { error, data: null } ;
  }
};
