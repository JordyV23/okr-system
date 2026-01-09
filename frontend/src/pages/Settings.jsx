import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Calendar,
  Scale,
  Users,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompetencyFormDialog } from "@/components/forms/CompetencyFormDialog";
import { competenciesApi, cyclesApi, settingsApi } from "@/lib/api";
import Swal from "sweetalert2";

const evaluationScales = [
  { value: "1-5", label: "1 a 5" },
  { value: "1-10", label: "1 a 10" },
  { value: "letters", label: "A, B, C, D, E" },
  { value: "descriptive", label: "No cumple - Supera" },
];

export const Settings = () => {
  const [competencies, setCompetencies] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [settings, setSettings] = useState({
    evaluation_scale_objectives: "1-5",
    evaluation_scale_competencies: "1-5",
    weight_objectives: 70,
    weight_competencies: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailCheckIn: true,
    emailDeadline: true,
    emailEvaluation: true,
    inAppCheckIn: true,
    inAppMentions: true,
  });
  const [isCompetencyFormOpen, setIsCompetencyFormOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState(undefined);

  const handleEditCompetency = useCallback((comp) => {
    setEditingCompetency({
      ...comp,
      id: comp.id.toString(),
    });
    setIsCompetencyFormOpen(true);
  }, []);

  const handleDeleteCompetency = useCallback(async (comp) => {
    const result = await Swal.fire({
      title: "¿Desactivar competencia?",
      html: `¿Estás seguro de que quieres desactivar la competencia <strong>"${comp.name}"</strong>?<br>Podrás reactivarla más tarde si es necesario.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await competenciesApi.delete(comp.id);

        // Wait a moment for database to process
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Reload competencies
        const competenciesData = await competenciesApi.getAll();
        setCompetencies(competenciesData);

        Swal.fire({
          title: "¡Eliminado!",
          text: "La competencia ha sido desactivada correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        let errorMessage =
          "No se pudo eliminar la competencia. Inténtalo de nuevo.";

        // Extract detailed error message if available
        if (error.message) {
          if (error.message.includes("está siendo utilizada en")) {
            errorMessage = error.message;
          } else if (error.message.includes("detail:")) {
            const match = error.message.match(/detail: (.+)/);
            if (match) {
              errorMessage = match[1];
            }
          } else {
            errorMessage = error.message;
          }
        }

        Swal.fire({
          title: "No se puede eliminar",
          text: errorMessage,
          icon: "warning",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  }, []);

  const handleNewCompetency = useCallback(() => {
    setEditingCompetency(undefined);
    setIsCompetencyFormOpen(true);
  }, []);

  const handleCompetencySuccess = useCallback(async () => {
    try {
      const competenciesData = await competenciesApi.getAll();
      setCompetencies(competenciesData);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo recargar la lista de competencias.",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  }, []);

  const handleSaveCycle = useCallback(async () => {
    if (!currentCycle) return;

    setSaving(true);
    try {
      await cyclesApi.update(currentCycle.id, {
        name: currentCycle.name,
        start_date: currentCycle.start_date,
        end_date: currentCycle.end_date,
        is_active: currentCycle.is_active,
      });
      // Reload cycles after successful update
      const cyclesData = await cyclesApi.getAll();
      setCycles(cyclesData);
      const activeCycle = cyclesData.find((cycle) => cycle.is_active);
      setCurrentCycle(activeCycle || cyclesData[0]);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar el ciclo. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSaving(false);
    }
  }, [currentCycle]);

  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      const updatedSettings = await settingsApi.update(settings);
      setSettings(updatedSettings);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la configuración. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Memoized state update handlers to prevent re-renders
  const handleSettingsChange = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load competencies first - if empty, show message
        const competenciesData = await competenciesApi.getAll();
        setCompetencies(competenciesData);

        // Load cycles separately
        const cyclesData = await cyclesApi.getAll();
        setCycles(cyclesData);

        // Find active cycle
        const activeCycle = cyclesData.find((cycle) => cycle.is_active);
        setCurrentCycle(activeCycle || cyclesData[0]);
      } catch (error) {
        // Keep default settings
      }

      // Load settings separately
      try {
        const settingsData = await settingsApi.get();
        setSettings(settingsData);
      } catch (error) {
        console.error("Error loading settings data:", error);
        // Keep default settings
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <AppLayout
        title="Configuración"
        subtitle="Administración del sistema OKR"
      >
        <div className="max-w-4xl">
          <Tabs defaultValue="cycles" className="space-y-6">
            <TabsList className="bg-card border border-border flex-wrap h-auto p-1">
              <TabsTrigger value="cycles" className="gap-2">
                <Calendar className="w-4 h-4" />
                Ciclos
              </TabsTrigger>
              <TabsTrigger value="competencies" className="gap-2">
                <Scale className="w-4 h-4" />
                Competencias
              </TabsTrigger>
              <TabsTrigger value="scales" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                Escalas
              </TabsTrigger>
            </TabsList>

            {/* Cycles Configuration */}
            <TabsContent value="cycles" className="space-y-6">
              <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Ciclo Actual
                </h3>
                {loading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : currentCycle ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del ciclo</Label>
                      <Input
                        value={currentCycle.name || ""}
                        onChange={(e) =>
                          setCurrentCycle((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de ciclo</Label>
                      <Select
                        value={
                          currentCycle.name?.includes("Q")
                            ? "quarter"
                            : "semester"
                        }
                        onValueChange={(value) => {
                          // This could be used to update cycle type, but for now just keep it
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quarter">Trimestral</SelectItem>
                          <SelectItem value="semester">Semestral</SelectItem>
                          <SelectItem value="annual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de inicio</Label>
                      <Input
                        type="date"
                        value={currentCycle.start_date || ""}
                        onChange={(e) =>
                          setCurrentCycle((prev) => ({
                            ...prev,
                            start_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de fin</Label>
                      <Input
                        type="date"
                        value={currentCycle.end_date || ""}
                        onChange={(e) =>
                          setCurrentCycle((prev) => ({
                            ...prev,
                            end_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p>No hay ciclo activo</p>
                )}
              </div>
              <Button
                className="gap-2 gradient-primary border-0"
                onClick={handleSaveCycle}
                disabled={saving || loading}
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </TabsContent>

            {/* Competencies Configuration */}
            <TabsContent value="competencies" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Catálogo de Competencias
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Define las competencias organizacionales
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-2 gradient-primary border-0"
                  onClick={handleNewCompetency}
                >
                  <Plus className="w-4 h-4" />
                  Nueva competencia
                </Button>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-card rounded-xl border border-border/50 shadow-card p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-48"></div>
                              <div className="h-3 bg-gray-200 rounded w-64"></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : competencies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No hay competencias configuradas
                    </p>
                  </div>
                ) : (
                  competencies.map((comp, index) => (
                    <div
                      key={comp.id}
                      className={cn(
                        "bg-card rounded-xl border border-border/50 shadow-card p-4 flex items-center justify-between opacity-0 animate-fade-in",
                        `stagger-${Math.min(index + 1, 5)}`
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {comp.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {comp.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{comp.levels} niveles</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCompetency(comp)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCompetency(comp)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Scales Configuration */}
            <TabsContent value="scales" className="space-y-6">
              <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Escalas de Evaluación
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Escala para objetivos</Label>
                    <Select
                      value={settings.evaluation_scale_objectives}
                      onValueChange={(value) =>
                        handleSettingsChange(
                          "evaluation_scale_objectives",
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {evaluationScales.map((scale) => (
                          <SelectItem key={scale.value} value={scale.value}>
                            {scale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Escala para competencias</Label>
                    <Select
                      value={settings.evaluation_scale_competencies}
                      onValueChange={(value) =>
                        handleSettingsChange(
                          "evaluation_scale_competencies",
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {evaluationScales.map((scale) => (
                          <SelectItem key={scale.value} value={scale.value}>
                            {scale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Ponderaciones
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        Peso de Objetivos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        En la calificación final
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.weight_objectives}
                        onChange={(e) =>
                          handleSettingsChange(
                            "weight_objectives",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 text-center"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        Peso de Competencias
                      </p>
                      <p className="text-sm text-muted-foreground">
                        En la calificación final
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.weight_competencies}
                        onChange={(e) =>
                          handleSettingsChange(
                            "weight_competencies",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 text-center"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="gap-2 gradient-primary border-0"
                onClick={handleSaveSettings}
                disabled={saving || loading}
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <CompetencyFormDialog
          open={isCompetencyFormOpen}
          onOpenChange={setIsCompetencyFormOpen}
          competency={editingCompetency}
          onSuccess={handleCompetencySuccess}
        />
      </AppLayout>
    </>
  );
};
