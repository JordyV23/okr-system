import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { evaluationsApi, usersApi } from '@/lib/api';
import { useToast } from '@/hooks/UseToast';
import {
  Search,
  Filter,
  Award,
  Star,
  TrendingUp,
  CheckCircle2,
  Clock,
  User,
  Target,
  Sparkles,
  ChevronRight,
  BarChart3,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EvaluationFormDialog } from '@/components/forms/EvaluationFormDialog';
import { PDIFormDialog } from '@/components/forms/PDIFormDialog';

const phaseConfig = {
  'self-evaluation': { label: 'Autoevaluación', className: 'bg-info/10 text-info', icon: User },
  'leader-evaluation': { label: 'Evaluación líder', className: 'bg-warning/10 text-warning', icon: Award },
  'calibration': { label: 'Calibración', className: 'bg-primary/10 text-primary', icon: BarChart3 },
  'feedback': { label: 'Feedback', className: 'bg-success/10 text-success', icon: Sparkles },
  'completed': { label: 'Completada', className: 'bg-success/10 text-success', icon: CheckCircle2 },
};

const getScoreColor = (score) => {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-primary';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
};

// const getScoreBg = (score) => {
//   if (score >= 85) return 'bg-success';
//   if (score >= 70) return 'bg-primary';
//   if (score >= 50) return 'bg-warning';
//   return 'bg-destructive';
// };

