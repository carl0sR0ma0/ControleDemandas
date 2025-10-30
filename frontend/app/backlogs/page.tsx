"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useAuthGuard, PERMS } from "@/hooks/useAuthGuard";
import { listBacklogs } from "@/lib/api/backlogs";
import type { BacklogSummary } from "@/types/api";

export default function BacklogsPage() {
  useAuthGuard(PERMS.VisualizarDemandas);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["backlogs"],
    queryFn: () => listBacklogs(1, 1000), // Buscar todos os backlogs
  });

  const allBacklogs = Array.isArray(data?.data) ? data.data : [];

  // Filtrar backlogs pelo termo de busca
  const backlogs = allBacklogs.filter((backlog: BacklogSummary) =>
    backlog.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    console.error("Error loading backlogs:", error);
  }

  const handleRowClick = (backlogId: string) => {
    router.push(`/backlogs/${backlogId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Backlogs</h1>
          <p className="text-slate-600 mt-1">Visualize e gerencie os backlogs do sistema</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Todos os Backlogs</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Nome
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Quantidade de demandas
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-slate-500" colSpan={3}>
                      Carregando...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="py-6 text-center text-red-500" colSpan={3}>
                      Erro ao carregar backlogs. Verifique o console para mais detalhes.
                    </td>
                  </tr>
                ) : backlogs.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-slate-500" colSpan={3}>
                      {searchTerm ? "Nenhum backlog encontrado para o filtro aplicado." : "Nenhum backlog encontrado."}
                    </td>
                  </tr>
                ) : (
                  backlogs.map((backlog: BacklogSummary) => (
                    <tr
                      key={backlog.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleRowClick(backlog.id)}
                    >
                      <td className="py-3 px-2 font-medium text-slate-800">
                        {backlog.name}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {backlog.demandsCount} demanda{backlog.demandsCount !== 1 ? "s" : ""}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600">
                        {new Date(backlog.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && backlogs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                Total: {backlogs.length} backlog{backlogs.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
