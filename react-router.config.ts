import fs from "node:fs";
import path from "node:path";
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_middleware: true,
  },
  routeDiscovery: {
    mode: "initial",
  },
  prerender({ getStaticPaths }) {
    return [
      ...getStaticPaths(),
      "/docs",
      ...getDocsUrls(),
      ...getBlogUrls(),
      ...getRedirects(),
    ];
  },
} satisfies Config;

function getDocsUrls() {
  const docsDir = path.join(process.cwd(), "data", "docs");
  let files = fs
    .readdirSync(docsDir, { withFileTypes: false, recursive: true })
    .filter((f) => typeof f === "string");
  return files
    .filter((f) => f.endsWith(".md") && path.basename(f) !== "index.md")
    .map((f) => `/docs/${f.replace(/\.md$/, "")}`);
}

function getBlogUrls() {
  const blogDir = path.join(process.cwd(), "data", "posts");
  let files = fs
    .readdirSync(blogDir, { withFileTypes: false })
    .filter((f) => typeof f === "string");
  return files
    .filter((f) => f.endsWith(".md") && path.basename(f) !== "index.md")
    .map((f) => `/blog/${f.replace(/\.md$/, "")}`);
}

function getRedirects() {
  let redirects: string[] = [];
  let redirectsFileContents = fs.readFileSync(
    path.join(process.cwd(), "_redirects"),
    "utf-8",
  );
  for (let line of redirectsFileContents.split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    let [from] = line.split(/\s+/);
    redirects.push(from);
  }

  return redirects;
}
