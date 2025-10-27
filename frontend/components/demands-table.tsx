"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, Download, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function DemandsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mock data - in real app, fetch from API
  const demands = [
    {
      protocol: "2025-000123",
      date: "2025-01-15",
      system: "PGDI",
      type: "Bug",
      area: "Tecnologia",
      module: "Indicadores",
      classification: "Urgente",
      status: "Execução",
      responsible: "João Silva",
      estimatedDate: "2025-01-20",
      document: "https://exemplo.com/doc1",
      description: "Peso dos indicadores do PGDI não funciona",
    },
    {
      protocol: "2025-000124",
      date: "2025-01-14",
      system: "PGDI",
      type: "Incremental",
      area: "Engenharia",
      module: "Usuário",
      classification: "Médio",
      status: "Aprovação",
      responsible: "Maria Santos",
      estimatedDate: "2025-01-25",
      document: "",
      description: "Recuperação de Senha",
    },
    {
      protocol: "2025-000125",
      date: "2025-01-13",
      system: "PGDI",
      type: "Melhoria",
      area: "PMO",
      module: "Dashboard",
      classification: "Baixo",
      status: "Validação",
      responsible: "Pedro Costa",
      estimatedDate: "2025-01-18",
      document: "https://exemplo.com/doc3",
      description: "Melhorar performance dos gráficos",
    },
    {
      protocol: "2025-000126",
      date: "2025-01-12",
      system: "PCP",
      type: "Bug",
      area: "CX",
      module: "Relatórios",
      classification: "Urgente",
      status: "Ranqueado",
      responsible: "Ana Lima",
      estimatedDate: "2025-01-22",
      document: "",
      description: "Erro na geração de relatórios",
    },
    {
      protocol: "2025-000127",
      date: "2025-01-11",
      system: "PGDI",
      type: "Incremental",
      area: "Tecnologia",
      module: "PAP",
      classification: "Médio",
      status: "Concluída",
      responsible: "Carlos Souza",
      estimatedDate: "2025-01-16",
      document: "https://exemplo.com/doc5",
      description: "Nova funcionalidade no PAP",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      Ranqueado: "bg-[#7CB342] text-white",
      "Aprovação": "bg-[#66BB6A] text-white",
      Execução: "bg-[#5C6BC0] text-white",
      Validação: "bg-[#B0BEC5] text-white",
      Concluída: "bg-[#BDBDBD] text-white",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Bug: "bg-red-100 text-red-800",
      Incremental: "bg-blue-100 text-blue-800",
      Melhoria: "bg-green-100 text-green-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getClassificationColor = (classification: string) => {
    const colors = {
      Urgente: "bg-red-500 text-white",
      Médio: "bg-yellow-500 text-white",
      Baixo: "bg-gray-500 text-white",
    };
    return (
      colors[classification as keyof typeof colors] || "bg-gray-500 text-white"
    );
  };

  // Get unique values for filters
  const getUniqueValues = (key: string) => {
    const values = demands
      .map((demand) => demand[key as keyof typeof demand])
      .filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Filter functions
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

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  // Apply filters
  const filteredDemands = demands.filter((demand) => {
    const matchesSearch =
      demand.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.responsible.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(activeFilters).every(
      ([column, values]) => {
        if (values.length === 0) return true;
        return values.includes(demand[column as keyof typeof demand] as string);
      }
    );

    return matchesSearch && matchesFilters;
  });

  const FilterPopover = ({
    column,
    title,
  }: {
    column: string;
    title: string;
  }) => {
    const values = getUniqueValues(column);
    const activeValues = activeFilters[column] || [];
    const [open, setOpen] = useState(false);

    return (
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
        }}
      >
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
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${column}-${value}`}
                    checked={activeValues.includes(value)}
                    onCheckedChange={(checked) =>
                      updateFilter(column, value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`${column}-${value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {value}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const activeFilterCount = Object.values(activeFilters).reduce(
    (acc, values) => acc + values.length,
    0
  );

  // Column configuration and resizable widths
  type ColumnKey =
    | "protocol"
    | "date"
    | "system"
    | "type"
    | "area"
    | "module"
    | "classification"
    | "status"
    | "responsible"
    | "estimatedDate"
    | "actions";

  const columnOrder: ColumnKey[] = [
    "protocol",
    "date",
    "system",
    "module",
    "type",
    "area",
    "responsible",
    "classification",
    "status",
    "actions",
  ];

  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>({
    protocol: 140,
    date: 110,
    system: 120,
    type: 110,
    area: 140,
    module: 200,
    classification: 140,
    status: 140,
    responsible: 160,
    estimatedDate: 120,
    actions: 100,
  });

  const startResize = (key: ColumnKey, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[key] ?? 120;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(80, startWidth + delta);
      setColumnWidths((prev) => ({ ...prev, [key]: next }));
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const renderHeader = (key: ColumnKey) => {
    switch (key) {
      case "protocol":
        return <span className="text-sm font-medium text-slate-600">Protocolo</span>;
      case "date":
        return <span className="text-sm font-medium text-slate-600">Data</span>;
      case "system":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Sistema</span>
            <FilterPopover column="system" title="Sistema" />
          </div>
        );
      case "type":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Tipo</span>
            <FilterPopover column="type" title="Tipo" />
          </div>
        );
      case "area":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Área</span>
            <FilterPopover column="area" title="Área" />
          </div>
        );
      case "module":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Módulo</span>
            <FilterPopover column="module" title="Módulo" />
          </div>
        );
      case "responsible":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Responsável</span>
            <FilterPopover column="responsible" title="Responsável" />
          </div>
        );
      case "classification":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Classificação</span>
            <FilterPopover column="classification" title="Classificação" />
          </div>
        );
      case "status":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Status</span>
            <FilterPopover column="status" title="Status" />
          </div>
        );
      case "estimatedDate":
        return <span className="text-sm font-medium text-slate-600">Estimativa</span>;
      case "actions":
        return <span className="text-sm font-medium text-slate-600">Ações</span>;
    }
  };

  const renderCell = (key: ColumnKey, demand: (typeof demands)[number]) => {
    switch (key) {
      case "protocol":
        return (
          <Link href={`/demandas/${demand.protocol}`} className="font-medium text-[#04A4A1] hover:underline">
            #{demand.protocol}
          </Link>
        );
      case "date":
        return <span className="text-sm text-slate-600">{new Date(demand.date).toLocaleDateString("pt-BR")}</span>;
      case "system":
        return <span className="text-sm text-slate-600">{demand.system}</span>;
      case "type":
        return (
          <Badge variant="secondary" className={getTypeColor(demand.type)}>
            {demand.type}
          </Badge>
        );
      case "area":
        return <span className="text-sm text-slate-600">{demand.area}</span>;
      case "module":
        return (
          <span className="text-sm text-slate-600 max-w-32 truncate" title={demand.module}>
            {demand.module}
          </span>
        );
      case "responsible":
        return <span className="text-sm text-slate-600">{demand.responsible}</span>;
      case "classification":
        return (
          <Badge className={getClassificationColor(demand.classification)}>
            {demand.classification}
          </Badge>
        );
      case "status":
        return <Badge className={getStatusColor(demand.status)}>{demand.status}</Badge>;
      case "estimatedDate":
        return (
          <span className="text-sm text-slate-600">
            {new Date(demand.estimatedDate).toLocaleDateString("pt-BR")}
          </span>
        );
      case "actions":
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <Link href={`/demandas/${demand.protocol}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
    }
  };

  // Pagination
  const pageCount = Math.ceil(filteredDemands.length / pageSize) || 1;
  const currentPageSafe = Math.min(Math.max(currentPage, 1), pageCount);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredDemands.length);
  const pageItems = filteredDemands.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Lista de Demandas
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por protocolo, descrição ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters */}
          {(activeFilterCount > 0 || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{searchTerm}"
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {Object.entries(activeFilters).map(([column, values]) =>
                values.map((value) => (
                  <Badge
                    key={`${column}-${value}`}
                    variant="secondary"
                    className="gap-1"
                  >
                    {value}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilter(column, value, false)}
                    />
                  </Badge>
                ))
              )}
              {(activeFilterCount > 0 || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Limpar todos
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  {columnOrder.map((key) => (
                    <th key={key} className="text-left py-3 px-4 relative group" style={{ width: columnWidths[key] }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">{renderHeader(key)}</div>
                        <div
                          onMouseDown={(e) => startResize(key, e)}
                          className="w-1 h-6 cursor-col-resize bg-transparent group-hover:bg-slate-300 rounded absolute right-0 top-1/2 -translate-y-1/2"
                          role="separator"
                          aria-orientation="vertical"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((demand, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    {columnOrder.map((key) => (
                      <td key={key} className="py-3 px-4" style={{ width: columnWidths[key] }}>
                        {renderCell(key, demand)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">
                Nenhuma demanda encontrada com os filtros aplicados.
              </p>
            </div>
          )}
          {filteredDemands.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 text-sm text-slate-600 border-t flex flex-col gap-3">
              <div>
                Mostrando {startIndex + 1}-{endIndex} de {filteredDemands.length} demandas
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPageSafe === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-slate-600">Página {currentPageSafe} de {pageCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPageSafe === pageCount}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
