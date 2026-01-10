
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { User, Mail, Building2, Briefcase } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useToast } from '@/hooks/UseToast';

const roles = [
  'Colaborador',
  'Analista',
  'Analista Senior',
  'Especialista',
  'Coordinador',
  'Líder de Equipo',
  'Gerente',
  'Director',
];

export const TeamMemberFormDialog = ({ open, onOpenChange, member, onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    full_name: member?.full_name || '',
    email: member?.email || '',
    role: member?.role || '',
    department_id: member?.department_id || '',
    manager_id: member?.manager_id || '',
    department: member?.department || '',
    is_active: true,
  });

  // Memoized handlers for better performance
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Load departments and managers when dialog opens
  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [departmentsData, managersData] = await Promise.all([
        usersApi.getDepartments(),
        usersApi.getManagers()
      ]);
      setDepartments(departmentsData);
      setManagers(managersData);
      console.log('📊 Departments loaded:', departmentsData);
      console.log('👥 Managers loaded:', managersData);
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las opciones del formulario.",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        // Ensure we send the correct field names
        name: formData.full_name,
        department: departments.find(d => d.id === formData.department_id)?.name || ''
      };

      console.log('📤 Submitting data:', submitData);

      if (member) {
        await usersApi.update(member.id, submitData);
        toast({
          title: "Colaborador actualizado",
          description: "La información del colaborador se ha actualizado correctamente.",
        });
      } else {
        await usersApi.create(submitData);
        toast({
          title: "Colaborador creado",
          description: "El nuevo colaborador se ha agregado correctamente.",
        });
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información del colaborador. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {member ? 'Editar Colaborador' : 'Nuevo Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {member
              ? 'Actualiza la información del colaborador'
              : 'Agrega un nuevo miembro al equipo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Ej: María García López"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="maria.garcia@empresa.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department_id">Departamento *</Label>
              <Select
                value={formData.department_id}
                onValueChange={(value) => handleInputChange('department_id', value)}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOptions ? "Cargando..." : "Selecciona departamento"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Puesto *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona puesto" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="manager_id">Líder directo</Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value) => handleInputChange('manager_id', value)}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOptions ? "Cargando..." : "Selecciona líder"} />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.role}
                      {manager.department && ` (${manager.department})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary border-0" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (member ? 'Guardar cambios' : 'Agregar colaborador')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
