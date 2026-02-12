import { Outlet } from "react-router";
import type { HeadersFunction } from "react-router";
import { CACHE_CONTROL } from "~/lib/cache-control";

export const handle = { forceTheme: "dark" };

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.conf,
  };
};

export default function Conf() {
  return <Outlet />;
}
