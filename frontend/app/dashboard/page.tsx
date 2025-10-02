// src/app/dashboard/page.tsx
"use client";
import { PERMS, useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardKPIs } from "@/components/dashboard-kpis";
import { DashboardCharts } from "@/components/dashboard-charts";
import { RecentDemands } from "@/components/recent-demands";

export default function DashboardPage() {
  useAuthGuard(PERMS.AcessarDashboard);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">Visão geral das demandas do sistema</p>
      </div>
      <DashboardKPIs />
      <DashboardCharts />
      <RecentDemands />
    </div>
  );
}
