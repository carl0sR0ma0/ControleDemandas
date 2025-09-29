"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export function RecentDemands() {
  // Mock data - in real app, fetch from API
  const recentDemands = [
    {
      protocol: "#12345",
      date: "2025-01-15",
      system: "PGDI",
      module: "Indicadores",
      type: "Bug",
      area: "Tecnologia",
      client: "Interno",
      responsible: "João Silva",
      classification: "Urgente",
      status: "Execução",
      description: "Peso dos indicadores do PGDI não funciona",
    },
    {
      protocol: "#12346",
      date: "2025-01-14",
      system: "PGDI",
      module: "Usuário",
      type: "Incremental",
      area: "Engenharia",
      client: "Raízen",
      responsible: "Maria Santos",
      classification: "Médio",
      status: "Aprovação",
      description: "Recuperação de Senha",
    },
    {
      protocol: "#12347",
      date: "2025-01-13",
      system: "PGDI",
      module: "Dashboard",
      type: "Melhoria",
      area: "PMO",
      client: "Cliente A",
      responsible: "Pedro Costa",
      classification: "Baixo",
      status: "Validação",
      description: "Melhorar performance dos gráficos",
    },
    {
      protocol: "#12348",
      date: "2025-01-12",
      system: "PCP",
      module: "Relatórios",
      type: "Bug",
      area: "CX",
      client: "Interno",
      responsible: "Ana Lima",
      classification: "Urgente",
      status: "Ranqueado",
      description: "Erro na exportação de relatórios",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

  const getStatusColor = (status: string) => {
    const colors = {
      Ranqueado: "bg-[#7CB342] text-white",
      Aprovação: "bg-[#66BB6A] text-white",
      Execução: "bg-[#5C6BC0] text-white",
      Validação: "bg-[#B0BEC5] text-white",
      Concluída: "bg-[#BDBDBD] text-white",
    }
    return colors[status as keyof typeof colors] || "bg-gray-500 text-white"
  }

  const getTypeColor = (type: string) => {
    const colors = {
      Bug: "bg-red-100 text-red-800",
      Incremental: "bg-blue-100 text-blue-800",
      Melhoria: "bg-green-100 text-green-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Helpers for filters
  const getUniqueValues = (key: string) => {
    const values = recentDemands
      .map((d) => d[key as keyof typeof d])
      .filter(Boolean) as string[]
    return [...new Set(values)].sort()
  }

  const updateFilter = (column: string, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[column] || []
      if (checked) {
        return { ...prev, [column]: [...current, value] }
      } else {
        return { ...prev, [column]: current.filter((v) => v !== value) }
      }
    })
  }

  const clearFilter = (column: string) => {
    setActiveFilters((prev) => {
      const n = { ...prev }
      delete n[column]
      return n
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchTerm("")
  }

  const filteredDemands = recentDemands.filter((d) => {
    const s = searchTerm.toLowerCase()
    const matchesSearch =
      d.protocol.toLowerCase().includes(s) ||
      d.description.toLowerCase().includes(s) ||
      d.client.toLowerCase().includes(s) ||
      d.module.toLowerCase().includes(s)

    const matchesFilters = Object.entries(activeFilters).every(([col, values]) => {
      if (values.length === 0) return true
      return values.includes(d[col as keyof typeof d] as string)
    })

    return matchesSearch && matchesFilters
  })

  const FilterPopover = ({
    column,
    title,
  }: {
    column: string
    title: string
  }) => {
    const values = getUniqueValues(column)
    const activeValues = activeFilters[column] || []
    const [open, setOpen] = useState(false)

    return (
      <Popover open={open} onOpenChange={(v) => setOpen(v)}>
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
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${column}-${value}`}
                    checked={activeValues.includes(value)}
                    onCheckedChange={(checked) => updateFilter(column, value, checked as boolean)}
                  />
                  <label htmlFor={`${column}-${value}`} className="text-sm cursor-pointer flex-1">
                    {value}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const activeFilterCount = Object.values(activeFilters).reduce((acc, v) => acc + v.length, 0)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-800">Últimas Demandas</CardTitle>
          <CardDescription>Demandas recentemente criadas ou atualizadas</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/demandas">Ver Todas</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por protocolo, descrição, cliente ou módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {(activeFilterCount > 0 || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">Filtros ativos:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Busca: "{searchTerm}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {Object.entries(activeFilters).map(([column, values]) =>
              values.map((value) => (
                <Badge key={`${column}-${value}`} variant="secondary" className="gap-1">
                  {value}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter(column, value, false)} />
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Protocolo</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Data</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Sistema</span>
                    <FilterPopover column="system" title="Sistema" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Módulo</span>
                    <FilterPopover column="module" title="Módulo" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Tipo</span>
                    <FilterPopover column="type" title="Tipo" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Área</span>
                    <FilterPopover column="area" title="Área" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Cliente</span>
                    <FilterPopover column="client" title="Cliente" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Responsável</span>
                    <FilterPopover column="responsible" title="Responsável" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Classificação</span>
                    <FilterPopover column="classification" title="Classificação" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    <FilterPopover column="status" title="Status" />
                  </div>
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemands.map((demand, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2">
                    <span className="font-medium text-[#04A4A1]">{demand.protocol}</span>
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-600">
                    {new Date(demand.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-600">{demand.system}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{demand.module}</td>
                  <td className="py-3 px-2">
                    <Badge variant="secondary" className={getTypeColor(demand.type)}>
                      {demand.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-600">{demand.area}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{demand.client}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{demand.responsible}</td>
                  <td className="py-3 px-2">
                    <Badge className={demand.classification === "Urgente" ? "bg-red-500 text-white" : demand.classification === "Médio" ? "bg-yellow-500 text-white" : "bg-gray-500 text-white"}>
                      {demand.classification}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Badge className={getStatusColor(demand.status)}>{demand.status}</Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDemands.length === 0 && (
          <div className="text-center py-4">
            <p className="text-slate-500">Nenhuma demanda encontrada com os filtros aplicados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
