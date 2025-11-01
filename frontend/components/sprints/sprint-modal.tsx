"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  getSprint,
  saveSprint,
  listAvailableSprintBacklogs,
  SprintAvailableBacklog,
  SprintAvailableBacklogDemand,
} from "@/lib/api-sprints";
import { Search, X } from "lucide-react";

type DemandPick = { id: string; protocol?: string; description?: string };

type ItemRow = {
  demandId: string;
  plannedHours: number;
  workedHours: number;
  protocol?: string;
  description?: string;
  backlogName?: string;
  priority?: number | null;
  status?: string;
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Critica",
  2: "Alta",
  3: "Media",
  4: "Baixa",
  5: "Muito baixa",
};

const PRIORITY_BADGE_CLASSES: Record<number, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-blue-100 text-blue-700",
  5: "bg-slate-100 text-slate-700",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  aberta: "bg-orange-100 text-orange-700",
  ranqueado: "bg-slate-100 text-slate-700",
  aprovacao: "bg-emerald-100 text-emerald-700",
  documentacao: "bg-sky-100 text-sky-700",
  execucao: "bg-indigo-100 text-indigo-700",
  pausado: "bg-yellow-100 text-yellow-700",
  validacao: "bg-purple-100 text-purple-700",
  concluida: "bg-green-100 text-green-700",
  arquivado: "bg-slate-200 text-slate-600",
};

const getPriorityBadgeClass = (priority?: number | null) => {
  if (typeof priority !== "number") return "bg-slate-100 text-slate-600";
  return PRIORITY_BADGE_CLASSES[priority] ?? "bg-slate-100 text-slate-600";
};

const getStatusBadgeClass = (status?: string) => {
  if (!status) return "bg-slate-100 text-slate-600";
  const key = status.toLowerCase();
  return STATUS_BADGE_CLASSES[key] ?? "bg-slate-100 text-slate-600";
};

interface SprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId?: string;
  // opcional: seeds vindos de uma selecao de demandas no backlog
  seedDemands?: DemandPick[];
}

