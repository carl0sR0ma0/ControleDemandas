"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useDemandList } from "@/hooks/useDemands";
import { OccurrenceType, Classification, DemandStatus, DemandListItem } from "@/types/api";

export function DemandsTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading } = useDemandList({ page, size, q: searchTerm || undefined });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  // Debug: log para verificar estrutura dos dados
  if (items.length > 0) {
    console.log("First demand item:", items[0]);
    console.log("Module type:", typeof items[0].module, items[0].module);
    console.log("ReporterArea type:", typeof items[0].reporterArea, items[0].reporterArea);
  }

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

  // Get unique values for filters
  const getUniqueValues = (key: string) => {
    if (items.length === 0) return [];

    const values = items.map((item: DemandListItem) => {
      if (!item) return null;

      const val = item[key as keyof DemandListItem];

      // Handle null or undefined
      if (val === null || val === undefined) return null;

      // Handle objects with 'name' property
      if (typeof val === 'object' && val !== null && 'name' in val) {
        return val.name;
      }

      // Handle objects with 'version' property (systemVersion)
      if (typeof val === 'object' && val !== null && 'version' in val) {
        return val.version;
      }

      // Return primitive values directly
      return val;
    }).filter((v: any) => v !== null && v !== undefined && v !== "");

    return [...new Set(values)].sort();
  };

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const updateFilter = (column: string, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[column] || [];
      if (checked) {
        return { ...prev, [column]: [...current, value] };
      } else {
        return { ...prev, [column]: current.filter((v) => v !== value) };
      }
    });
  };

  const clearFilter = (column: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
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
            className={`h-6 w-6 p-0 hover:bg-[#04A4A1]/10 ${
              activeValues.length > 0 ? "bg-[#04A4A1]/20" : ""
            }`}
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
                <div key={value as string} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${column}-${value}`}
                    checked={activeValues.includes(value as string)}
                    onCheckedChange={(checked) =>
                      updateFilter(column, value as string, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`${column}-${value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {value as string}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Apply filters (client-side for demo)
  const filteredItems = items.filter((item: DemandListItem) => {
    return Object.entries(activeFilters).every(([column, values]) => {
      if (values.length === 0) return true;

      let itemValue: string = "";
      switch (column) {
        case "system":
          itemValue = item.systemVersion?.version || "";
          break;
        case "module":
          itemValue = item.module?.name || "";
          break;
        case "type":
          itemValue = item.occurrenceType;
          break;
        case "area":
          itemValue = item.reporterArea?.name || "";
          break;
        case "responsible":
          itemValue = item.responsible || "";
          break;
        case "classification":
          itemValue = item.classification;
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
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  Protocolo
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  Data
                </th>
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
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  Solicitante
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    Responsável
                    {!isLoading && items.length > 0 && (
                      <FilterPopover column="responsible" title="Responsável" dataKey="responsible" />
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
                  <td className="py-6 text-center text-slate-500" colSpan={11}>Carregando...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-slate-500" colSpan={11}>Nenhuma demanda encontrada.</td>
                </tr>
              ) : (
                filteredItems.map((d: DemandListItem) => (
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
