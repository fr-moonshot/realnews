import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/lib/types";

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="space-y-5">
      {breakdown.components.map((component) => (
        <div key={component.key} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{component.label}</p>
              <p className="text-xs leading-5 text-muted-foreground">{component.explanation}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold">
              {component.points}/{component.weight}
            </span>
          </div>
          <Progress value={component.score} indicatorClassName="bg-stone-800" />
        </div>
      ))}

      {breakdown.limitations.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="font-medium">Known limitations</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {breakdown.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