export function SprintModal({ open, onOpenChange, sprintId, seedDemands }: SprintModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ItemRow[]>([]);
  const [availableBacklogs, setAvailableBacklogs] = useState<SprintAvailableBacklog[]>([]);
  const [loadingBacklogs, setLoadingBacklogs] = useState(false);
  const [backlogError, setBacklogError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearchTerm("");
    if (sprintId) {
      getSprint(sprintId).then((s) => {
        setName(s.name);
        setStartDate(s.startDate.slice(0, 10));
        setEndDate(s.endDate.slice(0, 10));
        setItems(
          s.items.map((i) => ({
            demandId: i.demandId,
            plannedHours: i.plannedHours ?? 0,
            workedHours: i.workedHours ?? 0,
            protocol: i.demand?.protocol,
            description: i.demand?.description,
            backlogName: i.demand?.backlog?.name ?? null,
            priority: i.demand?.priority ?? null,
            status:
              i.demand?.status !== undefined && i.demand?.status !== null
                ? String(i.demand.status)
                : undefined,
          }))
        );
      });
    } else {
      setName("");
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      setItems(
        seedDemands && seedDemands.length
          ? seedDemands.map((d) => ({
              demandId: d.id,
              plannedHours: 0,
              workedHours: 0,
              protocol: d.protocol,
              description: d.description,
            }))
          : []
      );
    }
  }, [open, sprintId, seedDemands]);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingBacklogs(true);
    setBacklogError(null);

    listAvailableSprintBacklogs()
      .then((data) => {
        if (!isMounted) return;
        setAvailableBacklogs(data);
      })
      .catch((error) => {
        console.error("Failed to load available backlogs", error);
        if (!isMounted) return;
        setBacklogError("Erro ao carregar backlogs disponíveis.");
        setAvailableBacklogs([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingBacklogs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!availableBacklogs.length) return;
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.protocol && item.description && item.backlogName) {
          return item;
        }
        const backlog = availableBacklogs.find((b) =>
          b.demands.some((d) => d.id === item.demandId)
        );
        if (!backlog) return item;
        const demand = backlog.demands.find((d) => d.id === item.demandId);
        if (!demand) return item;
        changed = true;
        return {
          ...item,
          protocol: item.protocol ?? demand.protocol,
          description: item.description ?? demand.description,
          backlogName: item.backlogName ?? backlog.name,
          priority: item.priority ?? demand.priority,
          status: item.status ?? demand.status,
        };
      });
      return changed ? next : prev;
    });
  }, [availableBacklogs]);

  const selectedIds = useMemo(() => new Set(items.map((item) => item.demandId)), [items]);

  const filteredBacklogs = useMemo(() => {
    if (!searchTerm.trim()) return availableBacklogs;
    const term = searchTerm.toLowerCase();
    return availableBacklogs
      .map((backlog) => ({
        ...backlog,
        demands: backlog.demands.filter((demand) => {
          const protocol = demand.protocol?.toLowerCase() ?? "";
          const description = demand.description?.toLowerCase() ?? "";
          return protocol.includes(term) || description.includes(term);
        }),
      }))
      .filter((backlog) => backlog.demands.length > 0);
  }, [availableBacklogs, searchTerm]);

  const formatStatusLabel = (status?: string) => {
    if (!status) return "";
    return status
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const handleToggleDemand = (
    backlog: SprintAvailableBacklog,
    demand: SprintAvailableBacklogDemand,
    checked: boolean
  ) => {
    if (checked) {
      setItems((prev) => {
        if (prev.some((item) => item.demandId === demand.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            demandId: demand.id,
            plannedHours: 0,
            workedHours: 0,
            protocol: demand.protocol,
            description: demand.description,
            backlogName: backlog.name,
            priority: demand.priority,
            status: demand.status,
          },
        ];
      });
    } else {
      setItems((prev) => prev.filter((item) => item.demandId !== demand.id));
    }
  };

  const handleRemoveItem = (demandId: string) => {
    setItems((prev) => prev.filter((item) => item.demandId !== demandId));
  };

  const handleChangeItem = (idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) => {
      const arr = [...prev];
      const num = parseFloat(value);
      (arr[idx] as any)[field] = isNaN(num) ? 0 : num;
      return arr;
    });
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Nome obrigatorio" });
      return;
    }
    if (endDate < startDate) {
      toast({ variant: "destructive", title: "Data final deve ser >= inicial" });
      return;
    }
    if (items.length === 0) {
      toast({ variant: "destructive", title: "Selecione ao menos uma demanda" });
      return;
    }
    setSaving(true);
    try {
      await saveSprint({
        id: sprintId,
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: items.map((i) => ({ demandId: i.demandId, plannedHours: i.plannedHours, workedHours: i.workedHours })),
      });
      toast({ title: sprintId ? "Sprint atualizada" : "Sprint criada" });
      onOpenChange(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao salvar sprint" });
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl xl:max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sprintId ? "Editar Sprint" : "Nova Sprint"}</DialogTitle>
          <DialogDescription>Defina periodo e itens (horas planejadas x trabalhadas).</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Sprint 24.11" />
              </div>
              <div className="space-y-2">
                <Label>Inicio</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
          <div className="space-y-2">
            <Label>Término</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Demandas selecionadas</Label>
                <span className="text-xs text-slate-500">
                  {items.length} selecionada{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="border rounded-lg">
                <div className="grid grid-cols-12 text-xs font-medium uppercase tracking-wide text-slate-600 p-3 bg-slate-50 border-b">
                  <div className="col-span-5">Demanda</div>
                  <div className="col-span-2">Backlog</div>
                  <div className="col-span-2 text-right">Horas planejadas</div>
                  <div className="col-span-2 text-right">Horas trabalhadas</div>
                  <div className="col-span-1 text-right">Acoes</div>
                </div>
                {items.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500 text-center">Nenhuma demanda selecionada</div>
                ) : (
                  <div className="divide-y">
                    {items.map((it, idx) => (
                      <div key={`${it.demandId}-${idx}`} className="grid grid-cols-12 gap-3 items-start p-3">
                        <div className="col-span-5 space-y-2">
                          <div>
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {it.protocol ?? it.demandId}
                            </p>
                            {it.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">{it.description}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {typeof it.priority === "number" && (
                              <Badge className={`${getPriorityBadgeClass(it.priority)} font-medium`}>
                                {PRIORITY_LABELS[it.priority] ?? `Prioridade ${it.priority}`}
                              </Badge>
                            )}
                            {it.status && (
                              <Badge className={`${getStatusBadgeClass(it.status)} font-medium`}>
                                {formatStatusLabel(it.status)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          {it.backlogName ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {it.backlogName}
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Input
                            type="number"
                            className="max-w-[140px] text-right"
                            value={it.plannedHours}
                            onChange={(e) => handleChangeItem(idx, "plannedHours", e.target.value)}
                            step="0.5"
                            min="0"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Input
                            type="number"
                            className="max-w-[140px] text-right"
                            value={it.workedHours}
                            onChange={(e) => handleChangeItem(idx, "workedHours", e.target.value)}
                            step="0.5"
                            min="0"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-700"
                            onClick={() => handleRemoveItem(it.demandId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold" htmlFor="sprint-demand-search">
                Demandas disponíveis nos backlogs
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="sprint-demand-search"
                  placeholder="Buscar por protocolo ou descricao"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-lg h-[420px] overflow-y-auto">
              {loadingBacklogs ? (
                <div className="p-6 text-sm text-slate-500 text-center">Carregando backlogs...</div>
              ) : backlogError ? (
                <div className="p-6 text-sm text-red-500 text-center">{backlogError}</div>
              ) : filteredBacklogs.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  {searchTerm
                    ? "Nenhuma demanda encontrada para o filtro aplicado."
                    : "Nenhum backlog com demandas disponiveis."}
                </div>
              ) : (
                <Accordion type="multiple" className="divide-y">
                  {filteredBacklogs.map((backlog) => (
                    <AccordionItem key={backlog.id} value={backlog.id}>
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm text-slate-700">{backlog.name}</span>
                          <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                            {backlog.demands.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-2">
                        {backlog.demands.map((demand) => {
                          const checked = selectedIds.has(demand.id);
                          return (
                            <label
                              key={demand.id}
                              className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                  handleToggleDemand(backlog, demand, value === true)
                                }
                              />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-slate-700">{demand.protocol}</p>
                                <p className="text-xs text-slate-500">{demand.description}</p>
                                <div className="flex flex-wrap gap-2 text-[11px]">
                                  {typeof demand.priority === "number" && (
                                    <Badge className={`${getPriorityBadgeClass(demand.priority)} font-medium`}>
                                      {PRIORITY_LABELS[demand.priority] ?? `Prioridade ${demand.priority}`}
                                    </Badge>
                                  )}
                                  {demand.status && (
                                    <Badge className={`${getStatusBadgeClass(demand.status)} font-medium`}>
                                      {formatStatusLabel(demand.status)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button className="bg-[#04A4A1] hover:bg-[#038a87]" onClick={onSave} disabled={saving}>
            {saving ? "Salvando..." : sprintId ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
