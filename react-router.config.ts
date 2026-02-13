import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import type { Config } from "@react-router/dev/config";
import { getConf2023SpeakerPaths } from "./app/lib/conf2023-prerender.server";
import { fetchResourcesFromYaml } from "./app/lib/resources.server";
import { slugify } from "./app/ui/primitives/utils";

export default {
  future: {
    unstable_optimizeDeps: true,
    v8_middleware: true,
    v8_viteEnvironmentApi: true,
    v8_splitRouteModules: true,
  },
  routeDiscovery: {
    mode: "initial",
  },
  prerender: {
    async paths({ getStaticPaths }) {
      let [resources, conf2022Speakers, conf2023Speakers] = await Promise.all([
        getResources(),
        getConf2022SpeakerPaths(),
        getConf2023SpeakerPaths(),
      ]);
      let paths = [
        "/docs",
        "/resources",
        ...getStaticPaths(),
        ...getDocsUrls(),
        ...resources,
        ...getRedirects(),
        ...conf2022Speakers,
        ...conf2023Speakers,
      ];
      // Skip paths that redirect (302) during prerender
      let skipPaths = [
        "/conf", // -> /conf/2023
        "/conf/2022/speakers", // -> /conf/2022#speakers
        "/conf/2022/schedule", // -> /conf/2022/schedule/may-25
        "/conf/2023/speakers", // -> /conf/2023#speakers
      ];
      return paths.filter((p) => !skipPaths.includes(p));
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

function getConf2022SpeakerPaths(): string[] {
  const speakersPath = path.join(
    process.cwd(),
    "data",
    "conf",
    "2022",
    "speakers.yaml",
  );
  let contents: string;
  try {
    contents = fs.readFileSync(speakersPath, "utf-8");
  } catch {
    return [];
  }
  let raw = yaml.parse(contents);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s: unknown) => s && typeof s === "object" && "name" in s)
    .map((s: { name: string }) => `/conf/2022/speakers/${slugify(s.name)}`);
}

