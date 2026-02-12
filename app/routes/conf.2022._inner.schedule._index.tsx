import type { LoaderFunction } from "react-router";
import { redirect } from "react-router";

export const loader: LoaderFunction = () =>
  redirect("/conf/2022/schedule/may-25");
