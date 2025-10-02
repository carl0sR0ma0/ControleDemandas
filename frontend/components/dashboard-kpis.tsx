"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useDashboardCards } from "@/hooks/useDashboard";

export function DashboardKPIs() {
  const { data, isLoading } = useDashboardCards();

  const kpis = [
    {
      title: "Demandas Abertas",
      key: "abertas",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Em Execução",
      key: "emExecucao",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Em Validação",
      key: "emValidacao",
      icon: CheckCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Concluídas no Mês",
      key: "concluidasNoMes",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "SLA Médio (dias)",
      key: "slaMedioDias",
      icon: Calendar,
      color: "text-[#04A4A1]",
      bgColor: "bg-teal-50",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const value =
          isLoading || !data ? "—" : String((data as any)[kpi.key] ?? "—");
        return (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              {/* se quiser manter o "vs mês anterior", pode calcular depois */}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
