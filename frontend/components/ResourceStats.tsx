import { countByType } from "@/lib/resources";
import {
  RESOURCE_TYPES,
  TYPE_PLURAL_LABELS,
  type Resource,
  type ResourceType,
} from "@/lib/types";

const TYPE_ICONS: Record<ResourceType, string> = {
  paper: "📄",
  dataset: "📊",
  expedition: "🚢",
  researcher: "👤",
  institution: "🏛️",
};

/** Live collection statistics, always computed from API data. */
export default function ResourceStats({ items }: { items: Resource[] }) {
  const counts = countByType(items);
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {RESOURCE_TYPES.map((type) => (
        <div
          key={type}
          className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
        >
          <dd
            aria-label={`${counts[type]} ${TYPE_PLURAL_LABELS[type]}`}
            className="text-3xl font-bold text-sky-800"
          >
            {counts[type]}
          </dd>
          <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span aria-hidden="true">{TYPE_ICONS[type]}</span>{" "}
            {TYPE_PLURAL_LABELS[type]}
          </dt>
        </div>
      ))}
    </dl>
  );
}
