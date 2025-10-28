"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDemandList } from "@/hooks/useDemands";
import { OccurrenceType, Classification, DemandStatus } from "@/types/api";

export function RecentDemands() {
  const router = useRouter();
  const { data, isLoading } = useDemandList({ page: 1, size: 8 });
  const items = data?.items ?? [];

  const onRowDoubleClick = (protocol: string) => {
    router.push(`/demandas/${protocol}`);
  };

  const getTypeColor = (type: OccurrenceType) => {
    switch (type) {
      case OccurrenceType.Bug:
        return "bg-red-100 text-red-800";
      case OccurrenceType.Incremental:
        return "bg-blue-100 text-blue-800";
      case OccurrenceType.Melhoria:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClassificationColor = (classification: Classification) => {
    switch (classification) {
      case Classification.Urgente:
        return "bg-red-500 text-white";
      case Classification.Medio:
        return "bg-yellow-500 text-white";
      case Classification.Baixo:
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.Aberta:
        return "bg-[#FFA726] text-white";
      case DemandStatus.Ranqueado:
        return "bg-[#7CB342] text-white";
      case DemandStatus.AguardandoAprovacao:
        return "bg-[#66BB6A] text-white";
      case DemandStatus.Execucao:
        return "bg-[#5C6BC0] text-white";
      case DemandStatus.Validacao:
        return "bg-[#B0BEC5] text-white";
      case DemandStatus.Concluida:
        return "bg-[#BDBDBD] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.Aberta:
        return "Aberta";
      case DemandStatus.Ranqueado:
        return "Ranqueado";
      case DemandStatus.AguardandoAprovacao:
        return "Aprovação";
      case DemandStatus.Execucao:
        return "Execução";
      case DemandStatus.Validacao:
        return "Validação";
      case DemandStatus.Concluida:
        return "Concluída";
      default:
        return status;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Demandas Recentes</CardTitle>
          <Link href="/demandas" className="text-sm text-[#04A4A1] hover:underline">Ver Todas</Link>
        </div>
        <CardDescription>Últimas solicitações registradas no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Protocolo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Data</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Sistema</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Módulo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Tipo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Área</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Solicitante</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Responsável</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Unidade</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Classificação</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={11}>Carregando...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={11}>Sem registros.</td>
                </tr>
              ) : (
                items.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onDoubleClick={() => onRowDoubleClick(d.protocol)}
                  >
                    <td className="py-3 px-2 font-medium text-[#04A4A1]">{String(d.protocol)}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{new Date(d.openedAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {d.systemVersion && typeof d.systemVersion === 'object' && d.systemVersion.version
                        ? String(d.systemVersion.version)
                        : "—"}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {d.module && typeof d.module === 'object' && d.module.name
                        ? String(d.module.name)
                        : "—"}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary" className={getTypeColor(d.occurrenceType)}>
                        {String(d.occurrenceType)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {d.reporterArea && typeof d.reporterArea === 'object' && d.reporterArea.name
                        ? String(d.reporterArea.name)
                        : "—"}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {d.requester && typeof d.requester === 'object' && d.requester.name
                        ? String(d.requester.name)
                        : "—"}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {d.responsible && typeof d.responsible === 'string'
                        ? String(d.responsible)
                        : "—"}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {d.unit && typeof d.unit === 'object' && d.unit.name
                        ? String(d.unit.name)
                        : "—"}
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={getClassificationColor(d.classification)}>
                        {String(d.classification)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusColor(d.status)}>{String(getStatusLabel(d.status))}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

