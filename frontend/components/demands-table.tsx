"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { colorByStatus } from "@/theme/statusColors";
import { useDemandList } from "@/hooks/useDemands";

export function DemandsTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading } = useDemandList({ page, size, q: searchTerm || undefined });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const onRowDoubleClick = (protocol: string) => {
    router.push(`/demandas/${protocol}`);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Todas as Demandas</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por protocolo, descrição, responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
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
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Classificação</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={7}>Carregando...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={7}>Nenhuma demanda encontrada.</td>
                </tr>
              ) : (
                items.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onDoubleClick={() => onRowDoubleClick(d.protocol)}
                  >
                    <td className="py-3 px-2 font-medium text-[#04A4A1]">{d.protocol}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{new Date(d.openedAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{d.module}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{d.reporterArea}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{d.requester || "—"}</td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary">{d.classification}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={colorByStatus(d.status)}>{d.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">Total: {total}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm text-slate-600">Página {page}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => (items.length < size ? p : p + 1))}
              disabled={items.length < size}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

