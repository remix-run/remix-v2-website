import * as React from "react";
import {
  Link,
  isRouteErrorResponse,
  useMatches,
  useParams,
  useRouteError,
  data,
  useLoaderData,
} from "react-router";
import type { HeadersFunction } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import invariant from "tiny-invariant";
import type { Doc } from "~/lib/docs";
import { getDoc } from "~/lib/docs";
import iconsHref from "~/icons.svg";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-links";
import { getMeta } from "~/lib/meta";
import { useEffect, useRef, useState } from "react";
import cx from "clsx";
import type { Route } from "./+types/docs.$";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    let slug = params["*"]?.endsWith("/changelog")
      ? "CHANGELOG"
      : `docs/${params["*"] || "index"}`;
    let doc = await getDoc(slug);
    if (!doc) throw null;
    return data(
      { doc },
      { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
    );
  } catch (error) {
    console.error("Caught error in docs.$ loader", error);
    throw data(null, { status: 404 });
  }
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  // Inherit the caching headers from the loader so we don't cache 404s
  let headers = new Headers(loaderHeaders);
  headers.set("Vary", "Cookie");
  return headers;
};

export function meta({ loaderData, matches }: Route.MetaArgs) {
  let rootData = matches[0].loaderData;
  invariant(rootData && "isProductionHost" in rootData, "No root data found");
  let { siteUrl, isProductionHost } = rootData;
  let ogImageUrl = siteUrl + "/img/og.1.jpg";

  if (!loaderData) {
    return [{ title: "Not Found" }];
  }

  let { doc } = loaderData;

  let robots = isProductionHost ? "index,follow" : "noindex,nofollow";
  robots = "index,follow";

  return getMeta({
    title: `${doc.attrs.title} | Remix`,
    // TODO: add a description
    // let description: 'some description';
    siteUrl,
    image: ogImageUrl,
    additionalMeta: [
      { name: "og:type", content: "article" },
      { name: "og:site_name", content: "Remix" },
      { name: "docsearch:language", content: "en" },
      { name: "docsearch:version", content: "main" },
      { name: "robots", content: robots },
      { name: "googlebot", content: robots },
    ],
  });
}

export default function DocPage() {
  const { doc } = useLoaderData<typeof loader>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);
  let matches = useMatches();
  let isDocsIndex = matches.some((match) => match.id === "routes/docs._index");

  return (
    <div className="xl:flex xl:w-full xl:justify-between xl:gap-8">
      {isDocsIndex ? null : doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <LargeOnThisPage doc={doc} mdRef={ref} key={doc.slug} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}
      <div className="min-w-0 pt-12 xl:flex-grow xl:pt-20">
        <div ref={ref} className="markdown w-full max-w-3xl pb-[33vh]">
          <div
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>
    </div>
  );
}

function LargeOnThisPage({
  doc,
  mdRef,
}: {
  doc: Doc;
  mdRef: React.RefObject<HTMLDivElement>;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeHeading, setActiveHeading] = useState("");
  useEffect(() => {
    const node = mdRef.current;
    if (!node) return;

    const h2 = Array.from(node.querySelectorAll("h2"));
    const h3 = Array.from(node.querySelectorAll("h3"));

    const combinedHeadings = [...h2, ...h3]
      .sort((a, b) => a.offsetTop - b.offsetTop)
      // Iterate backwards through headings to find the last one above scroll position
      .reverse();

    function handleScroll() {
      // bail if the nav is not visible
      const node = navRef.current;
      if (!node) return;
      if (window.getComputedStyle(node).display !== "block") {
        return;
      }

      for (const heading of combinedHeadings) {
        // 100px arbitrary value to to offset the height of the header (h-16)
        if (window.scrollY + 100 > heading.offsetTop) {
          setActiveHeading(heading.id);
          break;
        }
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mdRef]);
  return (
    <div
      ref={navRef}
      className="sticky top-36 order-1 mt-20 hidden max-h-[calc(100vh-9rem)] w-56 flex-shrink-0 self-start overflow-y-auto pb-10 xl:block"
    >
      <nav className="mb-3 flex items-center font-semibold">On this page</nav>
      <ul className="md-toc flex flex-col flex-wrap gap-3 leading-[1.125]">
        {doc.headings.map((heading, i) => {
          return (
            <li
              key={i}
              className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
            >
              <Link
                to={`#${heading.slug}`}
                dangerouslySetInnerHTML={{ __html: heading.html || "" }}
                className={cx(
                  "group relative py-1 text-sm text-gray-500 decoration-gray-200 underline-offset-4 hover:underline dark:text-gray-300 dark:decoration-gray-500",
                  {
                    underline: activeHeading == heading.slug,
                  },
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SmallOnThisPage({ doc }: { doc: Doc }) {
  return (
    <details className="group -mx-4 flex h-full flex-col sm:-mx-6 lg:mx-0 lg:mt-4 xl:ml-80 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li
            key={i}
            className={heading.headingLevel === "h2" ? "ml-0" : "ml-4"}
          >
            <Link
              to={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200"
            />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ErrorBoundary() {
  let error = useRouteError();
  let params = useParams();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">{error.status}</h1>
        <p className="text-lg">
          {[400, 404].includes(error.status) ? (
            <>
              There is no doc for <i className="text-gray-500">{params["*"]}</i>
            </>
          ) : (
            error.statusText
          )}
        </p>
      </div>
    );
  }
  throw error;
}
