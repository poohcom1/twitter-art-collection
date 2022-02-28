import { fetchRetry, jsonOrError } from "./adapter";

function sanitizeTag(tag: TagSchema): TagSchema {
  tag.images = tag.images.map((image) => ({
    id: image.id,
    platform: image.platform,
  }));

  return tag;
}

export async function getTags(): Promise<TagCollection> {
  const res = await fetchRetry(`/api/tags/`, {
    method: "GET",
  });

  const object: object = await jsonOrError(res);

  return new Map(Object.entries(object));
}

export async function postTag(tag: TagSchema): Promise<Response> {
  return fetch(`/api/tags/${tag.name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sanitizeTag(tag)),
  });
}

export async function putTags(tag: TagSchema): Promise<Response> {
  console.log(JSON.stringify(sanitizeTag(tag)));
  return fetch(`/api/tags/${tag.name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sanitizeTag(tag)),
  });
}

export async function deleteTag(tag: TagSchema) {
  return fetch(`/api/tags/${tag.name}`, {
    method: "DELETE",
  });
}
