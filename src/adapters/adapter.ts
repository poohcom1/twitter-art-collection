export const jsonOrError = (res: Response) => {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Server Error");
  }
};
