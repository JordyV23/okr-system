import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart";
import { mockMetrics, departmentProgress } from "@/data/mockData";
import {
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Target,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const statusDistribution = [
  { name: "En línea", value: 30, color: "hsl(142, 76%, 36%)" },
  { name: "En riesgo", value: 5, color: "hsl(38, 92%, 50%)" },
  { name: "Retrasado", value: 3, color: "hsl(0, 84%, 60%)" },
  { name: "Completado", value: 18, color: "hsl(239, 84%, 67%)" },
];

const reportTypes = [
  {
    title: "Alineación Estratégica",
    description: "Mapa de cascada de objetivos",
    icon: Target,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Desempeño por Equipo",
    description: "Métricas comparativas por área",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: "Tendencias Temporales",
    description: "Evolución mes a mes",
    icon: TrendingUp,
    color: "bg-info/10 text-info",
  },
  {
    title: "Matriz 9-Box",
    description: "Desempeño vs Potencial",
    icon: BarChart3,
    color: "bg-warning/10 text-warning",
  },
];

export const Reports = () => {
  return (
    <>
      <AppLayout title="Reportes" subtitle="Analytics y métricas del sistema">
        <div className="space-y-6">
          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Descargar Dataset
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
              <p className="text-3xl font-bold text-foreground">
                {mockMetrics.totalObjectives}
              </p>
              <p className="text-sm text-muted-foreground">Total Objetivos</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
              <p className="text-3xl font-bold text-success">
                {mockMetrics.onTrackPercentage}%
              </p>
              <p className="text-sm text-muted-foreground">En Línea</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
              <p className="text-3xl font-bold text-primary">
                {mockMetrics.avgProgress}%
              </p>
              <p className="text-sm text-muted-foreground">Avance Promedio</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
              <p className="text-3xl font-bold text-warning">
                {mockMetrics.atRiskCount}
              </p>
              <p className="text-sm text-muted-foreground">En Riesgo</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Over Time */}
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Progreso Mensual
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Evolución del avance en el ciclo
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>H2 2024</span>
                </div>
              </div>
              <ProgressChart />
            </div>

            {/* Status Distribution */}
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Distribución por Estado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Objetivos por estado actual
                  </p>
                </div>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 91%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value} objetivos`, ""]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm text-foreground">{value}</span>
                      )}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Progress */}
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  Avance por Departamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comparativa de progreso entre áreas
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <DepartmentChart />
          </div>

          {/* Report Types Grid */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Reportes Disponibles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((report, index) => (
                <button
                  key={report.title}
                  className={cn(
                    "bg-card rounded-xl p-5 border border-border/50 shadow-card text-left transition-all duration-300 hover:shadow-card-hover hover:border-border opacity-0 animate-fade-in",
                    `stagger-${index + 1}`
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                      report.color
                    )}
                  >
                    <report.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {report.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Department Details Table */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Detalle por Departamento
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-5 py-3 text-sm font-medium text-muted-foreground">
                      Departamento
                    </th>
                    <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">
                      Objetivos
                    </th>
                    <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">
                      Avance
                    </th>
                    <th className="text-center px-5 py-3 text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {departmentProgress.map((dept) => (
                    <tr
                      key={dept.name}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-foreground">
                          {dept.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-foreground">
                          {dept.objectives}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all",
                                dept.progress >= 75
                                  ? "bg-success"
                                  : dept.progress >= 50
                                  ? "bg-primary"
                                  : dept.progress >= 25
                                  ? "bg-warning"
                                  : "bg-destructive"
                              )}
                              style={{ width: `${dept.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground w-10">
                            {dept.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            dept.progress >= 75
                              ? "bg-success/10 text-success"
                              : dept.progress >= 50
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {dept.progress >= 75
                            ? "En línea"
                            : dept.progress >= 50
                            ? "Normal"
                            : "En riesgo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};
