import { fetchRetry, jsonOrError } from "./adapter";

export async function getTags(uid: string): Promise<TagCollection> {
  const res = await fetchRetry(`/api/user/${uid}/tags`, {
    method: "GET",
  });

  const object: object = await jsonOrError(res);

  return new Map(Object.entries(object));
}

export async function postTag(uid: string, tag: TagSchema): Promise<Response> {
  return fetch(`/api/user/${uid}/tags/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });
}

export async function putTags(uid: string, tag: TagSchema): Promise<Response> {
  return fetch(`/api/user/${uid}/tags/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });
}

export async function removeImage(
  uid: string,
  tag: TagSchema,
  image: ImageSchema
) {
  tag.images = tag.images.filter((im) => im !== image);

  return fetch(`/api/user/${uid}/tags/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });
}

export async function deleteTag(uid: string, tag: TagSchema) {
  return fetch(`/api/user/${uid}/tags/${tag.name}`, {
    method: "DELETE",
  });
}
