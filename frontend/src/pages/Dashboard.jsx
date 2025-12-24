import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart";
import { ObjectivesList } from "@/components/dashboard/ObjectivesList";
import { RecentCheckIns } from "@/components/dashboard/RecentCheckIns";
import { mockMetrics, mockCycle } from "@/data/mockData";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  return (
    <>
      <AppLayout
        title="Dashboard"
        subtitle="Resumen ejecutivo del ciclo actual"
      >
        <div className="space-y-6">
          {/* Cycle Progress Header */}
          <div className="gradient-primary rounded-2xl p-6 text-primary-foreground shadow-glow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <ProgressRing
                  progress={mockCycle.progress}
                  size={100}
                  strokeWidth={8}
                  labelClassName="text-primary-foreground"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 opacity-80" />
                    <span className="text-sm opacity-80">Ciclo Actual</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{mockCycle.name}</h2>
                  <p className="text-sm opacity-80">
                    {mockCycle.daysRemaining} días restantes • Finaliza el 31 de
                    diciembre
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver tendencias
                </Button>
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Target className="w-4 h-4 mr-2" />
                  Nuevo objetivo
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Objetivos"
              value={mockMetrics.totalObjectives}
              subtitle={`${mockMetrics.completedObjectives} completados`}
              icon={Target}
              trend="up"
              trendValue="+12% vs ciclo anterior"
              iconClassName="bg-primary/10 text-primary"
            />
            <MetricCard
              title="Avance Promedio"
              value={`${mockMetrics.avgProgress}%`}
              subtitle="Ponderado por peso"
              icon={TrendingUp}
              trend="up"
              trendValue="+5%"
              iconClassName="bg-success/10 text-success"
            />
            <MetricCard
              title="Objetivos en Riesgo"
              value={mockMetrics.atRiskCount}
              subtitle="Requieren atención"
              icon={AlertTriangle}
              trend="down"
              trendValue="-2 vs mes anterior"
              iconClassName="bg-warning/10 text-warning"
            />
            <MetricCard
              title="Check-ins Pendientes"
              value={mockMetrics.pendingCheckIns}
              subtitle="Esta semana"
              icon={Clock}
              iconClassName="bg-info/10 text-info"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Progreso Mensual
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Evolución del ciclo actual
                  </p>
                </div>
              </div>
              <ProgressChart />
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Avance por Departamento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comparativa de áreas
                  </p>
                </div>
              </div>
              <DepartmentChart />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Objectives List */}
            <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Objetivos Principales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Seguimiento de objetivos estratégicos
                  </p>
                </div>
                <Link to="/objectives">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todos
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <ObjectivesList />
            </div>

            {/* Recent Check-ins */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Check-ins Recientes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Últimas actualizaciones
                  </p>
                </div>
                <Link to="/checkins">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todos
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <RecentCheckIns />
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};
