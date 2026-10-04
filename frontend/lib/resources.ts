/**
 * Pure helpers that derive UI data (statistics, filter options, featured
 * picks) from the resource records returned by the API. Keeping these here
 * means no data is hardcoded inside components.
 */

import { RESOURCE_TYPES, type Resource, type ResourceType } from "./types";

/** Count resources per type; every type is always present in the result. */
export function countByType(items: Resource[]): Record<ResourceType, number> {
  const counts = {
    paper: 0,
    dataset: 0,
    expedition: 0,
    researcher: 0,
    institution: 0,
  } as Record<ResourceType, number>;
  for (const item of items) {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  }
  return counts;
}

/** One representative resource per type, in stable display order. */
export function getFeaturedItems(items: Resource[]): Resource[] {
  return RESOURCE_TYPES.map((type) =>
    items.find((item) => item.type === type),
  ).filter((item): item is Resource => Boolean(item));
}

/** Distinct years present in the data, newest first. */
export function getAvailableYears(items: Resource[]): number[] {
  const years = new Set<number>();
  for (const item of items) {
    if (typeof item.year === "number") years.add(item.year);
  }
  return [...years].sort((a, b) => b - a);
}

/** Quick location filters; any other location found in the data is appended. */
const REGION_FILTERS = ["Antarctica", "Arctic", "Southern Ocean"] as const;

export function getLocationFilters(items: Resource[]): string[] {
  const others = new Set<string>();
  for (const item of items) {
    const location = item.location;
    if (!location) continue;
    const covered = REGION_FILTERS.some((region) =>
      location.toLowerCase().includes(region.toLowerCase()),
    );
    if (!covered) others.add(location);
  }
  return [...REGION_FILTERS, ...[...others].sort()];
}

/** "68.5° S, 76.0° E" style label, or null when coordinates are absent. */
export function formatCoordinates(item: Resource): string | null {
  if (item.latitude == null || item.longitude == null) return null;
  const lat = `${Math.abs(item.latitude).toFixed(1)}° ${
    item.latitude >= 0 ? "N" : "S"
  }`;
  const lon = `${Math.abs(item.longitude).toFixed(1)}° ${
    item.longitude >= 0 ? "E" : "W"
  }`;
  return `${lat}, ${lon}`;
}
