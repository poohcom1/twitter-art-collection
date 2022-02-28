export function imageEqual(image1: ImageSchema, image2: ImageSchema) {
  return image1.id === image2.id && image1.platform === image2.platform;
}
