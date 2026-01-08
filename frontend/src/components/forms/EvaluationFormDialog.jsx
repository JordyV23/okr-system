import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Star,
  CheckCircle2,
  MessageSquare,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluationsApi, objectivesApi, competenciesApi, cyclesApi } from "@/lib/api";
import { useToast } from "@/hooks/UseToast";

export const EvaluationFormDialog = ({
  open,
  onOpenChange,
  userId,
  cycleId,
  evaluation,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [objectives, setObjectives] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [generalComments, setGeneralComments] = useState({
    strengths: "",
    improvements: "",
    developmentActions: "",
  });
  const [activeTab, setActiveTab] = useState("objectives");

  // Load objectives and competencies when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (!open || !userId) return;

      try {
        // Load objectives for the user
        const objectivesData = await objectivesApi.getAll({ owner_id: userId });
        const formattedObjectives = objectivesData.map(obj => ({
          id: obj.id,
          title: obj.title,
          weight: (obj.weight || 0) * 100, // Convert to percentage for display
          targetProgress: (obj.progress || 0) * 100, // Convert to percentage for display
          selfScore: 0,
          comment: "",
        }));
        setObjectives(formattedObjectives);

        // Load competencies
        const competenciesData = await competenciesApi.getAll();
        const formattedCompetencies = competenciesData.map(comp => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          expectedLevel: 3, // Default expected level
          selfScore: 0,
          comment: "",
        }));
        setCompetencies(formattedCompetencies);

        // If editing existing evaluation, load the data
        if (evaluation) {
          setGeneralComments({
            strengths: evaluation.strengths || "",
            improvements: evaluation.improvements || "",
            developmentActions: evaluation.development_actions || "",
          });
        }
      } catch (error) {
        console.error('Error loading evaluation data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de la evaluación.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [open, userId, evaluation, toast]);

  const updateObjective = (id, field, value) => {
    setObjectives(
      objectives.map((obj) =>
        obj.id === id ? { ...obj, [field]: value } : obj
      )
    );
  };

  const updateCompetency = (id, field, value) => {
    setCompetencies(
      competencies.map((comp) =>
        comp.id === id ? { ...comp, [field]: value } : comp
      )
    );
  };

  const calculateObjectivesScore = () => {
    return objectives.reduce(
      (acc, obj) => acc + (obj.selfScore * obj.weight) / 100,
      0
    );
  };

  const calculateCompetenciesScore = () => {
    const avg =
      competencies.reduce((acc, comp) => acc + comp.selfScore, 0) /
      competencies.length;
    return (avg / 5) * 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current cycle if not provided
      let currentCycleId = cycleId;
      if (!currentCycleId) {
        const cycles = await cyclesApi.getAll({ is_active: true });
        if (cycles.length === 0) {
          toast({
            title: "Error",
            description: "No hay un ciclo activo disponible. Contacte al administrador.",
            variant: "destructive",
          });
          return;
        }
        currentCycleId = cycles[0].id;
      }

      const evaluationData = {
        user_id: userId,
        cycle_id: currentCycleId,
        period: "Q1 2025", // This should come from the cycle
        phase: "self-evaluation",
        objectives_weight: 70.0,
        competencies_weight: 30.0,
        strengths: generalComments.strengths,
        improvements: generalComments.improvements,
        development_actions: generalComments.developmentActions,
        evaluation_competencies: competencies.map(comp => ({
          competency_id: comp.id,
          self_score: comp.selfScore,
          expected_level: comp.expectedLevel,
          comment: comp.comment,
        })),
        evaluation_objectives: objectives.map(obj => ({
          objective_id: obj.id,
          self_score: obj.selfScore / 100, // Convert percentage to decimal
          weight: obj.weight / 100, // Convert percentage to decimal
          target_progress: obj.targetProgress / 100, // Convert percentage to decimal
          comment: obj.comment,
        })),
      };

      if (evaluation) {
        // Update existing evaluation
        await evaluationsApi.update(evaluation.id, evaluationData);
        toast({
          title: "Evaluación actualizada",
          description: "La evaluación se ha actualizado correctamente.",
        });
      } else {
        // Create new evaluation
        await evaluationsApi.create(evaluationData);
        toast({
          title: "Evaluación enviada",
          description: "La evaluación se ha enviado correctamente.",
        });
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la evaluación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              {evaluation ? "Editar Evaluación" : "Nueva Autoevaluación"}
            </DialogTitle>
            <DialogDescription>
              {evaluation 
                ? "Edita tu evaluación existente"
                : "Evalúa tu propio desempeño en el período actual"}
            </DialogDescription>
          </DialogHeader>

          {/* Score Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Objetivos (70%)
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {calculateObjectivesScore().toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">
                  Competencias (30%)
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {calculateCompetenciesScore().toFixed(1)}%
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="objectives">Objetivos</TabsTrigger>
                <TabsTrigger value="competencies">Competencias</TabsTrigger>
                <TabsTrigger value="summary">Resumen</TabsTrigger>
              </TabsList>

              {/* Objectives Tab */}
              <TabsContent value="objectives" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Califica el cumplimiento de cada objetivo (0-100%)
                </p>
                <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
                  {objectives.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-4 bg-card rounded-lg border border-border/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {obj.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>Peso: {obj.weight}%</span>
                            <span>•</span>
                            <span>Avance real: {obj.targetProgress}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary">
                            {obj.selfScore}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <Label>Calificación</Label>
                          <span className="text-muted-foreground">
                            {obj.selfScore}%
                          </span>
                        </div>
                        <Slider
                          value={[obj.selfScore]}
                          onValueChange={(value) =>
                            updateObjective(obj.id, "selfScore", value[0])
                          }
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">
                          Comentarios / Evidencias
                        </Label>
                        <Textarea
                          value={obj.comment}
                          onChange={(e) =>
                            updateObjective(obj.id, "comment", e.target.value)
                          }
                          placeholder="Justifica tu calificación..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Competencies Tab */}
              <TabsContent value="competencies" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Califica cada competencia del 1 al 5
                </p>
                <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
                  {competencies.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-4 bg-card rounded-lg border border-border/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {comp.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {comp.description}
                          </p>
                          <p className="text-xs text-primary mt-1">
                            Nivel esperado: {comp.expectedLevel}/5
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                updateCompetency(comp.id, "selfScore", star)
                              }
                              className="p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                className={cn(
                                  "w-6 h-6 transition-colors",
                                  star <= comp.selfScore
                                    ? "fill-warning text-warning"
                                    : "text-muted hover:text-warning/50"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Comentarios</Label>
                        <Textarea
                          value={comp.comment}
                          onChange={(e) =>
                            updateCompetency(comp.id, "comment", e.target.value)
                          }
                          placeholder="Ejemplos de cómo demuestras esta competencia..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Fortalezas identificadas
                    </Label>
                    <Textarea
                      value={generalComments.strengths}
                      onChange={(e) =>
                        setGeneralComments({
                          ...generalComments,
                          strengths: e.target.value,
                        })
                      }
                      placeholder="¿Cuáles son tus principales fortalezas demostradas en este período?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-warning" />
                      Áreas de mejora
                    </Label>
                    <Textarea
                      value={generalComments.improvements}
                      onChange={(e) =>
                        setGeneralComments({
                          ...generalComments,
                          improvements: e.target.value,
                        })
                      }
                      placeholder="¿En qué áreas puedes mejorar?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-info" />
                      Acciones de desarrollo propuestas
                    </Label>
                    <Textarea
                      value={generalComments.developmentActions}
                      onChange={(e) =>
                        setGeneralComments({
                          ...generalComments,
                          developmentActions: e.target.value,
                        })
                      }
                      placeholder="¿Qué acciones propones para tu desarrollo profesional?"
                      rows={3}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Adjuntar evidencias
                      </span>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, Excel, Word, imágenes (máx. 10MB)
                      </p>
                    </div>
                  </div>

                  {/* Final Score Preview */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-foreground mb-3">
                      Calificación Final Estimada
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress
                          value={
                            calculateObjectivesScore() * 0.7 +
                            calculateCompetenciesScore() * 0.3
                          }
                          className="h-3"
                        />
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {(
                          calculateObjectivesScore() * 0.7 +
                          calculateCompetenciesScore() * 0.3
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      = (Objetivos {calculateObjectivesScore().toFixed(1)}% ×
                      70%) + (Competencias{" "}
                      {calculateCompetenciesScore().toFixed(1)}% × 30%)
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Guardar borrador
              </Button>
              <Button type="submit" className="gradient-primary border-0" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar evaluación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
