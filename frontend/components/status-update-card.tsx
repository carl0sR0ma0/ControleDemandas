"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { DemandStatus } from "@/types/api"
import { useChangeDemandStatus, useUpdateDemand } from "@/hooks/useDemands"
import { Badge } from "@/components/ui/badge"
import { useHasPermission, PERMS } from "@/hooks/useAuthGuard"
import { STATUS_TRANSITIONS } from "@/lib/status-transitions"

interface StatusUpdateCardProps {
  demandId: string
  currentStatus: DemandStatus
  currentResponsible?: string | null
  currentEstimatedDate?: string | null
}

const getStatusLabel = (status: DemandStatus) => {
  switch (status) {
    case DemandStatus.Aberta:
      return "Aberta"
    case DemandStatus.Arquivado:
      return "Arquivado"
    case DemandStatus.Ranqueado:
      return "Ranqueado"
    case DemandStatus.Aprovacao:
      return "Aprovação"
    case DemandStatus.Documentacao:
      return "Documentação"
    case DemandStatus.Execucao:
      return "Execução"
    case DemandStatus.Pausado:
      return "Pausado"
    case DemandStatus.Validacao:
      return "Validação"
    case DemandStatus.Concluida:
      return "Concluída"
    default:
      return status
  }
}

const getStatusColor = (status: DemandStatus) => {
  switch (status) {
    case DemandStatus.Aberta:
      return "bg-[#FFA726] text-white"
    case DemandStatus.Arquivado:
      return "bg-[#78909C] text-white"
    case DemandStatus.Ranqueado:
      return "bg-[#B0BEC5] text-white"
    case DemandStatus.Aprovacao:
      return "bg-[#66BB6A] text-white"
    case DemandStatus.Documentacao:
      return "bg-[#29B6F6] text-white"
    case DemandStatus.Execucao:
      return "bg-[#5C6BC0] text-white"
    case DemandStatus.Pausado:
      return "bg-[#FFA726] text-white"
    case DemandStatus.Validacao:
      return "bg-[#9C27B0] text-white"
    case DemandStatus.Concluida:
      return "bg-[#7CB342] text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export function StatusUpdateCard({
  demandId,
  currentStatus,
  currentResponsible,
  currentEstimatedDate,
}: StatusUpdateCardProps) {
  const canEditStatus = useHasPermission(PERMS.EditarStatus)

  // Converte ISO 8601 para YYYY-MM-DD para o input type="date"
  const formatDateForInput = (isoDate: string | null | undefined) => {
    if (!isoDate) return ""
    try {
      return isoDate.split("T")[0] // Pega apenas YYYY-MM-DD
    } catch {
      return ""
    }
  }

  const [isEditing, setIsEditing] = useState(false)
  const [newStatus, setNewStatus] = useState<DemandStatus | "">("")
  const [observation, setObservation] = useState("")
  const [responsible, setResponsible] = useState("")
  const [estimatedDate, setEstimatedDate] = useState(formatDateForInput(currentEstimatedDate))
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const changeStatusMutation = useChangeDemandStatus(demandId)
  const updateDemandMutation = useUpdateDemand(demandId)

  // Opções de status disponíveis baseadas no workflow
  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || []
  const isFinalStatus = availableStatuses.length === 0

  const handleCancel = () => {
    setIsEditing(false)
    setNewStatus("")
    setObservation("")
    setResponsible("")
    setEstimatedDate(formatDateForInput(currentEstimatedDate))
    setError("")
  }

  const handleSave = async () => {
    setError("")

    // Validações
    if (!newStatus) {
      setError("Selecione o novo status")
      return
    }

    if (!observation.trim()) {
      setError("A observação é obrigatória para registrar a mudança de status")
      return
    }

    try {
      // 1. Atualiza o status (registra no histórico automaticamente)
      await changeStatusMutation.mutateAsync({
        newStatus: newStatus as DemandStatus,
        note: observation,
        responsibleUser: responsible || undefined,
      })

      // 2. Atualiza data estimada se alterada
      const needsUpdate = estimatedDate !== formatDateForInput(currentEstimatedDate)

      if (needsUpdate) {
        // Converte data YYYY-MM-DD para ISO 8601 com timezone
        const estimatedDeliveryISO = estimatedDate
          ? new Date(estimatedDate + "T00:00:00").toISOString()
          : undefined

        await updateDemandMutation.mutateAsync({
          estimatedDelivery: estimatedDeliveryISO,
        })
      }

      // Sucesso!
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setIsEditing(false)
        setNewStatus("")
        setObservation("")
        setResponsible("")
      }, 2000)
    } catch (err) {
      console.error("Erro ao atualizar status:", err)
      setError("Erro ao atualizar o status. Tente novamente.")
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Atualização de Status</CardTitle>
        <CardDescription>
          Gerencie o status da demanda e registre o progresso no histórico
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Status atualizado com sucesso! O histórico foi registrado.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Status Atual */}
          <div className="flex items-center gap-2">
            <Label className="text-slate-700">Status Atual:</Label>
            <Badge className={getStatusColor(currentStatus)}>
              {getStatusLabel(currentStatus)}
            </Badge>
            {isFinalStatus && (
              <span className="text-sm text-slate-500">(Status final)</span>
            )}
          </div>

          {!isFinalStatus && canEditStatus && (
            <>
              {isEditing ? (
                <>
                  {/* Novo Status */}
                  <div className="space-y-2">
                    <Label htmlFor="new-status" className="text-slate-700">
                      Novo Status <span className="text-red-500">*</span>
                    </Label>
                    <Select value={newStatus} onValueChange={(value) => setNewStatus(value as DemandStatus)}>
                      <SelectTrigger id="new-status">
                        <SelectValue placeholder="Selecione o novo status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Responsável */}
                  <div className="space-y-2">
                    <Label htmlFor="responsible" className="text-slate-700">
                      Responsável
                    </Label>
                    <Input
                      id="responsible"
                      value={responsible}
                      onChange={(e) => setResponsible(e.target.value)}
                      placeholder="Nome do responsável responsável pelo novo status"
                    />
                    <p className="text-xs text-slate-500">
                      Pessoa que será responsável pela ação do novo status
                    </p>
                  </div>

                  {/* Observação */}
                  <div className="space-y-2">
                    <Label htmlFor="observation" className="text-slate-700">
                      Observação <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="observation"
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="Descreva o que precisa ser feito neste status ou contexto adicional..."
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      Esta observação será registrada no histórico da demanda
                    </p>
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <Label htmlFor="estimated-date" className="text-slate-700">
                      Estimativa de Conclusão
                    </Label>
                    <div className="relative">
                      <Input
                        id="estimated-date"
                        type="date"
                        value={estimatedDate}
                        onChange={(e) => setEstimatedDate(e.target.value)}
                        className="pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={changeStatusMutation.isPending || updateDemandMutation.isPending}
                      className="bg-[#04A4A1] hover:bg-[#038a87] text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {changeStatusMutation.isPending || updateDemandMutation.isPending
                        ? "Salvando..."
                        : "Salvar Atualização"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={changeStatusMutation.isPending || updateDemandMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Visualização: Responsável e Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-slate-600 text-sm">
                        Responsável do Status Atual
                      </Label>
                      <p className="font-medium text-slate-800">
                        {currentResponsible || "Não atribuído"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-600 text-sm">
                        Estimativa de Conclusão
                      </Label>
                      <p className="font-medium text-slate-800">
                        {estimatedDate
                          ? new Date(estimatedDate).toLocaleDateString("pt-BR")
                          : "Não definida"}
                      </p>
                    </div>
                  </div>

                  {canEditStatus && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2">
                      Atualizar Status
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {isFinalStatus && (
            <Alert>
              <AlertDescription>
                Esta demanda está concluída. O status não pode mais ser alterado.
              </AlertDescription>
            </Alert>
          )}

          {!isFinalStatus && !canEditStatus && (
            <Alert>
              <AlertDescription>
                Você não tem permissão para atualizar o status desta demanda.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
