import { type Route } from "./+types/route";
import { ResourceTag } from "~/ui/resources";
import { getResourcesForRequest } from "./data.server";
import {
  categories,
  FeaturedResourcePoster,
  ResourceCards,
  ResourceCategoryTabs,
} from "./ui";
import type { Category } from "~/lib/resources.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let resource = await getResourcesForRequest(request);

  return {
    selectedCategory: "all" as Category,
    selectedTags: [],
    ...resource,
  };
};

export async function clientLoader({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  let { resources } = await serverLoader();
  // get search params: category and tags
  let searchParams = new URL(request.url).searchParams;
  let selectedCategory = searchParams.get("category") as Category;
  let selectedTagsSet = new Set(searchParams.getAll("tag"));
  let tags = new Set(resources.flatMap(({ tags }) => tags));

  // handle a missing or incorrect category
  if (!selectedCategory || !categories.includes(selectedCategory)) {
    selectedCategory = "all";
  }

  // filter by selected tags and return both the selected tags and the filtered resources
  let selectedTags = [...selectedTagsSet].filter((t) => tags.has(t));

  // filter resources by category
  resources =
    selectedCategory === "all"
      ? resources
      : resources.filter(({ category }) => category === selectedCategory);

  // show the featured resource if no tags are selected
  if (selectedTags.length === 0) {
    let featuredIdx = resources.findIndex(({ featured }) => featured);
    featuredIdx = featuredIdx === -1 ? 0 : featuredIdx;

    let featuredResource = resources[featuredIdx];
    resources.splice(featuredIdx, 1);
    return {
      selectedCategory,
      selectedTags,
      featuredResource,
      resources,
    };
  }

  // get all resources that have all of the selected tags
  resources = resources.filter(({ tags }) => {
    return selectedTags.every((tag) => tags.includes(tag));
  });

  return {
    selectedCategory,
    selectedTags,
    resources,
    featuredResource: null,
  };
}

clientLoader.hydrate = true;

export const meta = (args: Route.MetaArgs) => {
  let { siteUrl } = args.matches[0].loaderData;
  let title = "Remix Resources";
  let image = siteUrl ? `${siteUrl}/img/og.1.jpg` : null;
  let description = "Remix Resources made by the community, for the community";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:url", content: `${siteUrl}/showcase` },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: "@remix_run" },
    { name: "twitter:site", content: "@remix_run" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function Resources({ loaderData }: Route.ComponentProps) {
  let { featuredResource, selectedCategory, selectedTags, resources } =
    loaderData;

  return (
    <main className="container flex flex-1 flex-col items-center md:mt-8">
      {featuredResource ? (
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            Remix Resources
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-light">
            Made by the community, for the community
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-2 self-start md:flex-row md:gap-4">
          <h1 className="min-w-fit self-start text-2xl font-bold md:text-4xl md:font-normal">
            Resources that use
          </h1>
          <div className="mt-2 flex w-full max-w-full flex-wrap gap-x-2 gap-y-2 lg:mt-2">
            {selectedTags.map((tag) => (
              <ResourceTag key={tag} value={tag} selected>
                {tag}
              </ResourceTag>
            ))}
          </div>
        </div>
      )}

      <div
        className={
          "mt-8 grid min-w-full grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-8"
        }
      >
        {featuredResource ? (
          <FeaturedResourcePoster featuredResource={featuredResource} />
        ) : null}

        <ResourceCategoryTabs selectedCategory={selectedCategory} />

        <ResourceCards
          resources={resources}
          selectedCategory={selectedCategory}
          selectedTags={selectedTags}
        />
      </div>
    </main>
  );
}
