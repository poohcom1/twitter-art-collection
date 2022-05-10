import { jsonOrError } from "./adapter";

/**
 * @deprecated All tags should be fetched from the user endpoint
 */
export async function getTags(): Promise<Result<Map<string, TagSchema>>> {
  const res = await fetch(`/api/tags/`, {
    method: "GET",
  });

  return await jsonOrError<Map<string, TagSchema>>(res);
}

// TODO Error handling
export async function postTag(tag: TagSchema): Promise<Response> {
  return fetch(`/api/tags/${tag.name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });
}

export async function putTag(tag: TagSchema): Promise<Response> {
  return fetch(`/api/tags/${tag.name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });
}

export async function deleteTag(tag: TagSchema) {
  return fetch(`/api/tags/${tag.name}`, {
    method: "DELETE",
  });
}

/* ---------------------------------- Pins ---------------------------------- */

export async function pinTags(tags: string[]) {
  return fetch(`/api/pinned-tags?tags=${tags.join(",")}`);
}

export async function renameTag(oldName: string, newName: string) {
  return fetch(`/api/rename-tag?oldName=${oldName}&newName=${newName}`);
}
