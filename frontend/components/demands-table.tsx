"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useDemandList } from "@/hooks/useDemands";
import { OccurrenceType, Classification, DemandStatus, DemandListItem } from "@/types/api";
import { PriorityCell } from "@/components/priority-cell";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { listBacklogs } from "@/lib/api/backlogs";

interface DemandsTableProps {
  selectedDemands?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function DemandsTable({ selectedDemands = [], onSelectionChange }: DemandsTableProps = {}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useDemandList({ page: 1, size: 1000, q: searchTerm || undefined });
  const items = data?.items ?? [];

  const { user } = useAuth();
  const canManageBacklogs = !!user && (user.permissions & 512) === 512;

  // Backlog names for tooltip (backlogId -> name)
  const { data: backlogsData } = useQuery({
    queryKey: ["backlogs", "list"],
    queryFn: () => listBacklogs(1, 1000),
  });
  const backlogNameById = useMemo(() => {
    const entries = (backlogsData?.data ?? []).map((b: any) => [b.id, b.name] as const);
    return new Map(entries);
  }, [backlogsData]);

  const handleSelectDemand = (demandId: string) => {
    if (!onSelectionChange) return;

    const demand = items.find(d => d.id === demandId);
    if (demand && (demand.priority === null || demand.priority === undefined)) return;
    if (demand?.backlogId) return; // Não permitir selecionar demandas que já estão em backlog

    const newSelection = selectedDemands.includes(demandId)
      ? selectedDemands.filter(id => id !== demandId)
      : [...selectedDemands, demandId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    const selectableIds = items
      .filter(d => !d.backlogId)
      .filter(d => d.priority !== null && d.priority !== undefined)
      .map(d => d.id);

    if (selectedDemands.length === selectableIds.length && selectableIds.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(selectableIds);
    }
  };

  const showCheckboxes = canManageBacklogs && !!onSelectionChange;

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

  const getPriorityLabel = (priority?: number | null) => {
    if (!priority) return "Sem prioridade";
    return `Prioridade ${priority}`;
  };

  const getStatusColor = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.Aberta:
        return "bg-[#FFA726] text-white";
      case DemandStatus.Arquivado:
        return "bg-[#78909C] text-white";
      case DemandStatus.Ranqueado:
        return "bg-[#B0BEC5] text-white";
      case DemandStatus.Aprovacao:
        return "bg-[#66BB6A] text-white";
      case DemandStatus.Documentacao:
        return "bg-[#29B6F6] text-white";
      case DemandStatus.Execucao:
        return "bg-[#5C6BC0] text-white";
      case DemandStatus.Pausado:
        return "bg-[#FFA726] text-white";
      case DemandStatus.Validacao:
        return "bg-[#9C27B0] text-white";
      case DemandStatus.Concluida:
        return "bg-[#7CB342] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.Aberta:
        return "Aberta";
      case DemandStatus.Arquivado:
        return "Arquivado";
      case DemandStatus.Ranqueado:
        return "Ranqueado";
      case DemandStatus.Aprovacao:
        return "Aprovação";
      case DemandStatus.Documentacao:
        return "Documentação";
      case DemandStatus.Execucao:
        return "Execução";
      case DemandStatus.Pausado:
        return "Pausado";
      case DemandStatus.Validacao:
        return "Validação";
      case DemandStatus.Concluida:
        return "Concluída";
      default:
        return status;
    }
  };

