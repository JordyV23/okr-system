import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge, ApprovalBadge } from "@/components/ui/StatusBadge";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { mockObjectives } from "@/data/mockData";
import {
  Search,
  Filter,
  Plus,
  Target,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Building2,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ObjectiveFormDialog } from "@/components/forms/ObjectiveFormDialog";

const typeLabels = {
  strategic: { label: "Estratégico", className: "bg-primary/10 text-primary" },
  operational: { label: "Operativo", className: "bg-info/10 text-info" },
  innovation: { label: "Innovación", className: "bg-success/10 text-success" },
  development: { label: "Desarrollo", className: "bg-warning/10 text-warning" },
};

const statusFilters = [
  { value: "all", label: "Todos" },
  { value: "on-track", label: "En línea" },
  { value: "at-risk", label: "En riesgo" },
  { value: "delayed", label: "Retrasado" },
  { value: "completed", label: "Completado" },
];
export const Objectives = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [expandedObjective, setExpandedObjective] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredObjectives = mockObjectives.filter((obj) => {
    const matchesSearch =
      obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || obj.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <AppLayout
        title="Objetivos"
        subtitle="Gestión y seguimiento de objetivos organizacionales"
      >
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar objetivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-card"
                />
              </div>
              <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      selectedStatus === filter.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded transition-all",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded transition-all",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button
                size="sm"
                className="gap-2 gradient-primary border-0"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Nuevo Objetivo
              </Button>
            </div>
          </div>

          {/* Objectives List */}
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "space-y-4"
            )}
          >
            {filteredObjectives.map((objective, index) => (
              <div
                key={objective.id}
                className={cn(
                  "bg-card rounded-xl border border-border/50 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-border opacity-0 animate-fade-in",
                  `stagger-${Math.min(index + 1, 5)}`
                )}
              >
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                          {objective.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {objective.description}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-muted rounded-md transition-colors">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className={typeLabels[objective.type].className}
                    >
                      {typeLabels[objective.type].label}
                    </Badge>
                    <StatusBadge status={objective.status} size="sm" />
                    <ApprovalBadge
                      status={objective.approvalStatus}
                      size="sm"
                    />
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Progreso
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {objective.progress}%
                      </span>
                    </div>
                    <Progress value={objective.progress} className="h-2" />
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{objective.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>{objective.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{objective.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Key Results (Expandable) */}
                {objective.keyResults.length > 0 && (
                  <div className="border-t border-border/50">
                    <button
                      onClick={() =>
                        setExpandedObjective(
                          expandedObjective === objective.id
                            ? null
                            : objective.id
                        )
                      }
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {objective.keyResults.length} Key Results
                      </span>
                      {expandedObjective === objective.id ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedObjective === objective.id && (
                      <div className="px-5 pb-4 space-y-3">
                        {objective.keyResults.map((kr) => (
                          <div
                            key={kr.id}
                            className="p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground">
                                {kr.title}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {kr.current}/{kr.target} {kr.unit}
                              </span>
                            </div>
                            <Progress value={kr.progress} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredObjectives.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">
                No se encontraron objetivos
              </h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros o crea un nuevo objetivo
              </p>
            </div>
          )}
        </div>

        <ObjectiveFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
      </AppLayout>
    </>
  );
};
