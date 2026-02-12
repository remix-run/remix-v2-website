export const CACHE_CONTROL = {
  DEFAULT: "max-age=300, stale-while-revalidate=604800",
  conf: `max-age=${60 * 60 * 24}, stale-while-revalidate=604800`,
};
