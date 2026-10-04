import type { Resource } from "@/lib/types";
import ResourceCard from "./ResourceCard";

interface ResourceGridProps {
  resources: Resource[];
  compact?: boolean;
}

export default function ResourceGrid({
  resources,
  compact = false,
}: ResourceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          compact={compact}
        />
      ))}
    </div>
  );
}
