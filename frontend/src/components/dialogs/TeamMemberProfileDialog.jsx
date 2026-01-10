import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Phone,
  MapPin,
  Award,
  Target,
  Clock,
  User,
  X,
} from 'lucide-react';
import { usersApi } from '@/lib/api';

export const TeamMemberProfileDialog = ({ open, onOpenChange, member }) => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && member?.id) {
      loadMemberDetails();
    }
  }, [open, member?.id]);

  const loadMemberDetails = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getById(member.id);
      setMemberDetails(data);
      console.log('👤 Member details loaded:', data);
    } catch (error) {
      console.error('Error loading member details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewObjectives = () => {
    // Navigate to objectives page filtered by this user
    window.location.href = `/objectives?user=${member.id}`;
  };

  const handleCreateEvaluation = () => {
    // Navigate to evaluations page with pre-selected user
    window.location.href = `/evaluations?user=${member.id}&create=true`;
  };

  const displayMember = memberDetails || member;

  if (!displayMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Perfil del Colaborador
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando información...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header con foto y info básica */}
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-primary-foreground">
                  {(displayMember.full_name || displayMember.name || 'U')
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {displayMember.full_name || displayMember.name}
                </h2>
                <p className="text-lg text-muted-foreground">{displayMember.role}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {displayMember.department?.name || displayMember.department || 'Sin departamento'}
                  </div>
                  {displayMember.manager && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Reporta a: {displayMember.manager?.full_name || displayMember.manager || 'Sin líder'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-muted/50 rounded-lg p-2 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Información de Contacto
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{displayMember.email}</span>
                </div>
                {displayMember.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{displayMember.phone}</span>
                  </div>
                )}
                {displayMember.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{displayMember.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información laboral */}
            <div className="bg-muted/50 rounded-lg p-2 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Información Laboral
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>Departamento:</span>
                  </div>
                  <Badge variant="secondary">
                    {displayMember.department?.name || displayMember.department || 'Sin departamento'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>Puesto:</span>
                  </div>
                  <Badge variant="outline">
                    {displayMember.role}
                  </Badge>
                </div>
                {displayMember.startDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Fecha de ingreso:</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(displayMember.startDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {displayMember.employeeId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>ID Empleado:</span>
                    </div>
                    <span className="text-sm font-medium">
                      {displayMember.employeeId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas de desempeño */}
            <div className="bg-muted/50 rounded-lg p-2 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Métricas de Desempeño
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {displayMember.avgProgress || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Avance promedio</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">
                    {displayMember.objectivesCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Objetivos activos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {displayMember.pendingCheckIns || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Check-ins pendientes</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="gap-2 flex-1"
                onClick={handleViewObjectives}
              >
                <Target className="w-4 h-4" />
                Ver objetivos
              </Button>
              <Button 
                className="gap-2 flex-1 gradient-primary border-0"
                onClick={handleCreateEvaluation}
              >
                <Award className="w-4 h-4" />
                Crear evaluación
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};