"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

export function DashboardCharts() {
  // Mock data for charts
  const statusData = [
    { name: "Ranqueado", value: 24, fill: "#7CB342" },
    { name: "Aprovação", value: 12, fill: "#66BB6A" },
    { name: "Execução", value: 18, fill: "#5C6BC0" },
    { name: "Validação", value: 7, fill: "#B0BEC5" },
    { name: "Concluída", value: 42, fill: "#BDBDBD" },
  ]

  const areaData = [
    { name: "Tecnologia", value: 35, fill: "#04A4A1" },
    { name: "Engenharia", value: 28, fill: "#FF7100" },
    { name: "PMO", value: 22, fill: "#606062" },
    { name: "CX", value: 18, fill: "#8B8D90" },
  ]

  const moduleData = [
    { name: "PGDI - Config", value: 15, fill: "#04A4A1" },
    { name: "Dashboard", value: 12, fill: "#FF7100" },
    { name: "Relatório", value: 10, fill: "#606062" },
    { name: "PAP", value: 8, fill: "#8B8D90" },
    { name: "Ocorrências", value: 7, fill: "#7CB342" },
    { name: "Outros", value: 11, fill: "#5C6BC0" },
  ]

  const clientData = [
    { name: "Interno", Incremental: 12, Melhoria: 8, Bug: 5 },
    { name: "Raízen", Incremental: 15, Melhoria: 6, Bug: 3 },
    { name: "Cliente A", Incremental: 8, Melhoria: 4, Bug: 2 },
    { name: "Cliente B", Incremental: 6, Melhoria: 3, Bug: 1 },
  ]

  const CustomTooltip = ({ active, payload, label, showTotal = false }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + (typeof entry.value === "number" ? entry.value : Number(entry.value) || 0),
        0
      )
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">
            {label}
            {showTotal && typeof total === "number" ? ` - Total: ${total}` : ""}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name && entry.name !== "value" ? `${entry.name}: ${entry.value}` : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Demandas por Status</CardTitle>
          <CardDescription>Distribuição atual das demandas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Area Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Demandas por Área Relatora</CardTitle>
          <CardDescription>Distribuição por área responsável</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={areaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {areaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {areaData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-sm text-slate-600">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Demandas por Módulo</CardTitle>
          <CardDescription>Top módulos com mais demandas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {moduleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Demandas por Cliente</CardTitle>
          <CardDescription>Tipos de demanda por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip showTotal />} />
              <Legend />
              <Bar dataKey="Incremental" stackId="a" fill="#04A4A1" />
              <Bar dataKey="Melhoria" stackId="a" fill="#FF7100" />
              <Bar dataKey="Bug" stackId="a" fill="#606062" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
