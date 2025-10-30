"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import { useAuthGuard, PERMS } from "@/hooks/useAuthGuard";
import { getBacklog } from "@/lib/api/backlogs";
import type { BacklogDemand } from "@/types/api";

interface BacklogDetailPageProps {
  params: {
    id: string;
  };
}

export default function BacklogDetailPage({ params }: BacklogDetailPageProps) {
  useAuthGuard(PERMS.VisualizarDemandas);
  const router = useRouter();
  const { id } = params;

  const { data: backlog, isLoading, error } = useQuery({
    queryKey: ["backlog", id],
    queryFn: () => getBacklog(id),
  });

  if (error) {
    console.error("Error loading backlog:", error);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberta":
        return "bg-[#FFA726] text-white";
      case "Arquivado":
        return "bg-[#78909C] text-white";
      case "Ranqueado":
        return "bg-[#B0BEC5] text-white";
      case "Aprovacao":
        return "bg-[#66BB6A] text-white";
      case "Documentacao":
        return "bg-[#29B6F6] text-white";
      case "Execucao":
        return "bg-[#5C6BC0] text-white";
      case "Pausado":
        return "bg-[#FFA726] text-white";
      case "Validacao":
        return "bg-[#9C27B0] text-white";
      case "Concluida":
        return "bg-[#7CB342] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityColor = (priority: number | null) => {
    if (!priority) return "bg-gray-400 text-white";
    if (priority === 1) return "bg-red-600 text-white";
    if (priority === 2) return "bg-orange-500 text-white";
    if (priority === 3) return "bg-yellow-500 text-white";
    if (priority === 4) return "bg-blue-500 text-white";
    return "bg-slate-400 text-white";
  };

  const getPriorityLabel = (priority: number | null) => {
    if (!priority) return "—";
    return `Prioridade ${priority}`;
  };

  const handleDemandClick = (protocol: string) => {
    router.push(`/demandas/${protocol}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-500">
          Erro ao carregar backlog. Verifique o console para mais detalhes.
        </div>
      </div>
    );
  }

  if (!backlog) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-slate-500">Backlog não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/backlogs")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Backlogs
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{backlog.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Criado em{" "}
                {new Date(backlog.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
            {backlog.demands?.length || 0} demanda{(backlog.demands?.length || 0) !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Demandas do Backlog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Protocolo
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Descrição
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Prioridade
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {!backlog.demands || backlog.demands.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-slate-500" colSpan={4}>
                      Nenhuma demanda neste backlog.
                    </td>
                  </tr>
                ) : (
                  backlog.demands.map((demand: BacklogDemand) => (
                    <tr
                      key={demand.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleDemandClick(demand.protocol)}
                    >
                      <td className="py-3 px-2 font-medium text-[#04A4A1]">
                        #{demand.protocol}
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600 max-w-md truncate">
                        {demand.description}
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getPriorityColor(demand.priority)}>
                          {getPriorityLabel(demand.priority)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(demand.status)}>
                          {demand.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