  // Get unique values for filters
  const getUniqueValues = (key: string) => {
    if (items.length === 0) return [];
    const values = items
      .map((item: DemandListItem) => {
        const val = item[key as keyof DemandListItem] as any;
        if (val === null || val === undefined) return null;
        if (val && typeof val === "object" && "name" in val) return (val as any).name;
        if (val && typeof val === "object" && "version" in val) return (val as any).version;
        return val;
      })
      .filter((v: any) => v !== null && v !== undefined && v !== "");
    return [...new Set(values)].sort();
  };

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const updateFilter = (column: string, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[column] || [];
      return checked
        ? { ...prev, [column]: [...current, value] }
        : { ...prev, [column]: current.filter((v) => v !== value) };
    });
  };

  const clearFilter = (column: string) => {
    setActiveFilters((prev) => {
      const copy = { ...prev };
      delete copy[column];
      return copy;
    });
  };

  const FilterPopover = ({
    column,
    title,
    dataKey,
  }: {
    column: string;
    title: string;
    dataKey: string;
  }) => {
    const values = items.length > 0 ? getUniqueValues(dataKey as any) : [];
    const activeValues = activeFilters[column] || [];
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-[#04A4A1]/10 ${activeValues.length > 0 ? "bg-[#04A4A1]/20" : ""}`}
          >
            <Filter className="h-3 w-3 text-slate-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{title}</h4>
              {activeValues.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(column)}
                  className="h-6 px-2 text-xs"
                >
                  Limpar
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {values.map((value) => (
                <div key={String(value)} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${column}-${value}`}
                    checked={activeValues.includes(String(value))}
                    onCheckedChange={(checked) => updateFilter(column, String(value), Boolean(checked))}
                  />
                  <label htmlFor={`${column}-${value}`} className="text-sm cursor-pointer flex-1">
                    {String(value)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const filteredItems = items.filter((item: DemandListItem) => {
    return Object.entries(activeFilters).every(([column, values]) => {
      if (values.length === 0) return true;

      let itemValue = "";
      switch (column) {
        case "system":
          itemValue = item.systemVersion?.version || "";
          break;
        case "module":
          itemValue = item.module?.name || "";
          break;
        case "type":
          itemValue = String(item.occurrenceType);
          break;
        case "area":
          itemValue = item.reporterArea?.name || "";
          break;
        case "responsible":
          itemValue = item.responsible || "";
          break;
        case "classification":
          itemValue = String(item.classification);
          break;
        case "priority":
          itemValue = getPriorityLabel(item.priority);
          break;
        case "status":
          itemValue = getStatusLabel(item.status);
          break;
        case "unit":
          itemValue = item.unit?.name || "";
          break;
        default:
          return true;
      }

      return values.includes(itemValue);
    });
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Todas as Demandas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-3 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por protocolo, descrição, responsável, módulo, área"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="overflow-auto max-h-[600px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-200">
                {showCheckboxes && (
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 w-12">
                    <Checkbox
                      checked={
                        items.filter(d => !d.backlogId).length > 0 &&
                        selectedDemands.length === items.filter(d => !d.backlogId).length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Protocolo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Data</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Sistema
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="system" title="Sistema" dataKey="systemVersion" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Módulo
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="module" title="Módulo" dataKey="module" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Tipo
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="type" title="Tipo" dataKey="occurrenceType" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Área
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="area" title="Área" dataKey="reporterArea" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Solicitante</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Cliente
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="responsible" title="Cliente" dataKey="responsible" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Unidade
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="unit" title="Unidade" dataKey="unit" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Classificação
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="classification" title="Classificação" dataKey="classification" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Prioridade
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="priority" title="Prioridade" dataKey="priority" />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Status
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="status" title="Status" dataKey="status" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={showCheckboxes ? 13 : 12}>Carregando...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={showCheckboxes ? 13 : 12}>Nenhuma demanda encontrada.</td>
                </tr>
              ) : (
                filteredItems.map((d: DemandListItem) => {
                  const hasBacklog = !!d.backlogId;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onDoubleClick={() => onRowDoubleClick(d.protocol)}
                    >
                      {showCheckboxes && (
                        <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                          {hasBacklog ? (
                            <div className="flex items-center justify-center w-4 h-4 bg-gray-300 rounded opacity-50" title="Já vinculado a backlog">
                              <span className="text-xs text-gray-600">🔒</span>
                            </div>
                          ) : (
                            <Checkbox
                              checked={selectedDemands.includes(d.id)}
                              disabled={d.priority === null || d.priority === undefined}
                              onCheckedChange={() => handleSelectDemand(d.id)}
                              title={(d.priority === null || d.priority === undefined) ? "Defina prioridade para selecionar" : undefined}
                            />
                          )}
                        </td>
                      )}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#04A4A1]">{String(d.protocol)}</span>
                          {d.backlogId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded cursor-default">Backlog</span>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={6}>
                                <span>{`Backlog: ${backlogNameById.get(d.backlogId) ?? "carregando..."}`}</span>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600">{new Date(d.openedAt).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-2 text-sm text-slate-600">{d.systemVersion?.version ?? ""}</td>
                      <td className="py-3 px-2 text-sm text-slate-600">{d.module?.name ?? ""}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" className={getTypeColor(d.occurrenceType)}>{String(d.occurrenceType)}</Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600">{d.reporterArea?.name ?? ""}</td>
                      <td className="py-3 px-2 text-sm text-slate-600">{d.requester?.name ?? ""}</td>
                      <td className="py-3 px-2 text-sm text-slate-600">{d.responsible ?? ""}</td>
                      <td className="py-3 px-2 text-sm text-slate-600">{d.unit?.name ?? ""}</td>
                      <td className="py-3 px-2">
                        <Badge className={getClassificationColor(d.classification)}>{String(d.classification)}</Badge>
                      </td>
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <PriorityCell demandId={d.id} currentPriority={d.priority ?? null} canEdit={canManageBacklogs} />
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(d.status)}>{getStatusLabel(d.status)}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredItems.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Total: {filteredItems.length} demanda{filteredItems.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
