import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, Calendar, User, Target } from "lucide-react";
import { pdisApi, usersApi } from "@/lib/api";
import { useToast } from "@/hooks/UseToast";

const actionTypes = [
  { value: "training", label: "Capacitación / Curso" },
  { value: "project", label: "Proyecto especial" },
  { value: "mentoring", label: "Mentoría" },
  { value: "rotation", label: "Rotación de puesto" },
  { value: "coaching", label: "Coaching" },
  { value: "certification", label: "Certificación" },
  { value: "other", label: "Otro" },
];

export const PDIFormDialog = ({
  open,
  onOpenChange,
  employeeName = "María García",
  onSuccess,
//   employeeId,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    strengths: "",
    improvements: "",
    careerGoals: "",
  });

  const [actions, setActions] = useState([
    {
      id: "1",
      type: "",
      description: "",
      deadline: "",
      responsible: "",
      successIndicator: "",
    },
  ]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const data = await usersApi.getAll();
        setTeamMembers(data);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    if (open) {
      loadTeamMembers();
    }
  }, [open]);

  const addAction = () => {
    setActions([
      ...actions,
      {
        id: Date.now().toString(),
        type: "",
        description: "",
        deadline: "",
        responsible: "",
        successIndicator: "",
      },
    ]);
  };

  const removeAction = (id) => {
    if (actions.length > 1) {
      setActions(actions.filter((action) => action.id !== id));
    }
  };

  const updateAction = (id, field, value) => {
    setActions(
      actions.map((action) =>
        action.id === id ? { ...action, [field]: value } : action
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = { ...formData, actions, employeeName };
      
      await pdisApi.create(data);
      toast({
        title: "PDI creado",
        description: "El Plan de Desarrollo Individual se ha creado correctamente.",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating PDI:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el PDI. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-187.5 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Plan de Desarrollo Individual (PDI)
            </DialogTitle>
            <DialogDescription>
              Define el plan de desarrollo para {employeeName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Employee Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-foreground">
                  {employeeName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-foreground">{employeeName}</h4>
                <p className="text-sm text-muted-foreground">
                  Período: H2 2024
                </p>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Análisis de desempeño
              </h4>

              <div className="space-y-2">
                <Label htmlFor="strengths">Fortalezas identificadas</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) =>
                    setFormData({ ...formData, strengths: e.target.value })
                  }
                  placeholder="Competencias y habilidades donde destaca el colaborador..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements">Áreas de mejora</Label>
                <Textarea
                  id="improvements"
                  value={formData.improvements}
                  onChange={(e) =>
                    setFormData({ ...formData, improvements: e.target.value })
                  }
                  placeholder="Brechas detectadas que requieren desarrollo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="careerGoals">Objetivos de carrera</Label>
                <Textarea
                  id="careerGoals"
                  value={formData.careerGoals}
                  onChange={(e) =>
                    setFormData({ ...formData, careerGoals: e.target.value })
                  }
                  placeholder="Aspiraciones profesionales a corto y mediano plazo..."
                  rows={2}
                />
              </div>
            </div>

            {/* Development Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">
                    Acciones de desarrollo
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Define las actividades específicas para el desarrollo
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAction}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar acción
                </Button>
              </div>

              <div className="space-y-4">
                {actions.map((action, index) => (
                  <div
                    key={action.id}
                    className="p-4 bg-card rounded-lg border border-border/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        Acción {index + 1}
                      </span>
                      {actions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de acción *</Label>
                        <Select
                          value={action.type}
                          onValueChange={(value) =>
                            updateAction(action.id, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha límite *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={action.deadline}
                            onChange={(e) =>
                              updateAction(
                                action.id,
                                "deadline",
                                e.target.value
                              )
                            }
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción de la acción *</Label>
                      <Textarea
                        value={action.description}
                        onChange={(e) =>
                          updateAction(action.id, "description", e.target.value)
                        }
                        placeholder="Describe la actividad de desarrollo..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Responsable de seguimiento</Label>
                        <Select
                          value={action.responsible}
                          onValueChange={(value) =>
                            updateAction(action.id, "responsible", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.length === 0 ? (
                              <SelectItem value="" disabled>
                                Cargando usuarios...
                              </SelectItem>
                            ) : (
                              teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Indicador de éxito</Label>
                        <Input
                          value={action.successIndicator}
                          onChange={(e) =>
                            updateAction(
                              action.id,
                              "successIndicator",
                              e.target.value
                            )
                          }
                          placeholder="¿Cómo se medirá el logro?"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <Label>Recursos necesarios</Label>
              <Textarea
                placeholder="Presupuesto, tiempo, herramientas, apoyo de otras áreas..."
                rows={2}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary border-0" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar PDI'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
