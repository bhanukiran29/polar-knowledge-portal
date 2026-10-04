import Link from "next/link";

import type { Resource } from "@/lib/types";
import TypeBadge from "./TypeBadge";

interface ResourceCardProps {
  resource: Resource;
  /** Compact variant used in the related-resources section. */
  compact?: boolean;
}

export default function ResourceCard({
  resource,
  compact = false,
}: ResourceCardProps) {
  const tags = resource.tags.slice(0, compact ? 3 : 4);
  return (
    <Link
      href={`/resource/${resource.id}`}
      aria-label={`View details for ${resource.title}`}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <TypeBadge type={resource.type} size={compact ? "sm" : "md"} />
        {resource.year != null && (
          <span className="text-xs font-medium text-slate-500">
            {resource.year}
          </span>
        )}
      </div>

      <h3 className="mb-2 font-semibold leading-snug text-slate-900 group-hover:text-sky-800">
        {resource.title}
      </h3>

      <div className="mb-3 space-y-1 text-xs text-slate-500">
        {resource.location && (
          <p className="truncate">
            <span aria-hidden="true">📍</span> {resource.location}
          </p>
        )}
        {resource.institution && (
          <p className="truncate">
            <span aria-hidden="true">🏛️</span> {resource.institution}
          </p>
        )}
      </div>

      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {resource.description}
      </p>

      {tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
        View Details
        <span
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
