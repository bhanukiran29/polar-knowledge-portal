import { TYPE_LABELS, type ResourceType } from "@/lib/types";

const TYPE_STYLES: Record<ResourceType, string> = {
  paper: "bg-sky-50 text-sky-700 border-sky-200",
  dataset: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expedition: "bg-amber-50 text-amber-700 border-amber-200",
  researcher: "bg-violet-50 text-violet-700 border-violet-200",
  institution: "bg-rose-50 text-rose-700 border-rose-200",
};

const TYPE_ICONS: Record<ResourceType, string> = {
  paper: "📄",
  dataset: "📊",
  expedition: "🚢",
  researcher: "👤",
  institution: "🏛️",
};

interface TypeBadgeProps {
  type: ResourceType;
  size?: "sm" | "md";
}

export default function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold uppercase tracking-wide ${TYPE_STYLES[type]} ${sizeClasses}`}
    >
      <span aria-hidden="true">{TYPE_ICONS[type]}</span>
      {TYPE_LABELS[type]}
    </span>
  );
}
