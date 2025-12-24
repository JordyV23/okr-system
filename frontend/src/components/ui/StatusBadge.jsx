import { cn } from "@/lib/utils";

const statusConfig = {
  "not-started": {
    label: "No iniciado",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "on-track": {
    label: "En línea",
    className: "bg-success/10 text-success",
    dot: "bg-success",
  },
  "at-risk": {
    label: "En riesgo",
    className: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  delayed: {
    label: "Retrasado",
    className: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  completed: {
    label: "Completado",
    className: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
};

const approvalConfig = {
  draft: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground",
  },
  pending: {
    label: "Pendiente",
    className: "bg-warning/10 text-warning",
  },
  approved: {
    label: "Aprobado",
    className: "bg-success/10 text-success",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-destructive/10 text-destructive",
  },
};

export function StatusBadge({ status, showDot = true, size = "md" }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      )}
      {config.label}
    </span>
  );
}

export function ApprovalBadge({ status, size = "md" }) {
  const config = approvalConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      {config.label}
    </span>
  );
}
