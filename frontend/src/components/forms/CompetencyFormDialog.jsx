import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Scale, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { competenciesApi } from '@/lib/api';
import Swal from 'sweetalert2';

const defaultLevelDescriptions = [
  { level: 1, description: 'No demuestra la competencia' },
  { level: 2, description: 'Nivel básico, requiere supervisión' },
  { level: 3, description: 'Competente, trabaja de forma independiente' },
  { level: 4, description: 'Avanzado, puede enseñar a otros' },
  { level: 5, description: 'Referente, lidera iniciativas' },
];

// Subcomponente: Información básica
const BasicInfoStep = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-3 max-w-2xl mx-auto">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Nombre de la competencia *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Ej: Liderazgo"
            required
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe qué comportamientos o habilidades incluye esta competencia..."
            rows={4}
            className="resize-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onInputChange('category', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core / Fundamental</SelectItem>
                <SelectItem value="leadership">Liderazgo</SelectItem>
                <SelectItem value="technical">Técnica</SelectItem>
                <SelectItem value="functional">Funcional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="levels" className="text-sm font-medium">Número de niveles</Label>
            <Select
              value={formData.levels.toString()}
              onValueChange={(value) => onInputChange('levels', parseInt(value))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 niveles</SelectItem>
                <SelectItem value="4">4 niveles</SelectItem>
                <SelectItem value="5">5 niveles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponente: Descripciones de niveles
const LevelDescriptionsStep = ({ formData, levelDescriptions, onUpdateLevel }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="text-center mb-3">
        <h4 className="font-medium text-foreground text-sm">Descripción de niveles</h4>
        <p className="text-xs text-muted-foreground">
          Define qué significa cada nivel de la escala de evaluación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
        {levelDescriptions.slice(0, formData.levels).map((ld) => (
          <div key={`level-${ld.level}`} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{ld.level}</span>
              </div>
              <Label className="text-xs font-medium">Nivel {ld.level}</Label>
            </div>
            <Textarea
              value={ld.description}
              onChange={(e) => onUpdateLevel(ld.level, e.target.value)}
              placeholder={`Descripción del nivel ${ld.level}...`}
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Subcomponente: Roles aplicables
const RolesStep = ({ formData, roleExpectations, onRoleChange }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="text-center mb-3">
        <h4 className="font-medium text-foreground text-sm">Roles aplicables</h4>
        <p className="text-xs text-muted-foreground">
          Define el nivel esperado de esta competencia para cada tipo de rol
        </p>
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        {['Colaborador', 'Líder', 'Gerente', 'Director'].map((role, index) => (
          <div
            key={role}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
          >
            <span className="text-sm font-medium text-foreground">{role}</span>
            <Select 
              value={roleExpectations[role]?.toString() || (index + 2).toString()}
              onValueChange={(value) => onRoleChange(role, parseInt(value))}
            >
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: formData.levels }, (_, i) => i + 1).map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Nivel {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};

// Subcomponente: Resumen
const SummaryStep = ({ formData, levelDescriptions, roleExpectations }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="text-center mb-3">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <h4 className="font-medium text-foreground text-sm">Resumen de la competencia</h4>
        <p className="text-xs text-muted-foreground">
          Revisa la información antes de guardar
        </p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Nombre:</span>
            <p className="font-medium">{formData.name || 'Sin nombre'}</p>
          </div>
          {formData.description && (
            <div>
              <span className="text-xs text-muted-foreground">Descripción:</span>
              <p className="text-xs">{formData.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Categoría:</span>
              <p className="text-xs font-medium capitalize">{formData.category}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Niveles:</span>
              <p className="text-xs font-medium">{formData.levels}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground mb-1.5 block">Niveles definidos:</span>
          <div className="space-y-0.5">
            {levelDescriptions.slice(0, formData.levels).map((ld) => (
              <div key={ld.level} className="text-xs">
                <span className="font-medium">Nivel {ld.level}:</span> {ld.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompetencyFormDialog = ({ open, onOpenChange, competency, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [roleExpectations, setRoleExpectations] = useState({
    'Colaborador': 2,
    'Líder': 3,
    'Gerente': 4,
    'Director': 5
  });

  const getLevelDescriptionsArray = () => {
    if (competency?.level_descriptions) {
      return Object.entries(competency.level_descriptions)
        .map(([level, description]) => ({
          level: parseInt(level),
          description: description
        }))
        .sort((a, b) => a.level - b.level);
    }
    return defaultLevelDescriptions.slice(0, competency?.levels || 5);
  };

  const [formData, setFormData] = useState({
    name: competency?.name || '',
    description: competency?.description || '',
    levels: competency?.levels || 5,
    category: competency?.category || 'core',
  });

  const [levelDescriptions, setLevelDescriptions] = useState(
    getLevelDescriptionsArray()
  );

  const steps = [
    { title: 'Información básica', component: BasicInfoStep },
    { title: 'Niveles de evaluación', component: LevelDescriptionsStep },
    { title: 'Roles aplicables', component: RolesStep },
    { title: 'Resumen', component: SummaryStep },
  ];

  const updateLevelDescription = useCallback((level, description) => {
    setLevelDescriptions(prev =>
      prev.map((ld) =>
        ld.level === level ? { ...ld, description } : ld
      )
    );
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si cambia el número de niveles, ajustar las descripciones
      if (field === 'levels') {
        const newLevels = value;
        if (newLevels > levelDescriptions.length) {
          const additionalLevels = [];
          for (let i = levelDescriptions.length + 1; i <= newLevels; i++) {
            additionalLevels.push({
              level: i,
              description: defaultLevelDescriptions[i - 1]?.description || `Descripción nivel ${i}`
            });
          }
          setLevelDescriptions(prev => [...prev, ...additionalLevels]);
        } else {
          setLevelDescriptions(prev => prev.slice(0, newLevels));
        }
      }
      
      return newData;
    });
  }, [levelDescriptions.length]);

  const handleRoleChange = useCallback((role, level) => {
    setRoleExpectations(prev => ({ ...prev, [role]: level }));
  }, []);

  const levelDescriptionsDict = useMemo(() => {
    const dict = {};
    levelDescriptions.forEach(ld => {
      dict[ld.level.toString()] = ld.description;
    });
    return dict;
  }, [levelDescriptions]);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setFormData({
        name: competency?.name || '',
        description: competency?.description || '',
        levels: competency?.levels || 5,
        category: competency?.category || 'core',
      });
      
      setLevelDescriptions(getLevelDescriptionsArray());
    }
  }, [competency, open]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const data = { 
        ...formData, 
        level_descriptions: levelDescriptionsDict,
        role_expectations: roleExpectations
      };
      
      if (competency) {
        await competenciesApi.update(competency.id, data);
        Swal.fire({
          title: '¡Éxito!',
          text: 'La competencia se ha actualizado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await competenciesApi.create(data);
        Swal.fire({
          title: '¡Éxito!',
          text: 'La competencia se ha creado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving competency:', error);
      
      let errorMessage = "No se pudo guardar la competencia. Inténtalo de nuevo.";
      
      if (error.message) {
        if (error.message.includes('Failed to create competency') || error.message.includes('Failed to update competency')) {
          errorMessage = error.message;
        } else if (error.message.includes('detail:')) {
          const match = error.message.match(/detail: (.+)/);
          if (match) {
            errorMessage = match[1];
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!competency) return;
    
    const result = await Swal.fire({
      title: '¿Eliminar competencia?',
      html: `¿Estás seguro de que quieres eliminar la competencia <strong>"${competency.name}"</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await competenciesApi.delete(competency.id);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'La competencia ha sido desactivada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Error deleting competency:', error);
        
        let errorMessage = 'No se pudo eliminar la competencia. Inténtalo de nuevo.';
        
        if (error.message) {
          if (error.message.includes('está siendo utilizada en')) {
            errorMessage = error.message;
          } else if (error.message.includes('detail:')) {
            const match = error.message.match(/detail: (.+)/);
            if (match) {
              errorMessage = match[1];
            }
          } else {
            errorMessage = error.message;
          }
        }
        
        Swal.fire({
          title: 'No se puede eliminar',
          text: errorMessage,
          icon: 'warning',
          confirmButtonColor: '#3b82f6'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-primary" />
            {competency ? 'Editar Competencia' : 'Nueva Competencia'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {steps[currentStep].title}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors ${
                  index === currentStep 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : index < currentStep 
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted bg-muted text-muted-foreground'
                }`}>
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-5 overflow-y-auto" style={{ minHeight: '340px', maxHeight: '340px' }}>
          <CurrentStepComponent
            formData={formData}
            levelDescriptions={levelDescriptions}
            roleExpectations={roleExpectations}
            onInputChange={handleInputChange}
            onUpdateLevel={updateLevelDescription}
            onRoleChange={handleRoleChange}
          />
        </div>

        <DialogFooter className="px-5 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between w-full gap-3">
            <div>
              {competency && currentStep === 0 && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={isLoading}
                  className="gap-2 h-9"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {canGoPrevious && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="gap-2 h-9"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
              )}
              {!isLastStep ? (
                <Button 
                  onClick={handleNext}
                  className="gradient-primary border-0 gap-2 h-9"
                  size="sm"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="gradient-primary border-0 h-9" 
                  disabled={isLoading || !formData.name}
                  size="sm"
                >
                  {isLoading ? 'Guardando...' : (competency ? 'Guardar cambios' : 'Crear competencia')}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
