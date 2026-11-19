// Utility function to remove undefined parameters
export const removeUndefined = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== "undefined"));
};

export type ShowType = "movie" | "tv";

// Only these two values are valid TMDB media types; anything else must never reach a URL or a query.
export const isShowType = (value: unknown): value is ShowType => value === "movie" || value === "tv";

// Returns a positive integer id, or null when the input is not one.
export const toShowId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};
