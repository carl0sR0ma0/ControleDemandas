"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "recharts";
import {
  useDemandasPorStatus,
  useDemandasPorArea,
  useDemandasPorModulo,
  useDemandasPorCliente,
} from "@/hooks/useDashboard";

export function DashboardCharts() {
  const { data: byStatus } = useDemandasPorStatus();
  const { data: byArea } = useDemandasPorArea();
  const { data: byModulo } = useDemandasPorModulo();
  const { data: byCliente } = useDemandasPorCliente();

  // mapear para o formato do seu chart
  const statusData = (byStatus ?? []).map((s) => ({
    name: String(s.status),
    value: s.qtde,
    fill: "#04A4A1",
  }));

  const areaData = (byArea ?? []).map((a) => ({
    name: a.area ?? "—",
    value: a.qtde,
    fill: "#FF7100",
  }));

  const moduleData = (byModulo ?? []).map((m) => ({
    name: m.modulo ?? "—",
    value: m.qtde,
    fill: "#606062",
  }));

  // para cliente, o endpoint retorna só contagem por cliente;
  // se quiser empilhar por tipo (Incremental/Melhoria/Bug), fazemos depois
  const clientData = (byCliente ?? []).map((c) => ({
    name: c.cliente ?? "—",
    Total: c.qtde,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
    showTotal = false,
  }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + (Number(entry.value) || 0),
        0
      );
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">
            {label}
            {showTotal ? ` - Total: ${total}` : ""}
          </p>
          {payload.map((e: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: e.color }}>
              {e.name && e.name !== "value" ? `${e.name}: ${e.value}` : e.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* por Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Demandas por Status
          </CardTitle>
          <CardDescription>Distribuição atual das demandas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statusData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
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

      {/* por Área */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Demandas por Área Relatora
          </CardTitle>
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
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-slate-600">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* por Módulo */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Demandas por Módulo
          </CardTitle>
          <CardDescription>Top módulos com mais demandas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={moduleData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={90}
              />
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

      {/* por Cliente (total) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Demandas por Cliente
          </CardTitle>
          <CardDescription>Quantidade por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={clientData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip showTotal />} />
              <Legend />
              <Bar dataKey="Total" fill="#04A4A1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
