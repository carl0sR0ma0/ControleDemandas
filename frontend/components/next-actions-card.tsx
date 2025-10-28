"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Save } from "lucide-react"

interface NextActionsCardProps {
  protocol: string
  responsible: string
  estimatedDate?: string
}

export function NextActionsCard({ protocol, responsible, estimatedDate }: NextActionsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newResponsible, setNewResponsible] = useState(responsible)
  const [newEstimatedDate, setNewEstimatedDate] = useState(estimatedDate || "")

  const handleSave = () => {
    // In real app, save to API
    setIsEditing(false)
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Próximas Ações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible" className="text-slate-700">
                Responsável da Próxima Ação
              </Label>
              {isEditing ? (
                <Input id="responsible" value={newResponsible} onChange={(e) => setNewResponsible(e.target.value)} />
              ) : (
                <p className="font-medium text-slate-800">{responsible}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-date" className="text-slate-700">
                Estimativa de Conclusão
              </Label>
              {isEditing ? (
                <div className="relative">
                  <Input
                    id="estimated-date"
                    type="date"
                    value={newEstimatedDate}
                    onChange={(e) => setNewEstimatedDate(e.target.value)}
                    className="pl-10"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              ) : (
                <p className="font-medium text-slate-800">
                  {estimatedDate ? new Date(estimatedDate).toLocaleDateString("pt-BR") : "Não definida"}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-[#04A4A1] hover:bg-[#038a87] text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Atualizar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
