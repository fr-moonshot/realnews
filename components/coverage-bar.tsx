import { cn } from "@/lib/utils";

interface CoverageBarProps {
  left: number;
  center: number;
  right: number;
  unknown: number;
  compact?: boolean;
}

const SEGMENTS = [
  { key: "left", label: "Left", className: "bg-teal-500" },
  { key: "center", label: "Centre", className: "bg-stone-700" },
  { key: "right", label: "Right", className: "bg-amber-500" },
  { key: "unknown", label: "Unknown", className: "bg-slate-300" }
] as const;

export function CoverageBar({
  left,
  center,
  right,
  unknown,
  compact = false
}: CoverageBarProps) {
  const values = { left, center, right, unknown };
  const total = Math.max(1, left + center + right + unknown);

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        {SEGMENTS.map((segment) => {
          const value = values[segment.key];
          const width = `${(value / total) * 100}%`;

          return value > 0 ? (
            <div
              key={segment.key}
              className={cn(segment.className)}
              style={{ width }}
              title={`${segment.label}: ${value}`}
            />
          ) : null;
        })}
      </div>

      <div className={cn("grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4", compact && "gap-1")}>
        {SEGMENTS.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", segment.className)} />
            <span>
              {segment.label} {values[segment.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
