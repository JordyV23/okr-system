import { Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { mockCheckIns } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const RecentCheckIns = () => {
  return (
    <>
      <div className="space-y-4">
        {mockCheckIns.slice(0, 3).map((checkIn, index) => {
          const progressDiff = checkIn.progress - checkIn.previousProgress;
          const hasBlockers = !!checkIn.blockers;

          return (
            <div
              key={checkIn.id}
              className={cn(
                "p-4 rounded-xl bg-secondary/50 border border-border/30 opacity-0 animate-fade-in",
                `stagger-${index + 1}`
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {checkIn.objectiveTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {checkIn.userName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {progressDiff > 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-muted-foreground rotate-90" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      progressDiff > 0
                        ? "text-success"
                        : "text-muted-foreground"
                    )}
                  >
                    +{progressDiff}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {checkIn.comment}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{checkIn.createdAt}</span>
                </div>
                {hasBlockers && (
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Bloqueador</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
