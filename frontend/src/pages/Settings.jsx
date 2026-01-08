import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompetencyFormDialog } from '@/components/forms/CompetencyFormDialog';
import { competenciesApi, cyclesApi, settingsApi } from '@/lib/api';

const evaluationScales = [
  { value: '1-5', label: '1 a 5' },
  { value: '1-10', label: '1 a 10' },
  { value: 'letters', label: 'A, B, C, D, E' },
  { value: 'descriptive', label: 'No cumple - Supera' },
];

export const Settings = () => {
  const [competencies, setCompetencies] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [settings, setSettings] = useState({
    evaluation_scale_objectives: '1-5',
    evaluation_scale_competencies: '1-5',
    weight_objectives: 70,
    weight_competencies: 30,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    emailCheckIn: true,
    emailDeadline: true,
    emailEvaluation: true,
    inAppCheckIn: true,
    inAppMentions: true,
  });
  const [isCompetencyFormOpen, setIsCompetencyFormOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState(undefined);

  const handleEditCompetency = (comp) => {
    setEditingCompetency({
      ...comp,
      id: comp.id.toString(),
    });
    setIsCompetencyFormOpen(true);
  };

  const handleDeleteCompetency = async (comp) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la competencia "${comp.name}"?`)) {
      return;
    }
    
    try {
      await competenciesApi.delete(comp.id);
      // Recargar competencias
      const competenciesData = await competenciesApi.getAll();
      setCompetencies(competenciesData);
    } catch (error) {
      console.error('Error deleting competency:', error);
    }
  };

  const handleNewCompetency = () => {
    setEditingCompetency(undefined);
    setIsCompetencyFormOpen(true);
  };

  const handleCompetencySuccess = async () => {
    try {
      const competenciesData = await competenciesApi.getAll();
      setCompetencies(competenciesData);
    } catch (error) {
      console.error('Error reloading competencies:', error);
    }
  };

  const handleSaveCycle = async () => {
    if (!currentCycle) return;
    
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
      const activeCycle = cyclesData.find(cycle => cycle.is_active);
      setCurrentCycle(activeCycle || cyclesData[0]);
    } catch (error) {
      console.error('Error saving cycle:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updatedSettings = await settingsApi.update(settings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      // Maybe show a toast or alert
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [competenciesData, cyclesData] = await Promise.all([
          competenciesApi.getAll(),
          cyclesApi.getAll()
        ]);
        setCompetencies(competenciesData);
        setCycles(cyclesData);
        
        // Find active cycle
        const activeCycle = cyclesData.find(cycle => cycle.is_active);
        setCurrentCycle(activeCycle || cyclesData[0]);
      } catch (error) {
        console.error('Error loading cycles and competencies data:', error);
      }

      // Load settings separately
      try {
        const settingsData = await settingsApi.get();
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading settings data:', error);
        // Keep default settings
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <AppLayout title="Configuración" subtitle="Administración del sistema OKR">
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
            {/* <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
            </TabsTrigger> */}
            {/* <TabsTrigger value="permissions" className="gap-2">
              <Shield className="w-4 h-4" />
              Permisos
            </TabsTrigger> */}
          </TabsList>

          {/* Cycles Configuration */}
          <TabsContent value="cycles" className="space-y-6">
            <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Ciclo Actual</h3>
              {loading ? (
                <p>Cargando...</p>
              ) : currentCycle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del ciclo</Label>
                    <Input 
                      value={currentCycle.name || ''} 
                      onChange={(e) => setCurrentCycle({...currentCycle, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de ciclo</Label>
                    <Select 
                      value={currentCycle.name?.includes('Q') ? 'quarter' : 'semester'} 
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
                      value={currentCycle.start_date || ''} 
                      onChange={(e) => setCurrentCycle({...currentCycle, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de fin</Label>
                    <Input 
                      type="date" 
                      value={currentCycle.end_date || ''} 
                      onChange={(e) => setCurrentCycle({...currentCycle, end_date: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <p>No hay ciclo activo</p>
              )}
            </div>
{/* 
            <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Frecuencia de Check-ins</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Frecuencia predeterminada</p>
                    <p className="text-sm text-muted-foreground">Cada cuánto se solicitan actualizaciones</p>
                  </div>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quincenal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Recordatorios automáticos</p>
                    <p className="text-sm text-muted-foreground">Enviar recordatorios si no hay check-in</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div> */}

            <Button className="gap-2 gradient-primary border-0" onClick={handleSaveCycle}>
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
          </TabsContent>

          {/* Competencies Configuration */}
          <TabsContent value="competencies" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Catálogo de Competencias</h3>
                <p className="text-sm text-muted-foreground">Define las competencias organizacionales</p>
              </div>
              <Button size="sm" className="gap-2 gradient-primary border-0" onClick={handleNewCompetency}>
                <Plus className="w-4 h-4" />
                Nueva competencia
              </Button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando competencias...</p>
                </div>
              ) : competencies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay competencias configuradas</p>
                </div>
              ) : (
                competencies.map((comp, index) => (
                <div
                  key={comp.id}
                  className={cn(
                    'bg-card rounded-xl border border-border/50 shadow-card p-4 flex items-center justify-between opacity-0 animate-fade-in',
                    `stagger-${Math.min(index + 1, 5)}`
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{comp.name}</h4>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{comp.levels} niveles</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEditCompetency(comp)}>
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
              <h3 className="font-semibold text-foreground mb-4">Escalas de Evaluación</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Escala para objetivos</Label>
                  <Select 
                    value={settings.evaluation_scale_objectives} 
                    onValueChange={(value) => setSettings({...settings, evaluation_scale_objectives: value})}
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
                    onValueChange={(value) => setSettings({...settings, evaluation_scale_competencies: value})}
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
              <h3 className="font-semibold text-foreground mb-4">Ponderaciones</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Peso de Objetivos</p>
                    <p className="text-sm text-muted-foreground">En la calificación final</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={settings.weight_objectives} 
                      onChange={(e) => setSettings({...settings, weight_objectives: parseInt(e.target.value)})}
                      className="w-20 text-center" 
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Peso de Competencias</p>
                    <p className="text-sm text-muted-foreground">En la calificación final</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={settings.weight_competencies} 
                      onChange={(e) => setSettings({...settings, weight_competencies: parseInt(e.target.value)})}
                      className="w-20 text-center" 
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>

            <Button className="gap-2 gradient-primary border-0" onClick={handleSaveSettings}>
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
          </TabsContent>

          {/* Notifications Configuration */}
          {/* <TabsContent value="notifications" className="space-y-6">
            <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Notificaciones por Email</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Check-ins pendientes</p>
                    <p className="text-sm text-muted-foreground">Recordatorio cuando hay check-ins vencidos</p>
                  </div>
                  <Switch
                    checked={notifications.emailCheckIn}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailCheckIn: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Fechas límite</p>
                    <p className="text-sm text-muted-foreground">Aviso 7 días antes del cierre</p>
                  </div>
                  <Switch
                    checked={notifications.emailDeadline}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailDeadline: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Evaluaciones</p>
                    <p className="text-sm text-muted-foreground">Notificar inicio del período de evaluación</p>
                  </div>
                  <Switch
                    checked={notifications.emailEvaluation}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailEvaluation: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Notificaciones In-App</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Check-ins del equipo</p>
                    <p className="text-sm text-muted-foreground">Ver actualizaciones de tu equipo</p>
                  </div>
                  <Switch
                    checked={notifications.inAppCheckIn}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, inAppCheckIn: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Menciones</p>
                    <p className="text-sm text-muted-foreground">Cuando te mencionan en comentarios</p>
                  </div>
                  <Switch
                    checked={notifications.inAppMentions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, inAppMentions: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Button className="gap-2 gradient-primary border-0">
              <Save className="w-4 h-4" />
              Guardar preferencias
            </Button>
          </TabsContent> */}

          {/* Permissions Configuration */}
          {/* <TabsContent value="permissions" className="space-y-6">
            <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">Matriz de Permisos</h3>
                <p className="text-sm text-muted-foreground">Configurar accesos por rol</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">Rol</th>
                      <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">Ver Objetivos</th>
                      <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">Crear Objetivos</th>
                      <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">Evaluar</th>
                      <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">Reportes</th>
                      <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">Configuración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {['Administrador', 'RRHH', 'Gerente', 'Líder', 'Colaborador'].map((role) => (
                      <tr key={role} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-foreground">{role}</td>
                        <td className="px-5 py-4 text-center"><Switch defaultChecked /></td>
                        <td className="px-5 py-4 text-center"><Switch defaultChecked={role !== 'Colaborador'} /></td>
                        <td className="px-5 py-4 text-center"><Switch defaultChecked={role !== 'Colaborador'} /></td>
                        <td className="px-5 py-4 text-center"><Switch defaultChecked={['Administrador', 'RRHH', 'Gerente'].includes(role)} /></td>
                        <td className="px-5 py-4 text-center"><Switch defaultChecked={['Administrador', 'RRHH'].includes(role)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}

            {/* <Button className="gap-2 gradient-primary border-0">
              <Save className="w-4 h-4" />
              Guardar permisos
            </Button>
          </TabsContent> */}
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
  )
}