export const Evaluations = () => {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  // const [activeTab, setActiveTab] = useState('active');
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [evaluationType, setEvaluationType] = useState('self');
  const [isPDIOpen, setIsPDIOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({ full_name: '', id: '' });
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const loadEvaluations = async () => {
    try {
      const data = await evaluationsApi.getAll();
      setEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evaluaciones.",
        variant: "destructive",
      });
    }
  };

  const loadTeamMembers = async () => {
    try {
      const data = await usersApi.getAll();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
    loadTeamMembers();
  }, []);

  const evaluation = evaluations.length > 0 ? evaluations[0] : null;

  const handleStartEvaluation = (type, employee) => {
    setEvaluationType(type);
    if (employee) {
      setSelectedEmployee(employee);
    }
    setSelectedEvaluation(null); // Nueva evaluación
    setIsEvaluationOpen(true);
  };

  const handleOpenPDI = (employee) => {
    setSelectedEmployee(employee);
    setIsPDIOpen(true);
  };

  // Pending evaluations
  const pendingEvaluations = teamMembers.slice(0, 5).map((member, i) => ({
    id: `eval-pending-${i}`,
    userId: member.id,
    userName: member.full_name,
    role: member.role,
    department: member.department?.name,
    phase: ['self-evaluation', 'leader-evaluation', 'calibration'][i % 3],
    dueDate: '2024-12-15',
    objectivesProgress: member.avgProgress,
  }));

  return (
    <>
      <AppLayout title="Evaluaciones" subtitle="Evaluación de desempeño y competencias">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">5</p>
                  <p className="text-sm text-muted-foreground">En proceso</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">18</p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">82%</p>
                  <p className="text-sm text-muted-foreground">Score promedio</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">H2 2024</p>
                  <p className="text-sm text-muted-foreground">Ciclo actual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="active">En proceso</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
                <TabsTrigger value="my-evaluation">Mi evaluación</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar evaluaciones..."
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
            </div>

            <TabsContent value="active" className="space-y-4">
              {pendingEvaluations.map((evalItem, index) => {
                const phaseInfo = phaseConfig[evalItem.phase];
                const PhaseIcon = phaseInfo.icon;

                return (
                  <div
                    key={evalItem.id}
                    className={cn(
                      'bg-card rounded-xl border border-border/50 shadow-card p-5 transition-all duration-300 hover:shadow-card-hover hover:border-border opacity-0 animate-fade-in',
                      `stagger-${Math.min(index + 1, 5)}`
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary-foreground">
                            {evalItem.userName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{evalItem.userName}</h3>
                          <p className="text-sm text-muted-foreground">{evalItem.role} • {evalItem.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="secondary" className={cn('gap-1', phaseInfo.className)}>
                            <PhaseIcon className="w-3 h-3" />
                            {phaseInfo.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vence: {evalItem.dueDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEvaluation('leader', { full_name: evalItem.userName, id: evalItem.userId })}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Evaluar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPDI({ full_name: evalItem.userName, id: evalItem.userId })}
                          >
                            PDI
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay evaluaciones completadas en este ciclo</p>
              </div>
            </TabsContent>

            <TabsContent value="my-evaluation" className="space-y-6">
              {/* Action Button */}
              <div className="flex justify-end">
                <Button 
                  className="gradient-primary border-0 gap-2"
                  onClick={() => handleStartEvaluation('self')}
                >
                  <Play className="w-4 h-4" />
                  Iniciar Autoevaluación
                </Button>
              </div>

              {/* Evaluation Header */}
              {evaluation ? (
                <>
                  <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-foreground">
                            {evaluation.user?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">{evaluation.user?.full_name}</h2>
                          <p className="text-muted-foreground">Período: {evaluation.period}</p>
                          <Badge variant="secondary" className={cn('mt-2', phaseConfig[evaluation.phase]?.className)}>
                            {phaseConfig[evaluation.phase]?.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          'text-4xl font-bold',
                          getScoreColor(evaluation.final_score)
                        )}>
                          {evaluation.final_score || 0}%
                        </div>
                        <p className="text-sm text-muted-foreground">Calificación Final</p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">Objetivos</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Peso: {evaluation.objectives_weight}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={evaluation.objectives_score || 0} className="flex-1 h-2" />
                          <span className={cn('font-semibold', getScoreColor(evaluation.objectives_score || 0))}>
                            {evaluation.objectives_score || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-warning" />
                            <span className="font-medium text-foreground">Competencias</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Peso: {evaluation.competencies_weight}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={evaluation.competencies_score || 0} className="flex-1 h-2" />
                          <span className={cn('font-semibold', getScoreColor(evaluation.competencies_score || 0))}>
                            {evaluation.competencies_score || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competencies */}
                  <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                    <h3 className="font-semibold text-foreground mb-4">Evaluación de Competencias</h3>
                    <div className="space-y-4">
                      {evaluation.evaluation_competencies?.map((evalComp) => (
                        <div key={evalComp.id} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-foreground">{evalComp.competency?.name}</h4>
                              <p className="text-sm text-muted-foreground">{evalComp.competency?.description}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-muted-foreground">Auto</p>
                                <p className="font-semibold text-foreground">{evalComp.self_score || '-'}/5</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Líder</p>
                                <p className="font-semibold text-foreground">{evalComp.leader_score || '-'}/5</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Esperado</p>
                                <p className="font-semibold text-primary">{evalComp.expected_level}/5</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  'w-4 h-4',
                                  star <= (evalComp.leader_score || 0)
                                    ? 'fill-warning text-warning'
                                    : 'text-muted'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Development Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-success" />
                        Fortalezas
                      </h3>
                      <ul className="space-y-2">
                        {(evaluation.strengths ? evaluation.strengths.split('\n') : []).map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                            <span className="text-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-warning" />
                        Áreas de Mejora
                      </h3>
                      <ul className="space-y-2">
                        {(evaluation.improvements ? evaluation.improvements.split('\n') : []).map((improvement, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Target className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                            <span className="text-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-xl border border-border/50 shadow-card p-12 text-center">
                  <Award className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No hay evaluaciones activas</h3>
                  <p className="text-muted-foreground mb-6">
                    Comienza evaluando el desempeño de tu equipo para ver los resultados aquí.
                  </p>
                  <Button
                    className="gradient-primary border-0 gap-2"
                    onClick={() => handleStartEvaluation('self')}
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Primera Evaluación
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <EvaluationFormDialog
          open={isEvaluationOpen}
          onOpenChange={setIsEvaluationOpen}
          userId={selectedEmployee.id}
          cycleId={selectedEvaluation?.cycle_id}
          evaluation={selectedEvaluation}
          onSuccess={loadEvaluations}
        />

        <PDIFormDialog
          open={isPDIOpen}
          onOpenChange={setIsPDIOpen}
          employeeName={selectedEmployee.full_name}
          employeeId={selectedEmployee.id}
          onSuccess={() => {
            // Aquí podríamos refrescar PDIs si fuera necesario
          }}
        />
      </AppLayout>
    </>
  );
};
