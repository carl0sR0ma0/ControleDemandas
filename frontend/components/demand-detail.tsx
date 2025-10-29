"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusStepper } from "@/components/status-stepper"
import { StatusHistoryTable } from "@/components/status-history-table"
import { StatusUpdateCard } from "@/components/status-update-card"
import { Edit, Mail, Download, ArrowLeft } from "lucide-react"
import { EditDemandForm } from "@/components/edit-demand-form"
import Link from "next/link"
import { useState } from "react"
import { useDemandDetailByProtocol } from "@/hooks/useDemands"
import { OccurrenceType, Classification, DemandStatus } from "@/types/api"
import { useHasPermission, PERMS } from "@/hooks/useAuthGuard"

interface DemandDetailProps {
  protocol: string
}

export function DemandDetail({ protocol }: DemandDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { data: demand, isLoading, error } = useDemandDetailByProtocol(protocol)
  const canEdit = useHasPermission(PERMS.EditarDemanda)

  const getStatusColor = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.Aberta:
        return "bg-[#FFA726] text-white"
      case DemandStatus.Ranqueado:
        return "bg-[#B0BEC5] text-white"
      case DemandStatus.Documentacao:
        return "bg-[#29B6F6] text-white"
      case DemandStatus.Aprovacao:
        return "bg-[#66BB6A] text-white"
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

  const getStatusLabel = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.Aberta:
        return "Aberta"
      case DemandStatus.Ranqueado:
        return "Ranqueado"
      case DemandStatus.Documentacao:
        return "Documentação"
      case DemandStatus.Aprovacao:
        return "Aprovação"
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

  const getTypeColor = (type: OccurrenceType) => {
    switch (type) {
      case OccurrenceType.Bug:
        return "bg-red-100 text-red-800"
      case OccurrenceType.Incremental:
        return "bg-blue-100 text-blue-800"
      case OccurrenceType.Melhoria:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getClassificationColor = (classification: Classification) => {
    switch (classification) {
      case Classification.Urgente:
        return "bg-red-500 text-white"
      case Classification.Medio:
        return "bg-yellow-500 text-white"
      case Classification.Baixo:
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  if (error || !demand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Erro ao carregar demanda</p>
      </div>
    )
  }

  if (isEditing) {
    return (
      <EditDemandForm
        protocol={demand.protocol}
        currentUserId="user-123"
        onEditComplete={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/demandas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Detalhes da solicitação</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {canEdit && (
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Notificar
            </Button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">#{demand.protocol}</CardTitle>
              <CardDescription>Criada em {new Date(demand.openedAt).toLocaleDateString("pt-BR")}</CardDescription>
            </div>
            <Badge className={getStatusColor(demand.status)} variant="secondary">
              {getStatusLabel(demand.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Linha: Sistema, Módulo, Versão, Tipo */}
            <div>
              <span className="text-sm text-slate-600">Sistema</span>
              <p className="font-medium text-slate-800 mt-1">
                {demand.system && typeof demand.system === 'object' ? demand.system.name : "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Módulo</span>
              <p className="font-medium text-slate-800 mt-1">
                {demand.module && typeof demand.module === 'object' ? demand.module.name : "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Versão</span>
              <p className="font-medium text-slate-800 mt-1">
                {demand.systemVersion && typeof demand.systemVersion === 'object' ? demand.systemVersion.version : "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Tipo</span>
              <div className="mt-1">
                <Badge variant="secondary" className={getTypeColor(demand.occurrenceType)}>
                  {String(demand.occurrenceType)}
                </Badge>
              </div>
            </div>

            {/* Linha: Área, Unidade, Responsável, Classificação */}
            <div>
              <span className="text-sm text-slate-600">Área Relatora</span>
              <p className="font-medium text-slate-800 mt-1">
                {demand.reporterArea && typeof demand.reporterArea === 'object' ? demand.reporterArea.name : "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Unidade</span>
              <p className="font-medium text-slate-800 mt-1">
                {demand.unit && typeof demand.unit === 'object' ? demand.unit.name : "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Cliente</span>
              <p className="font-medium text-slate-800 mt-1">
                {typeof demand.responsible === 'string' ? demand.responsible : "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Classificação</span>
              <div className="mt-1">
                <Badge className={getClassificationColor(demand.classification)}>
                  {String(demand.classification)}
                </Badge>
              </div>
            </div>

            {/* Linha: Solicitante */}
            <div>
              <span className="text-sm text-slate-600">Solicitante</span>
              <p className="font-medium text-slate-800 mt-1">
                {demand.requester && typeof demand.requester === 'object' ? demand.requester.name : "—"}
              </p>
              {demand.requester && typeof demand.requester === 'object' && demand.requester.email && (
                <p className="text-sm text-slate-500">{demand.requester.email}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description and Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{demand.description}</p>
            {demand.observation && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Observação</h4>
                  <p className="text-slate-600">{demand.observation}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            {demand.attachments && demand.attachments.length > 0 ? (
              <div className="space-y-2">
                {demand.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex-1">
                      <span className="text-sm text-slate-700">{attachment.fileName}</span>
                      <p className="text-xs text-slate-500">
                        {(attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhum anexo disponível</p>
            )}
            {demand.documentUrl && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Documento</h4>
                  <a
                    href={demand.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#04A4A1] hover:underline"
                  >
                    Ver documento
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Andamento da Solicitação</CardTitle>
          <CardDescription>Acompanhe o progresso da sua demanda</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusStepper
            currentStatus={getStatusLabel(demand.status)}
            history={demand.history || []}
          />
        </CardContent>
      </Card>

      {/* Status Update */}
      <StatusUpdateCard
        demandId={demand.id}
        currentStatus={demand.status}
        currentResponsible={
          // Busca o responsável do último status (status atual) no histórico
          demand.history
            ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .find((h) => h.status === demand.status)?.responsibleUser || null
        }
        currentEstimatedDate={demand.estimatedDelivery}
      />

      {/* Status History */}
      <StatusHistoryTable history={demand.history || []} />
    </div>
  )
}
