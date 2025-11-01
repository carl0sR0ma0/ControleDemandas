"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Play, Pause, CheckCircle, Trash2, Pencil } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  listSprints,
  removeSprint,
  updateSprintStatus,
  SprintSummary,
  SprintStatus,
} from "@/lib/api-sprints";
import { toast } from "sonner";
import { SprintModal } from "@/components/sprints/sprint-modal";
import { SprintBadge } from "@/components/sprints/sprint-badge";

const PERMS = {
  VisualizarDemandas: 2,
  GerenciarBacklogs: 512,
};

const statusLabels: Record<SprintStatus, { label: string; color: string }> = {
  [SprintStatus.NotStarted]: { label: "Nao iniciada", color: "bg-gray-100 text-gray-700" },
  [SprintStatus.InProgress]: { label: "Em andamento", color: "bg-blue-100 text-blue-700" },
  [SprintStatus.Paused]: { label: "Pausada", color: "bg-yellow-100 text-yellow-700" },
  [SprintStatus.Completed]: { label: "Concluida", color: "bg-green-100 text-green-700" },
};
const fallbackStatusLabel = { label: "Sem status", color: "bg-slate-100 text-slate-600" };

const resolveSprintStatus = (status: unknown): SprintStatus | undefined => {
  if (typeof status === "number") return status as SprintStatus;
  if (typeof status === "string") {
    const numeric = Number(status);
    if (!Number.isNaN(numeric)) return numeric as SprintStatus;
    const mapped = (SprintStatus as Record<string, number | string>)[status];
    if (typeof mapped === "number") return mapped as SprintStatus;
  }
  return undefined;
};

export default function SprintsPage() {
  useAuthGuard(PERMS.VisualizarDemandas);

  const router = useRouter();
  const [sprints, setSprints] = useState<SprintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [shouldReloadAfterModal, setShouldReloadAfterModal] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState<string | undefined>();

  const loadSprints = async () => {
    try {
      setLoading(true);
      const data = await listSprints();
      setSprints(data);
    } catch (error) {
      toast.error("Erro ao carregar sprints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSprints();
  }, []);

  const handleCreateSprint = () => {
    setEditingSprintId(undefined);
    setModalOpen(true);
  };

  const handleDeleteSprint = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta sprint?")) return;
    try {
      await removeSprint(id);
      toast.success("Sprint excluida com sucesso");
      loadSprints();
    } catch (error) {
      toast.error("Erro ao excluir sprint");
    }
  };

  const handleChangeStatus = async (id: string, status: SprintStatus) => {
    try {
      await updateSprintStatus(id, status);
      toast.success("Status atualizado com sucesso");
      loadSprints();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleSprintClick = (sprint: SprintSummary) => {
    router.push(`/sprints/${sprint.id}`);
  };

  const handleEditSprint = (id: string) => {
    setEditingSprintId(id);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingSprintId(undefined);
      setShouldReloadAfterModal(true);
    }
  };

  useEffect(() => {
    if (!modalOpen && shouldReloadAfterModal) {
      loadSprints();
      setShouldReloadAfterModal(false);
    }
  }, [modalOpen, shouldReloadAfterModal]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sprints</h1>
          <p className="text-slate-600 mt-1">
            Gerencie as sprints do seu projeto
          </p>
        </div>
        <Button onClick={handleCreateSprint} className="bg-[#04A4A1] hover:bg-[#038a87]">
          <Plus className="h-4 w-4 mr-2" />
          Nova Sprint
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Todas as sprints</CardTitle>
          {!loading && sprints.length > 0 && (
            <span className="text-sm text-slate-500">
              {sprints.length} sprint{sprints.length === 1 ? "" : "s"}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-slate-500">Carregando sprints...</div>
          ) : sprints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">Nenhuma sprint cadastrada</p>
              <Button onClick={handleCreateSprint} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira sprint
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status da sprint</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Término</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sprints.map((sprint) => {
                    const normalizedStatus = resolveSprintStatus(sprint.status);
                    const statusInfo =
                      (normalizedStatus !== undefined
                        ? statusLabels[normalizedStatus]
                        : undefined) ?? fallbackStatusLabel;
                    return (
                      <TableRow
                        key={sprint.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleSprintClick(sprint)}
                        onDoubleClick={() => handleSprintClick(sprint)}
                      >
                        <TableCell className="font-medium">{sprint.name}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <SprintBadge percent={sprint.percent} />
                        </TableCell>
                        <TableCell>{formatDate(sprint.startDate)}</TableCell>
                        <TableCell>{formatDate(sprint.endDate)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSprint(sprint.id);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {sprint.status === SprintStatus.NotStarted && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeStatus(sprint.id, SprintStatus.InProgress);
                                  }}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Iniciar
                                </DropdownMenuItem>
                              )}
                              {sprint.status === SprintStatus.InProgress && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeStatus(sprint.id, SprintStatus.Paused);
                                    }}
                                  >
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pausar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeStatus(sprint.id, SprintStatus.Completed);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Concluir
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sprint.status === SprintStatus.Paused && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeStatus(sprint.id, SprintStatus.InProgress);
                                  }}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Retomar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSprint(sprint.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SprintModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        sprintId={editingSprintId}
      />
    </div>
  );
}
