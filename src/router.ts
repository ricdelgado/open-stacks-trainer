export type Route =
  | { name: "menu" }
  | { name: "train" }
  | { name: "summary" }
  | { name: "stats" }
  | { name: "my-stacks" }
  | { name: "stack-new" }
  | { name: "stack-edit"; id: string }
  | { name: "stack-view"; id: string }
  | { name: "import" };

function decodeId(value: string): string | null {
  try {
    return value.length > 0 ? decodeURIComponent(value) : null;
  } catch {
    return null;
  }
}

export function parseRoute(hash: string): Route {
  const withoutHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const parts = withoutHash.split("/").filter((part) => part.length > 0);

  if (parts.length === 0) return { name: "menu" };

  const [first, second, third, ...rest] = parts;
  if (rest.length > 0) return { name: "menu" };

  if (first === "train" && second === undefined) return { name: "train" };
  if (first === "summary" && second === undefined) return { name: "summary" };
  if (first === "stats" && second === undefined) return { name: "stats" };
  if (first === "my-stacks" && second === undefined) {
    return { name: "my-stacks" };
  }
  if (first === "import" && second === undefined) return { name: "import" };

  if (first === "stacks") {
    if (second === "new" && third === undefined) return { name: "stack-new" };
    if (second !== undefined && third !== undefined && rest.length === 0) {
      const id = decodeId(second);
      if (!id) return { name: "menu" };
      if (third === "view") return { name: "stack-view", id };
      if (third === "edit") return { name: "stack-edit", id };
    }
  }

  return { name: "menu" };
}
