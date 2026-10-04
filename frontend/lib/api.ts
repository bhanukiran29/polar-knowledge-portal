/**
 * Central API client for the Polar Knowledge Portal.
 *
 * Every backend call in the app goes through this module — components never
 * build fetch URLs themselves. The backend base URL can be overridden with
 * NEXT_PUBLIC_API_URL; it defaults to the local FastAPI dev server.
 */

import { isResourceType, type Resource } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Error thrown for any failed API call.
 * A status of 0 means the backend could not be reached at all.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

async function requestJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  } catch {
    throw new ApiError(0, "Unable to connect to the Polar Knowledge API.");
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed with status ${response.status}`,
    );
  }
  return (await response.json()) as T;
}

/** Normalise a raw API payload into well-typed Resource records. */
function parseResources(payload: unknown): Resource[] {
  if (!Array.isArray(payload)) return [];
  return payload.filter(
    (item): item is Resource =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Resource).id === "number" &&
      isResourceType((item as Resource).type),
  );
}

/** Optional filters for searchItems(); empty values are simply omitted. */
export interface SearchFilters {
  q?: string;
  type?: string;
  location?: string;
  year?: string | number;
}

function buildSearchPath(filters: SearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q && filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.type) params.set("type", filters.type);
  if (filters.location) params.set("location", filters.location);
  if (filters.year) params.set("year", String(filters.year));
  const query = params.toString();
  return query ? `/search?${query}` : "/items";
}

/** Fetch all resources. */
export async function getItems(): Promise<Resource[]> {
  return parseResources(await requestJson<unknown[]>("/items"));
}

/** Fetch a single resource by id (throws ApiError 404 when missing). */
export async function getItem(id: number | string): Promise<Resource> {
  return requestJson<Resource>(`/items/${id}`);
}

/** Search resources with optional case-insensitive backend filters. */
export async function searchItems(
  filters: SearchFilters = {},
): Promise<Resource[]> {
  return parseResources(
    await requestJson<unknown[]>(buildSearchPath(filters)),
  );
}

/** Fetch the resources connected to an item via its related_ids. */
export async function getRelatedItems(
  id: number | string,
): Promise<Resource[]> {
  return parseResources(
    await requestJson<unknown[]>(`/items/${id}/related`),
  );
}

/** Simple health check kept for quick diagnostics. */
export async function checkApiHealth(): Promise<{ message: string } | null> {
  try {
    return await requestJson<{ message: string }>("/");
  } catch {
    return null;
  }
}
