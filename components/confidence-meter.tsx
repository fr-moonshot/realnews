import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number;
  label?: string;
}

export function ConfidenceMeter({ value, label = "Evidence confidence" }: ConfidenceMeterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-normal">{formatPercent(value)}</span>
      </div>
      <Progress value={value} indicatorClassName="bg-emerald-600" />
    </div>
  );
}
