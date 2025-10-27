"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Filter, X } from "lucide-react"

export function DashboardFilters() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    area: "",
    module: "",
    responsavel: "",
    status: "",
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      area: "",
      module: "",
      responsavel: "",
      status: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <Card className="border-0 shadow-sm mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-600" />
          <span className="font-medium text-slate-700">Filtros</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-sm text-slate-600">
              Data Inicial
            </Label>
            <div className="relative">
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-sm text-slate-600">
              Data Final
            </Label>
            <div className="relative">
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Área Relatora</Label>
            <Select value={filters.area} onValueChange={(value) => handleFilterChange("area", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Engenharia">Engenharia</SelectItem>
                <SelectItem value="PMO">PMO</SelectItem>
                <SelectItem value="CX">CX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Módulo</Label>
            <Select value={filters.module} onValueChange={(value) => handleFilterChange("module", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PGDI - Configuração">PGDI - Configuração</SelectItem>
                <SelectItem value="PAP">PAP</SelectItem>
                <SelectItem value="Ocorrências">Ocorrências</SelectItem>
                <SelectItem value="Dashboard">Dashboard</SelectItem>
                <SelectItem value="Relatório">Relatório</SelectItem>
                <SelectItem value="PCP">PCP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Responsável</Label>
            <Input
              value={filters.responsavel}
              onChange={(e) => handleFilterChange("responsavel", e.target.value)}
              placeholder="Buscar por responsável"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ranqueado">Ranqueado</SelectItem>
                <SelectItem value="Aprovação">Aprovação</SelectItem>
                <SelectItem value="Execução">Execução</SelectItem>
                <SelectItem value="Validação">Validação</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
