import { useState } from "react";
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
import { mockTeamMembers } from "@/data/mockData";

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

export const ObjectiveFormDialog = ({ open, onOpenChange, objective }) => {
  const [formData, setFormData] = useState({
    title: objective?.title || "",
    description: objective?.description || "",
    type: objective?.type || "",
    ownerId: objective?.ownerId || "",
    startDate: objective?.startDate || "",
    endDate: objective?.endDate || "",
    weight: objective?.weight || 25,
    methodology: "okr",
  });

  const [keyResults, setKeyResults] = useState(
    objective?.keyResults || [
      { id: "1", title: "", metric: "", target: 0, unit: "%" },
    ]
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would submit the form data
    console.log({ ...formData, keyResults });
    onOpenChange(false);
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ej: Incrementar la satisfacción del cliente"
                  required
                />
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">Responsable *</Label>
                  <Select
                    value={formData.ownerId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ownerId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha fin *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="pl-9"
                      required
                    />
                  </div>
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
                        onChange={(e) =>
                          updateKeyResult(kr.id, "title", e.target.value)
                        }
                        placeholder="Ej: Aumentar NPS"
                        required
                      />
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
                          onChange={(e) =>
                            updateKeyResult(
                              kr.id,
                              "target",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="100"
                          required
                        />
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
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary border-0">
                {objective ? "Guardar cambios" : "Crear objetivo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
