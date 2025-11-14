import fs from "node:fs";
import path from "node:path";
import type { Config } from "@react-router/dev/config";
import { fetchResourcesFromYaml } from "./app/lib/resources.server";
import { slugify } from "./app/ui/primitives/utils";

export default {
  future: {
    unstable_optimizeDeps: true,
    v8_middleware: true,
  },
  routeDiscovery: {
    mode: "initial",
  },
  prerender: {
    async paths({ getStaticPaths }) {
      return [
        "/docs",
        "/resources",
        ...getStaticPaths(),
        ...getDocsUrls(),
        ...(await getResources()),
        ...getRedirects(),
      ];
    },
    unstable_concurrency: 4, // 1:23s, 2:15s, 4:9s, 8:8s
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

async function getResources() {
  let resources = await fetchResourcesFromYaml();
  return resources.map((r) => `/resources/${slugify(r.title)}`);
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
