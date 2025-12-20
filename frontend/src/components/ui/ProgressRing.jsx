import { cn } from "@/lib/utils";

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  labelClassName,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (progress >= 75) return "stroke-success";
    if (progress >= 50) return "stroke-primary";
    if (progress >= 25) return "stroke-warning";
    return "stroke-destructive";
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-1000 ease-out", getColor())}
          style={{
            animation: "progress-fill 1s ease-out forwards",
          }}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            labelClassName
          )}
        >
          <span className="text-2xl font-bold text-foreground">
            {progress}%
          </span>
          <span className="text-xs text-muted-foreground">Avance</span>
        </div>
      )}
    </div>
  );
}
