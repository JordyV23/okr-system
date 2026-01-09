import { useState, useEffect } from 'react';
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
import { Scale, Plus, Trash2 } from 'lucide-react';
import { competenciesApi } from '@/lib/api';
import { useToast } from '@/hooks/UseToast';
import Swal from 'sweetalert2';


const defaultLevelDescriptions = [
  { level: 1, description: 'No demuestra la competencia' },
  { level: 2, description: 'Nivel básico, requiere supervisión' },
  { level: 3, description: 'Competente, trabaja de forma independiente' },
  { level: 4, description: 'Avanzado, puede enseñar a otros' },
  { level: 5, description: 'Referente, lidera iniciativas' },
];

export const CompetencyFormDialog = ({ open, onOpenChange, competency, onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Convertir level_descriptions de dict a array cuando se edita
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

  // Reset form data when competency changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: competency?.name || '',
        description: competency?.description || '',
        levels: competency?.levels || 5,
        category: competency?.category || 'core',
      });
      
      setLevelDescriptions(getLevelDescriptionsArray());
    }
  }, [competency, open]);

  const updateLevelDescription = (level, description) => {
    setLevelDescriptions(
      levelDescriptions.map((ld) =>
        ld.level === level ? { ...ld, description } : ld
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert levelDescriptions array to dict for API
      const level_descriptions = {};
      levelDescriptions.forEach(ld => {
        level_descriptions[ld.level.toString()] = ld.description;
      });
      
      const data = { 
        ...formData, 
        level_descriptions
      };
      
      if (competency) {
        await competenciesApi.update(competency.id, data);
        toast({
          title: "Competencia actualizada",
          description: "La competencia se ha actualizado correctamente.",
        });
      } else {
        await competenciesApi.create(data);
        toast({
          title: "Competencia creada",
          description: "La competencia se ha creado correctamente.",
        });
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving competency:', error);
      
      let errorMessage = "No se pudo guardar la competencia. Inténtalo de nuevo.";
      
      // Extract detailed error message if available
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
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
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
        
        // Extract detailed error message if available
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            {competency ? 'Editar Competencia' : 'Nueva Competencia'}
          </DialogTitle>
          <DialogDescription>
            Define una competencia organizacional con sus niveles de evaluación
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la competencia *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Liderazgo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe qué comportamientos o habilidades incluye esta competencia..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="levels">Número de niveles</Label>
                <Select
                  value={formData.levels.toString()}
                  onValueChange={(value) => {
                    const newLevels = parseInt(value);
                    setFormData({ ...formData, levels: newLevels });
                    
                    // Adjust level descriptions if needed
                    if (newLevels > levelDescriptions.length) {
                      // Add more levels with default descriptions
                      const additionalLevels = defaultLevelDescriptions
                        .slice(levelDescriptions.length, newLevels)
                        .map(ld => ({ ...ld, level: newLevels - (newLevels - levelDescriptions.length - 1) }));
                      setLevelDescriptions([...levelDescriptions, ...additionalLevels]);
                    } else {
                      // Remove extra levels
                      setLevelDescriptions(levelDescriptions.slice(0, newLevels));
                    }
                  }}
                >
                  <SelectTrigger>
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

          {/* Level Descriptions */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Descripción de niveles</h4>
              <p className="text-sm text-muted-foreground">
                Define qué significa cada nivel de la escala
              </p>
            </div>

            <div className="space-y-3">
              {levelDescriptions.slice(0, formData.levels).map((ld) => (
                <div key={`level-${ld.level}`} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{ld.level}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Nivel {ld.level}</Label>
                    <Input
                      value={ld.description}
                      onChange={(e) => updateLevelDescription(ld.level, e.target.value)}
                      placeholder={`Descripción del nivel ${ld.level}...`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applicable Roles */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Roles aplicables</h4>
              <p className="text-sm text-muted-foreground">
                Define el nivel esperado por tipo de rol
              </p>
            </div>

            <div className="space-y-2">
              {['Colaborador', 'Líder de equipo', 'Gerente', 'Director'].map((role, index) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground">{role}</span>
                  <Select defaultValue={(index + 2).toString()}>
                    <SelectTrigger className="w-32">
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

          <DialogFooter className="gap-2 sm:gap-0 flex items-center justify-between">
            <div>
              {competency && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              )}
            </div>
            <div className="gap-2 sm:gap-0 flex">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary border-0" disabled={isLoading}>
                {isLoading ? 'Guardando...' : (competency ? 'Guardar cambios' : 'Crear competencia')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
