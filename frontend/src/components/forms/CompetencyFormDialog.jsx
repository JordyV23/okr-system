import { useState } from 'react';
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


const defaultLevelDescriptions = [
  { level: 1, description: 'No demuestra la competencia' },
  { level: 2, description: 'Nivel básico, requiere supervisión' },
  { level: 3, description: 'Competente, trabaja de forma independiente' },
  { level: 4, description: 'Avanzado, puede enseñar a otros' },
  { level: 5, description: 'Referente, lidera iniciativas' },
];

export const CompetencyFormDialog = ({ open, onOpenChange, competency }) => {

      const [formData, setFormData] = useState({
    name: competency?.name || '',
    description: competency?.description || '',
    levels: competency?.levels || 5,
    category: 'core',
  });

  const [levelDescriptions, setLevelDescriptions] = useState(
    competency?.levelDescriptions || defaultLevelDescriptions
  );

  const updateLevelDescription = (level, description) => {
    setLevelDescriptions(
      levelDescriptions.map((ld) =>
        ld.level === level ? { ...ld, description } : ld
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...formData, levelDescriptions });
    onOpenChange(false);
  };

    return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  onValueChange={(value) => setFormData({ ...formData, levels: parseInt(value) })}
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
                <div key={ld.level} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary border-0">
              {competency ? 'Guardar cambios' : 'Crear competencia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
