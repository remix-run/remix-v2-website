import {
  getAllResources,
  type Category,
  type Resource,
} from "~/lib/resources.server";
import { categories } from "./ui";
import { octokit } from "~/lib/github.server";

export async function getResourcesForRequest(request: Request) {
  let resources = await getAllResources({ octokit });
  return {
    resources,
    featuredResource: null,
  };
}
