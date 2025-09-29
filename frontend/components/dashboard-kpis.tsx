import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react"

export function DashboardKPIs() {
  // Mock data - in real app, fetch from API
  const kpis = [
    {
      title: "Demandas Abertas",
      value: "24",
      change: "+12%",
      changeType: "increase" as const,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Em Execução",
      value: "18",
      change: "+8%",
      changeType: "increase" as const,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Em Validação",
      value: "7",
      change: "-3%",
      changeType: "decrease" as const,
      icon: CheckCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Concluídas no Mês",
      value: "42",
      change: "+15%",
      changeType: "increase" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "SLA Médio (dias)",
      value: "8.5",
      change: "-2.1",
      changeType: "decrease" as const,
      icon: Calendar,
      color: "text-[#04A4A1]",
      bgColor: "bg-teal-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
              <div className="flex items-center text-xs text-slate-600 mt-1">
                <TrendingUp
                  className={`h-3 w-3 mr-1 ${kpi.changeType === "increase" ? "text-green-500" : "text-red-500"}`}
                />
                <span className={kpi.changeType === "increase" ? "text-green-600" : "text-red-600"}>{kpi.change}</span>
                <span className="ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
