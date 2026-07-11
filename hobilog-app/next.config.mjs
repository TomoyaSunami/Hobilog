import nextPWA from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache.js";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/Hobilog" : "";
const cacheVersion = "v2";
const runtimeCaching = defaultRuntimeCaching.map((entry) => ({
  ...entry,
  options: {
    ...entry.options,
    cacheName: `${entry.options.cacheName}-${cacheVersion}`
  }
}));

const withPWA = nextPWA({
  cacheId: `hobilog-${cacheVersion}`,
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  runtimeCaching,
  skipWaiting: true,
  scope: `${basePath}/`,
  sw: "sw.js"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath
};

export default withPWA(nextConfig);
