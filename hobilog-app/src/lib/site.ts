export const isGithubPages = process.env.GITHUB_PAGES === "true";
export const siteBasePath = isGithubPages ? "/Hobilog" : "";

export function withBasePath(path: `/${string}`): string {
  return `${siteBasePath}${path}`;
}
