import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  User,
  Target,
  Clock,
  TrendingUp,
  MoreVertical,
  Mail,
  Building2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMemberFormDialog } from "@/components/forms/TeamMemberFormDialog";
import { PDIFormDialog } from "@/components/forms/PDIFormDialog";
import { usersApi } from "@/lib/api";
import { useToast } from "@/hooks/UseToast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

const getProgressColor = (progress) => {
  if (progress >= 75) return "text-success";
  if (progress >= 50) return "text-primary";
  if (progress >= 25) return "text-warning";
  return "text-destructive";
};

const getProgressBg = (progress) => {
  if (progress >= 75) return "bg-success/10";
  if (progress >= 50) return "bg-primary/10";
  if (progress >= 25) return "bg-warning/10";
  return "bg-destructive/10";
};

export const Team = () => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // const [viewMode, setViewMode] = useState("grid");
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [isPDIOpen, setIsPDIOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const loadTeamMembers = async () => {
    try {
      const data = await usersApi.getAll();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros del equipo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleOpenPDI = (member) => {
    setSelectedMember(member);
    setIsPDIOpen(true);
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate team stats
  const teamStats = {
    totalMembers: teamMembers.length,
    avgProgress: teamMembers.length > 0 ? Math.round(
      teamMembers.reduce((acc, m) => acc + (m.avgProgress || 0), 0) /
        teamMembers.length
    ) : 0,
    totalObjectives: teamMembers.reduce(
      (acc, m) => acc + (m.objectivesCount || 0),
      0
    ),
    pendingCheckIns: teamMembers.reduce(
      (acc, m) => acc + (m.pendingCheckIns || 0),
      0
    ),
  };

  return (
    <>
      <AppLayout title="Equipo" subtitle="Gestión y seguimiento del equipo">
        <div className="space-y-6">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teamStats.totalMembers}
                  </p>
                  <p className="text-sm text-muted-foreground">Miembros</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teamStats.avgProgress}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avance promedio
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teamStats.totalObjectives}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Objetivos activos
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {teamStats.pendingCheckIns}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check-ins pendientes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar miembros..."
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
            <Button
              size="sm"
              className="gap-2 gradient-primary border-0"
              onClick={() => setIsMemberFormOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Agregar miembro
            </Button>
          </div>

          {/* Team Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando miembros del equipo...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMembers.map((member, index) => (
              <div
                key={member.id}
                className={cn(
                  "bg-card rounded-xl border border-border/50 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-border cursor-pointer opacity-0 animate-fade-in",
                  `stagger-${Math.min(index + 1, 5)}`
                )}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary-foreground">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded-md transition-colors">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem
                          onClick={() =>
                            handleOpenPDI({ name: member.name, id: member.id })
                          }
                        >
                          Ver/Crear PDI
                        </DropdownMenuItem>
                        <DropdownMenuItem>Asignar objetivo</DropdownMenuItem>
                        <DropdownMenuItem>Ver evaluaciones</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Department Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="w-3 h-3" />
                      {member.department}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Avance promedio
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          getProgressColor(member.avgProgress)
                        )}
                      >
                        {member.avgProgress}%
                      </span>
                    </div>
                    <Progress value={member.avgProgress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={cn(
                        "p-3 rounded-lg",
                        getProgressBg(member.avgProgress)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Target
                          className={cn(
                            "w-4 h-4",
                            getProgressColor(member.avgProgress)
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {member.objectivesCount}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Objetivos
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-lg",
                        member.pendingCheckIns > 0
                          ? "bg-warning/10"
                          : "bg-success/10"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Clock
                          className={cn(
                            "w-4 h-4",
                            member.pendingCheckIns > 0
                              ? "text-warning"
                              : "text-success"
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {member.pendingCheckIns}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pendientes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4" />
                    Contactar
                  </button>
                  <button className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                    Ver perfil
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {filteredMembers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">
                No se encontraron miembros
              </h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>

        <TeamMemberFormDialog
          open={isMemberFormOpen}
          onOpenChange={setIsMemberFormOpen}
          onSuccess={loadTeamMembers}
        />

        {selectedMember && (
          <PDIFormDialog
            open={isPDIOpen}
            onOpenChange={setIsPDIOpen}
            employeeName={selectedMember.name}
            employeeId={selectedMember.id}
            onSuccess={() => {
              // Aquí podríamos refrescar PDIs si fuera necesario
            }}
          />
        )}
      </AppLayout>
    </>
  );
};
