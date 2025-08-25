import { getAllResources } from "~/lib/resources.server";
import { octokit } from "~/lib/github.server";

export async function getResourcesForRequest() {
  let resources = await getAllResources({ octokit });
  return {
    resources,
    featuredResource: null,
  };
}
