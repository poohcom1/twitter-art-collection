import { jsonOrError } from "./adapter";

function sanitizeTag(tag: TagSchema): TagSchema {
  tag.images = tag.images.map((image) => ({
    id: image.id,
    platform: image.platform,
  }));

  return tag;
}

export async function getTags(): Promise<Result<TagCollection, number>> {
  const res = await fetch(`/api/tags/`, {
    method: "GET",
  });

  const object = await jsonOrError(res);

  return { data: new Map(Object.entries(object.data)), error: object.error };
}

// TODO Error handling
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
