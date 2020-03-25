export function queryParams(): Record<string, string> {
  return Object.fromEntries(
    location.search
      .replace("?", "")
      .split("&")
      .map(it => it.split("=").map(decodeURIComponent))
      .filter(([key]) => key)
  );
}

export function queryParam(param: string): string | undefined {
  return queryParams()[param];
}
