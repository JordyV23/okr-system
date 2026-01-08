import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { checkInsApi, objectivesApi, usersApi } from "@/lib/api";
import { useToast } from "@/hooks/UseToast"; // Corregido: minúsculas por convención shadcn
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
  // Estados de datos
  const [checkIns, setCheckIns] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [users, setUsers] = useState([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estado del formulario
  const initialFormState = {
    objectiveId: "",
    userId: "",
    progress: 50,
    comment: "",
    blockers: "",
  };
  const [newCheckIn, setNewCheckIn] = useState(initialFormState);

  // --- Carga de datos ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [checkInsData, objectivesData, usersData] = await Promise.all([
        checkInsApi.getAll(),
        objectivesApi.getAll(),
        usersApi.getAll(),
      ]);
      setCheckIns(checkInsData);
      setObjectives(objectivesData);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo sincronizar la información.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Lógica de Negocio ---
  const handleSubmit = async () => {
    if (!newCheckIn.objectiveId || !newCheckIn.userId || !newCheckIn.comment) {
      toast({
        title: "Campos incompletos",
        description: "El objetivo, usuario y comentario son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const checkInData = {
        objective_id: newCheckIn.objectiveId,
        user_id: newCheckIn.userId,
        progress: newCheckIn.progress,
        previous_progress: 0, // Asumir 0 por ahora
        comment: newCheckIn.comment,
        blockers: newCheckIn.blockers,
      };
      await checkInsApi.create(checkInData);
      toast({
        title: "Check-in registrado",
        description: "El progreso se ha actualizado correctamente.",
      });
      setNewCheckIn(initialFormState);
      setIsDialogOpen(false);
      loadData(); // Recargar para ver los cambios
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Inténtalo de nuevo en unos momentos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((ci) =>
      ci.objective?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ci.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, checkIns]);

  const pendingObjectives = objectives.filter((obj) => obj.status !== "completed");

  return (
    <AppLayout
      title="Check-ins"
      subtitle="Seguimiento continuo y actualizaciones de progreso"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSummary icon={<Clock className="text-warning" />} value={filteredCheckIns.length} label="Total Check-ins" bgColor="bg-warning/10" />
          <CardSummary icon={<CheckCircle2 className="text-success" />} value={checkIns.length} label="Esta semana" bgColor="bg-success/10" />
          <CardSummary icon={<AlertTriangle className="text-destructive" />} value={checkIns.filter(ci => ci.blockers).length} label="Con bloqueos" bgColor="bg-destructive/10" />
          <CardSummary icon={<TrendingUp className="text-primary" />} value={`${Math.round(checkIns.reduce((sum, ci) => sum + parseFloat(ci.progress), 0) / checkIns.length || 0)}%`} label="Avance promedio" bgColor="bg-primary/10" />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por objetivo o comentario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-80 bg-card"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filtros
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 gradient-primary border-0">
                <Plus className="w-4 h-4" /> Nuevo Check-in
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Check-in</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Select 
                    value={newCheckIn.objectiveId} 
                    onValueChange={(v) => setNewCheckIn({...newCheckIn, objectiveId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingObjectives.map((obj) => (
                        <SelectItem key={obj.id} value={obj.id}>{obj.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Select 
                    value={newCheckIn.userId} 
                    onValueChange={(v) => setNewCheckIn({...newCheckIn, userId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Progreso</Label><span className="text-sm font-bold">{newCheckIn.progress}%</span></div>
                  <Slider
                    value={[newCheckIn.progress]}
                    onValueChange={(v) => setNewCheckIn({...newCheckIn, progress: v[0]})}
                    max={100} step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Comentarios</Label>
                  <Textarea
                    placeholder="¿Qué has logrado?"
                    value={newCheckIn.comment}
                    onChange={(e) => setNewCheckIn({...newCheckIn, comment: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bloqueos (opcional)</Label>
                  <Textarea
                    placeholder="¿Algo te detiene?"
                    value={newCheckIn.blockers}
                    onChange={(e) => setNewCheckIn({...newCheckIn, blockers: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button 
                    className="gradient-primary" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar Check-in"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">Historial de Check-ins</h3>
          </div>
          <div className="divide-y divide-border/50">
            {isLoading ? (
              <SkeletonLoader />
            ) : filteredCheckIns.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No se encontraron registros.</div>
            ) : (
              filteredCheckIns.map((checkIn, index) => (
                <CheckInItem key={checkIn.id} checkIn={checkIn} index={index} total={filteredCheckIns.length} />
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// --- Sub-componentes auxiliares ---

const CardSummary = ({ icon, value, label, bgColor }) => (
  <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgColor)}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const CheckInItem = ({ checkIn, index, total }) => {
  const progressDiff = checkIn.progress - (checkIn.previousProgress || 0);
  return (
    <div className={cn("p-5 hover:bg-muted/30 transition-colors animate-fade-in", `stagger-${Math.min(index + 1, 5)}`)}>
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center pt-1">
          <div className={cn("w-3 h-3 rounded-full", checkIn.blockers ? "bg-warning" : "bg-success")} />
          {index < total - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium">{checkIn.objectiveTitle}</h4>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><User className="w-3 h-3"/> {checkIn.userName}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {checkIn.createdAt}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end font-semibold text-success">
                <TrendingUp className="w-4 h-4" /> +{progressDiff}%
              </div>
              <div className="w-24 mt-1"><Progress value={checkIn.progress} className="h-1.5" /></div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm italic">"{checkIn.comment}"</div>
          {checkIn.blockers && (
            <div className="mt-2 p-3 bg-destructive/5 border border-destructive/10 rounded-lg text-sm text-destructive flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>Bloqueo:</strong> {checkIn.blockers}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="p-5 space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
    ))}
  </div>
);