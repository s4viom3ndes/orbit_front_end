import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  color?: "teal" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function Progress({ value, className, color = "teal", size = "md", showLabel }: ProgressProps) {
  const colors = {
    teal: "bg-teal-400",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2",
  };

  const clampedValue = Math.min(100, Math.max(0, value));
  const barColor =
    value > 90 ? colors.danger : value > 70 ? colors.warning : colors[color];

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-navy-700 overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1">{clampedValue}%</span>
      )}
    </div>
  );
}
