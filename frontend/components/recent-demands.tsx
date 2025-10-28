"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { colorByStatus } from "@/theme/statusColors";
import { useDemandList } from "@/hooks/useDemands";

export function RecentDemands() {
  const router = useRouter();
  const { data, isLoading } = useDemandList({ page: 1, size: 8 });
  const items = data?.items ?? [];

  const open = (protocol: string) => router.push(`/demandas/${protocol}`);

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
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Módulo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Área</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Solicitante</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="py-6 text-center text-slate-500" colSpan={6}>Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-6 text-center text-slate-500" colSpan={6}>Sem registros.</td></tr>
              ) : (
                items.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onDoubleClick={() => open(d.protocol)}>
                    <td className="py-3 px-2 font-medium text-[#04A4A1]">{d.protocol}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{new Date(d.openedAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{d.module}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{d.reporterArea}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{d.requester || "—"}</td>
                    <td className="py-3 px-2"><Badge className={colorByStatus(d.status)}>{d.status}</Badge></td>
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

