import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Plus, Trash2, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { objectivesApi, usersApi, cyclesApi } from "@/lib/api";
import { useToast } from "@/hooks/UseToast";

const objectiveTypes = [
  { value: "strategic", label: "Estratégico" },
  { value: "operational", label: "Operativo" },
  { value: "innovation", label: "Innovación" },
  { value: "development", label: "Desarrollo" },
];

const unitTypes = [
  { value: "%", label: "Porcentaje (%)" },
  { value: "cantidad", label: "Cantidad" },
  { value: "puntos", label: "Puntos" },
  { value: "horas", label: "Horas" },
  { value: "días", label: "Días" },
  { value: "USD", label: "Dinero (USD)" },
];

export const ObjectiveFormDialog = ({
  open,
  onOpenChange,
  objective,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: objective?.title || "",
    description: objective?.description || "",
    type: objective?.type || "",
    ownerId: objective?.owner?.id || objective?.owner_id || "",
    cycleId: objective?.cycle?.id || objective?.cycle_id || "",
    startDate: objective?.start_date || "",
    endDate: objective?.end_date || "",
    weight: objective?.weight || 25,
    methodology: objective?.methodology || "okr",
  });

  const [keyResults, setKeyResults] = useState(
    objective?.key_results?.map((kr) => ({
      id: kr.id,
      title: kr.title,
      metric: kr.metric || "",
      target: kr.target,
      unit: kr.unit || "%",
    })) || [{ id: "1", title: "", metric: "", target: 0, unit: "%" }]
  );

  const addKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        id: Date.now().toString(),
        title: "",
        metric: "",
        target: 0,
        unit: "%",
      },
    ]);
  };

  const removeKeyResult = (id) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((kr) => kr.id !== id));
    }
  };

  const updateKeyResult = (id, field, value) => {
    setKeyResults(
      keyResults.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr))
    );
  };

  const loadTeamMembers = async () => {
    try {
      const data = await usersApi.getAll();
      setTeamMembers(data);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const loadCycles = async () => {
    try {
      const data = await cyclesApi.getAll();
      setCycles(data);
    } catch (error) {
      console.error("Error loading cycles:", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadTeamMembers();
      loadCycles();
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!formData.type) {
      newErrors.type = "El tipo de objetivo es requerido";
    }

    if (!formData.cycleId) {
      newErrors.cycleId = "El ciclo es requerido";
    }

    if (!formData.ownerId) {
      newErrors.ownerId = "El responsable es requerido";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }

    if (!formData.endDate) {
      newErrors.endDate = "La fecha de fin es requerida";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate =
        "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    // Validate key results
    const krErrors = [];
    keyResults.forEach((kr, index) => {
      const krError = {};
      if (!kr.title.trim()) {
        krError.title = "El título del resultado clave es requerido";
      }
      if (!kr.target || kr.target <= 0) {
        krError.target = "El objetivo debe ser mayor a 0";
      }
      if (krError.title || krError.target) {
        krErrors[index] = krError;
      }
    });

    if (krErrors.length > 0) {
      newErrors.keyResults = krErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        ...formData,
        owner_id: formData.ownerId,
        cycle_id: formData.cycleId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        key_results: keyResults.map((kr) => ({
          title: kr.title,
          metric: kr.metric,
          target: parseFloat(kr.target),
          unit: kr.unit,
        })),
      };

      // Remove frontend-specific fields
      delete data.ownerId;
      delete data.cycleId;
      delete data.startDate;
      delete data.endDate;

      if (objective) {
        await objectivesApi.update(objective.id, data);
        toast({
          title: "Objetivo actualizado",
          description: "El objetivo se ha actualizado correctamente.",
        });
      } else {
        await objectivesApi.create(data);
        toast({
          title: "Objetivo creado",
          description: "El objetivo se ha creado correctamente.",
        });
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving objective:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el objetivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {objective ? "Editar Objetivo" : "Nuevo Objetivo"}
            </DialogTitle>
            <DialogDescription>
              Define el objetivo y sus resultados clave (Key Results)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Methodology Selection */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Metodología:</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, methodology: "okr" })
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    formData.methodology === "okr"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  OKR
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, methodology: "smart" })
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    formData.methodology === "smart"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  SMART
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del objetivo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: null });
                  }}
                  placeholder="Ej: Incrementar la satisfacción del cliente"
                  className={errors.title ? "border-red-500" : ""}
                  required
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe el objetivo y su impacto esperado..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de objetivo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, type: value });
                      if (errors.type) setErrors({ ...errors, type: null });
                    }}
                  >
                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {objectiveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cycle">Ciclo *</Label>
                  <Select
                    value={formData.cycleId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, cycleId: value });
                      if (errors.cycleId)
                        setErrors({ ...errors, cycleId: null });
                    }}
                  >
                    <SelectTrigger
                      className={errors.cycleId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Selecciona un ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name} ({cycle.start_date} - {cycle.end_date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cycleId && (
                    <p className="text-sm text-red-500">{errors.cycleId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Responsable *</Label>
                  <Select
                    value={formData.ownerId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, ownerId: value });
                      if (errors.ownerId)
                        setErrors({ ...errors, ownerId: null });
                    }}
                  >
                    <SelectTrigger
                      className={errors.ownerId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Selecciona responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ownerId && (
                    <p className="text-sm text-red-500">{errors.ownerId}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha inicio *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          });
                          if (errors.startDate) setErrors({ ...errors, startDate: null });
                        }}
                        className={`pl-9 ${errors.startDate ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha fin *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => {
                          setFormData({ ...formData, endDate: e.target.value });
                          if (errors.endDate) setErrors({ ...errors, endDate: null });
                        }}
                        className={`pl-9 ${errors.endDate ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (%) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Key Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Define los resultados medibles que indican el logro del
                    objetivo
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKeyResult}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar KR
                </Button>
              </div>

              <div className="space-y-3">
                {keyResults.map((kr, index) => (
                  <div
                    key={kr.id}
                    className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        Key Result {index + 1}
                      </span>
                      {keyResults.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyResult(kr.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Título del resultado *</Label>
                      <Input
                        value={kr.title}
                        onChange={(e) => {
                          updateKeyResult(kr.id, "title", e.target.value);
                          if (errors.keyResults?.[index]?.title) {
                            const newErrors = { ...errors };
                            if (newErrors.keyResults) {
                              newErrors.keyResults[index] = { ...newErrors.keyResults[index], title: null };
                            }
                            setErrors(newErrors);
                          }
                        }}
                        placeholder="Ej: Aumentar NPS"
                        className={errors.keyResults?.[index]?.title ? "border-red-500" : ""}
                        required
                      />
                      {errors.keyResults?.[index]?.title && (
                        <p className="text-sm text-red-500">{errors.keyResults[index].title}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Métrica</Label>
                        <Input
                          value={kr.metric}
                          onChange={(e) =>
                            updateKeyResult(kr.id, "metric", e.target.value)
                          }
                          placeholder="Ej: NPS Score"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Meta *</Label>
                        <Input
                          type="number"
                          value={kr.target || ""}
                          onChange={(e) => {
                            updateKeyResult(
                              kr.id,
                              "target",
                              parseFloat(e.target.value) || 0
                            );
                            if (errors.keyResults?.[index]?.target) {
                              const newErrors = { ...errors };
                              if (newErrors.keyResults) {
                                newErrors.keyResults[index] = { ...newErrors.keyResults[index], target: null };
                              }
                              setErrors(newErrors);
                            }
                          }}
                          placeholder="Ej: 4.5"
                          className={errors.keyResults?.[index]?.target ? "border-red-500" : ""}
                          required
                        />
                        {errors.keyResults?.[index]?.target && (
                          <p className="text-sm text-red-500">{errors.keyResults[index].target}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Unidad</Label>
                        <Select
                          value={kr.unit}
                          onValueChange={(value) =>
                            updateKeyResult(kr.id, "unit", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {unitTypes.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <Button
                type="submit"
                className="gradient-primary border-0"
                disabled={isLoading}
              >
                {isLoading
                  ? "Guardando..."
                  : objective
                  ? "Guardar cambios"
                  : "Crear objetivo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
