/** Shared domain types for the Polar Knowledge Portal frontend. */

export const RESOURCE_TYPES = [
  "paper",
  "dataset",
  "expedition",
  "researcher",
  "institution",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const TYPE_LABELS: Record<ResourceType, string> = {
  paper: "Research Paper",
  dataset: "Scientific Dataset",
  expedition: "Expedition",
  researcher: "Researcher",
  institution: "Institution",
};

export const TYPE_PLURAL_LABELS: Record<ResourceType, string> = {
  paper: "Research Papers",
  dataset: "Datasets",
  expedition: "Expeditions",
  researcher: "Researchers",
  institution: "Institutions",
};

export function isResourceType(value: unknown): value is ResourceType {
  return (
    typeof value === "string" &&
    (RESOURCE_TYPES as readonly string[]).includes(value)
  );
}

/** One prototype record returned by the FastAPI backend. */
export interface Resource {
  id: number;
  title: string;
  type: ResourceType;
  description: string;
  year: number | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  institution: string | null;
  tags: string[];
  source: string | null;
  source_url: string | null;
  related_ids: number[];
  /** True for Phase 1 demonstration records. */
  prototype?: boolean;
}
