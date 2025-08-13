import fs from "node:fs";
import path from "node:path";
import { processMarkdown } from "~/lib/md.server";
import parseYamlHeader from "gray-matter";
import { load as $ } from "cheerio";
import invariant from "tiny-invariant";

interface MenuDocAttributes {
  title: string;
  order?: number;
  new?: boolean;
  [key: string]: any;
}

interface MenuDoc {
  attrs: MenuDocAttributes;
  children: MenuDoc[];
  filename: string;
  hasContent: boolean;
  slug: string;
}

export interface Doc extends Omit<MenuDoc, "hasContent"> {
  html: string;
  headings: {
    headingLevel: string;
    html: string | null;
    slug: string | undefined;
  }[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DOCS_DIR = path.join(DATA_DIR, "docs");

export async function getMenu(): Promise<MenuDoc[] | undefined> {
  let menu = await getMenuFromStream();
  return menu || undefined;
}

function parseAttrs(
  md: string,
  filename: string,
): { content: string; attrs: Doc["attrs"] } {
  let { data, content } = parseYamlHeader(md);
  return {
    content,
    attrs: {
      title: filename,
      ...data,
    },
  };
}

async function fetchDoc(slug: string): Promise<Doc> {
  let filename = `${slug}.md`;
  // slug has "docs/"" included here so we read from DATA_DIR
  let md = fs.readFileSync(path.join(DATA_DIR, filename), "utf8");
  if (md === null) {
    throw Error(`Could not find ${filename}`);
  }
  try {
    let { html, attributes } = await processMarkdown(md);
    let attrs: MenuDocAttributes = { title: filename };
    if (isPlainObject(attributes)) {
      attrs = { title: filename, ...attributes };
    }

    // sorry, cheerio is so much easier than using rehype stuff.
    let headings = createTableOfContentsFromHeadings(html);
    return { attrs, filename, html, slug, headings, children: [] };
  } catch (err) {
    console.error(`Error processing doc file ${filename}`, err);
    throw err;
  }
}

// create table of contents from h2 and h3 headings
function createTableOfContentsFromHeadings(html: string) {
  let $headings = $(html)("h2,h3");

  let headings = $headings.toArray().map((heading) => ({
    headingLevel: heading.name,
    html: $(heading)("a").remove().end().children().html(),
    slug: heading.attributes.find((attr) => attr.name === "id")?.value,
  }));

  return headings;
}

export async function getDoc(slug: string): Promise<Doc | undefined> {
  let doc = await fetchDoc(slug);
  return doc;
}

async function getMenuFromStream() {
  let docs: MenuDoc[] = [];
  let files = fs
    .readdirSync(DOCS_DIR, { recursive: true })
    .filter((f) => typeof f === "string" && f.endsWith(".md"));
  for (let filename of files) {
    invariant(typeof filename === "string", "Expected file to be a string");
    let content = fs.readFileSync(path.join(DOCS_DIR, filename), "utf8");
    let { attrs, content: md } = parseAttrs(content, filename);
    let slug = makeSlug(filename);

    // don't need docs/index.md in the menu
    // can have docs not in the menu
    if (slug !== "" && !attrs.hidden) {
      docs.push({
        attrs,
        filename,
        slug: makeSlug(filename),
        hasContent: md.length > 0,
        children: [],
      });
    }
  }

  // sort so we can process parents before children
  docs.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  // construct the hierarchy
  let tree: MenuDoc[] = [];
  let map = new Map<string, MenuDoc>();
  for (let doc of docs) {
    let { slug } = doc;

    let parentSlug = slug.substring(0, slug.lastIndexOf("/"));
    map.set(slug, doc);

    if (parentSlug) {
      let parent = map.get(parentSlug);
      if (parent) {
        parent.children.push(doc);
      }
    } else {
      tree.push(doc);
    }
  }

  let sortDocs = (a: MenuDoc, b: MenuDoc) =>
    (a.attrs.order || Infinity) - (b.attrs.order || Infinity);

  // sort the parents and children
  tree.sort(sortDocs);
  for (let category of tree) {
    category.children.sort(sortDocs);
  }

  return tree;
}

/**
 * Removes the extension from markdown file names.
 */
function makeSlug(docName: string): string {
  // Could be as simple as `/^docs\//` but local development tarballs have more
  // path in front of "docs/", so grab any of that stuff too. Maybe there's a
  // way to control the basename of files when we make the local tarball but I
  // dunno how to do that right now.
  return docName
    .replace(/^(.+\/)?docs\//, "")
    .replace(/\.md$/, "")
    .replace(/index$/, "")
    .replace(/\/$/, "");
}

function isPlainObject(obj: unknown): obj is Record<keyof any, unknown> {
  return !!obj && Object.prototype.toString.call(obj) === "[object Object]";
}
