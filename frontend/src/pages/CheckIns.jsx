import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { mockCheckIns, mockObjectives } from "@/data/mockData";
import {
  Search,
  Plus,
  Clock,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar,
  User,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
 

export const CheckIns = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newCheckIn, setNewCheckIn] = useState({
    objectiveId: "",
    progress: 50,
    comment: "",
    blockers: "",
  });

  const pendingObjectives = mockObjectives.filter(
    (obj) => obj.status !== "completed"
  );

  return (
    <>
      <AppLayout
        title="Check-ins"
        subtitle="Seguimiento continuo y actualizaciones de progreso"
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">24</p>
                  <p className="text-sm text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">Con bloqueos</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">+5%</p>
                  <p className="text-sm text-muted-foreground">
                    Avance promedio
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar check-ins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-card"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 gradient-primary border-0">
                  <Plus className="w-4 h-4" />
                  Nuevo Check-in
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-125">
                <DialogHeader>
                  <DialogTitle>Registrar Check-in</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Objetivo</Label>
                    <Select
                      value={newCheckIn.objectiveId}
                      onValueChange={(value) =>
                        setNewCheckIn({ ...newCheckIn, objectiveId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingObjectives.map((obj) => (
                          <SelectItem key={obj.id} value={obj.id}>
                            {obj.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Progreso</Label>
                      <span className="text-sm font-medium text-foreground">
                        {newCheckIn.progress}%
                      </span>
                    </div>
                    <Slider
                      value={[newCheckIn.progress]}
                      onValueChange={(value) =>
                        setNewCheckIn({ ...newCheckIn, progress: value[0] })
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comentarios</Label>
                    <Textarea
                      placeholder="Describe el avance, logros y próximos pasos..."
                      value={newCheckIn.comment}
                      onChange={(e) =>
                        setNewCheckIn({
                          ...newCheckIn,
                          comment: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bloqueos (opcional)</Label>
                    <Textarea
                      placeholder="¿Hay algún impedimento o riesgo?"
                      value={newCheckIn.blockers}
                      onChange={(e) =>
                        setNewCheckIn({
                          ...newCheckIn,
                          blockers: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline">Cancelar</Button>
                    <Button className="gradient-primary border-0">
                      Guardar Check-in
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Check-ins Timeline */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Historial de Check-ins
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {mockCheckIns.map((checkIn, index) => {
                const progressDiff =
                  checkIn.progress - checkIn.previousProgress;
                const hasBlockers = !!checkIn.blockers;

                return (
                  <div
                    key={checkIn.id}
                    className={cn(
                      "p-5 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in",
                      `stagger-${Math.min(index + 1, 5)}`
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline Indicator */}
                      <div className="flex flex-col items-center pt-1">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            hasBlockers
                              ? "bg-warning"
                              : progressDiff > 0
                              ? "bg-success"
                              : "bg-primary"
                          )}
                        />
                        {index < mockCheckIns.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-medium text-foreground mb-0.5">
                              {checkIn.objectiveTitle}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                <span>{checkIn.userName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{checkIn.createdAt}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 justify-end">
                                {progressDiff > 0 ? (
                                  <TrendingUp className="w-4 h-4 text-success" />
                                ) : (
                                  <TrendingUp className="w-4 h-4 text-muted-foreground rotate-90" />
                                )}
                                <span
                                  className={cn(
                                    "text-sm font-semibold",
                                    progressDiff > 0
                                      ? "text-success"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {progressDiff > 0 ? "+" : ""}
                                  {progressDiff}%
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {checkIn.previousProgress}% → {checkIn.progress}
                                %
                              </span>
                            </div>
                            <div className="w-16">
                              <Progress
                                value={checkIn.progress}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mt-3 p-3 bg-muted/50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground">
                            {checkIn.comment}
                          </p>
                        </div>

                        {hasBlockers && (
                          <div className="flex items-start gap-2 mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-destructive">
                                Bloqueador:
                              </span>
                              <p className="text-sm text-foreground">
                                {checkIn.blockers}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};
