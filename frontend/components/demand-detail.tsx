"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusStepper } from "@/components/status-stepper"
import { StatusHistoryTable } from "@/components/status-history-table"
import { NextActionsCard } from "@/components/next-actions-card"
import { Edit, Mail, Download, ArrowLeft } from "lucide-react"
import { EditDemandForm } from "@/components/edit-demand-form"
import Link from "next/link"
import { useState } from "react"

interface DemandDetailProps {
  protocol: string
}

export function DemandDetail({ protocol }: DemandDetailProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Mock data - in real app, fetch from API based on protocol
  const demand = {
    protocol: protocol,
    date: "2025-01-15",
    type: "Bug",
    area: "Tecnologia",
    system: "PGDI",
    module: "Indicadores",
    classification: "Urgente",
    status: "Execução",
    responsible: "João Silva",
    estimatedDate: "2025-01-20",
    document: "https://exemplo.com/documento.pdf",
    description:
      "O sistema de peso dos indicadores do PGDI não está funcionando corretamente. Quando o usuário tenta alterar o peso de um indicador, o sistema não salva as alterações e retorna um erro 500. Este problema está afetando a geração dos relatórios mensais.",
    attachments: ["screenshot-erro.png", "log-sistema.txt"],
    version: "2.1.0",
    observation: "Problema identificado após a última atualização do sistema.",
  }

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

  const getClassificationColor = (classification: string) => {
    const colors = {
      Urgente: "bg-red-500 text-white",
      Médio: "bg-yellow-500 text-white",
      Baixo: "bg-gray-500 text-white",
    }
    return colors[classification as keyof typeof colors] || "bg-gray-500 text-white"
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  if (isEditing) {
    return <EditDemandForm protocol={protocol} currentUserId="user-123" />
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
            <h1 className="text-3xl font-bold text-slate-800">Demanda #{demand.protocol}</h1>
            <p className="text-slate-600 mt-1">Detalhes da solicitação</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Notificar
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">#{demand.protocol}</CardTitle>
              <CardDescription>Criada em {new Date(demand.date).toLocaleDateString("pt-BR")}</CardDescription>
            </div>
            <Badge className={getStatusColor(demand.status)} variant="secondary">
              {demand.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Linha: Sistema, Módulo, Versão, Tipo */}
            <div>
              <span className="text-sm text-slate-600">Sistema</span>
              <p className="font-medium text-slate-800 mt-1">{demand.system}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Módulo</span>
              <p className="font-medium text-slate-800 mt-1">{demand.module}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Versão</span>
              <p className="font-medium text-slate-800 mt-1">{demand.version}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Tipo</span>
              <div className="mt-1">
                <Badge variant="secondary" className={getTypeColor(demand.type)}>
                  {demand.type}
                </Badge>
              </div>
            </div>

            {/* Linha: Área, Responsável, Classificação */}
            <div>
              <span className="text-sm text-slate-600">Área Relatora</span>
              <p className="font-medium text-slate-800 mt-1">{demand.area}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Responsável</span>
              <p className="font-medium text-slate-800 mt-1">{demand.responsible}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Classificação</span>
              <div className="mt-1">
                <Badge className={getClassificationColor(demand.classification)}>{demand.classification}</Badge>
              </div>
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
            {demand.attachments.length > 0 ? (
              <div className="space-y-2">
                {demand.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm text-slate-700">{attachment}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhum anexo disponível</p>
            )}
            {demand.document && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Documento</h4>
                  <a
                    href={demand.document}
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
          <StatusStepper currentStatus={demand.status} />
        </CardContent>
      </Card>

      {/* Next Actions */}
      <NextActionsCard
        protocol={demand.protocol}
        responsible={demand.responsible}
        estimatedDate={demand.estimatedDate}
      />

      {/* Status History */}
      <StatusHistoryTable protocol={demand.protocol} />
    </div>
  )
}
