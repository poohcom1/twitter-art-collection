export const jsonOrError = async (
  res: Response
): Promise<Result<object, number>> => {
  if (res.ok) {
    return { error: 0, data: await res.json() };
  } else {
    console.error(await res.text());

    return { error: res.status, data: {} };
  }
};
