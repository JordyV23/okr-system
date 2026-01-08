import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Target } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Progress } from "@/components/ui/Progress";
import { objectivesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export const ObjectivesList = () => {
  const [objectives, setObjectives] = useState([]);

  useEffect(() => {
    const loadObjectives = async () => {
      try {
        const data = await objectivesApi.getAll({ limit: 4 });
        setObjectives(data);
      } catch (error) {
        console.error('Error loading objectives:', error);
        setObjectives([]);
      }
    };
    loadObjectives();
  }, []);

  return (
    <>
      <div className="space-y-3">
        {objectives.map((objective, index) => (
          <Link
            key={objective.id}
            to={`/objectives/${objective.id}`}
            className={cn(
              "block p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in",
              `stagger-${index + 1}`
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-foreground truncate">
                    {objective.title}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span>{objective.owner?.full_name}</span>
                  <span>•</span>
                  <span>{objective.department}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress value={objective.progress} className="h-1.5" />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {objective.progress}%
                  </span>
                  <StatusBadge status={objective.status} size="sm" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
