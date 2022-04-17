export function imageEqual(image1: ImageSchema, image2: ImageSchema): boolean {
  return image1.id === image2.id && image1.platform === image2.platform;
}

export function arrayEqual<P>(arr1: P[], arr2: P[]): boolean {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}


export const isString = (data: unknown): data is string => {
  return typeof data === "string";
};