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

/**
 * Creates a copy of an array with the element removed
 */
export function remove<P>(arr: P[], item: P) {
  const newArr = [...arr];
  newArr.splice(arr.indexOf(item), 1);
  return newArr;
}

/**
 * Removes item from arr in place
 * @param arr
 * @param item
 */
export function remove_mut<P>(arr: P[], item: P) {
  arr.splice(arr.indexOf(item), 1);
  return item;
}

export const isString = (data: unknown): data is string => {
  return typeof data === "string";
};

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export function objectListToMap<
  T extends object,
  K extends KeysMatching<T, string>
>(objects: T[], key: K) {
  const map = new Map<string, T>();

  for (const object of objects) {
    map.set(object[key] as unknown as string, object);
  }

  return map;
}

export function mapKeys<K, T>(map: Map<K, T>): K[] {
  return Array.from(map.keys());
}

export function mapValues<K, T>(map: Map<K, T>): T[] {
  return Array.from(map.values());
}
