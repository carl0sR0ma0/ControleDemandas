"use client"

import React, { useState, useEffect } from "react"
import { Info, X } from "lucide-react"
import { DemandStatus } from "@/types/api"
import { createPortal } from "react-dom"
import { STATUS_TRANSITIONS } from "@/lib/status-transitions"

interface StatusFlowDiagramProps {
  className?: string
  currentStatus?: DemandStatus
}

const STATUS_INFO = [
  { key: DemandStatus.Aberta, name: "Aberta", color: "#FFA726", description: "Demanda criada e aguardando análise" },
  { key: DemandStatus.Arquivado, name: "Arquivado", color: "#78909C", description: "Demanda arquivada/suspensa" },
  { key: DemandStatus.Ranqueado, name: "Ranqueado", color: "#B0BEC5", description: "Priorizada no backlog" },
  { key: DemandStatus.Aprovacao, name: "Aprovação", color: "#66BB6A", description: "Aguardando aprovação da diretoria" },
  { key: DemandStatus.Documentacao, name: "Documentação", color: "#29B6F6", description: "Especificação e documentação" },
  { key: DemandStatus.Execucao, name: "Execução", color: "#5C6BC0", description: "Em desenvolvimento" },
  { key: DemandStatus.Pausado, name: "Pausado", color: "#FFA726", description: "Desenvolvimento pausado" },
  { key: DemandStatus.Validacao, name: "Validação", color: "#9C27B0", description: "Em testes/validação" },
  { key: DemandStatus.Concluida, name: "Concluída", color: "#7CB342", description: "Finalizada e entregue" },
]

export function StatusFlowDiagram({ className = "", currentStatus }: StatusFlowDiagramProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredStatus, setHoveredStatus] = useState<DemandStatus | null>(null)
  const [tooltipStatus, setTooltipStatus] = useState<DemandStatus | null>(null)

  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Previne scroll do body quando modal está aberto
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const getTransitionsFrom = (status: DemandStatus): DemandStatus[] => {
    return STATUS_TRANSITIONS[status] || []
  }

  const renderFlowDiagram = () => {
    // Organizar status em linhas para layout horizontal
    const mainFlowStatuses = [
      DemandStatus.Aberta,
      DemandStatus.Ranqueado,
      DemandStatus.Aprovacao,
      DemandStatus.Documentacao,
      DemandStatus.Execucao,
      DemandStatus.Validacao,
      DemandStatus.Concluida,
    ]

    const secondaryStatuses = [DemandStatus.Arquivado, DemandStatus.Pausado]

    const renderStatusCard = (statusKey: DemandStatus) => {
      const statusInfo = STATUS_INFO.find((s) => s.key === statusKey)
      if (!statusInfo) return null

      const transitions = getTransitionsFrom(statusInfo.key)
      const transitionsFromHovered = hoveredStatus ? getTransitionsFrom(hoveredStatus) : []
      const isHighlighted = hoveredStatus
        ? hoveredStatus === statusInfo.key || transitionsFromHovered.includes(statusInfo.key)
        : false
      const isHovered = hoveredStatus === statusInfo.key
      // Comparação flexível: aceita tanto o enum quanto a string (com ou sem acento)
      const isCurrent =
        currentStatus === statusInfo.key ||
        currentStatus === statusInfo.name ||
        String(currentStatus) === String(statusInfo.key)
      const showTooltip = tooltipStatus === statusInfo.key

      return (
        <div
          key={statusKey}
          className={`relative flex flex-col items-center transition-all duration-300 ${
            isHighlighted ? "opacity-100 scale-105" : hoveredStatus ? "opacity-30 scale-95" : "opacity-100"
          }`}
          onMouseEnter={() => {
            setHoveredStatus(statusInfo.key)
            setTooltipStatus(statusInfo.key)
          }}
          onMouseLeave={() => {
            setHoveredStatus(null)
            setTooltipStatus(null)
          }}
        >
          {/* Tooltip Elegante - Renderizado via Portal para ultrapassar limites da div */}
          {showTooltip &&
            typeof window !== "undefined" &&
            createPortal(
              <div
                className="fixed z-[10001] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none"
                style={{
                  top: `${
                    document
                      .getElementById(`status-card-${statusKey}`)
                      ?.getBoundingClientRect().top ?? 0
                  }px`,
                  left: `${
                    (document.getElementById(`status-card-${statusKey}`)?.getBoundingClientRect().left ?? 0) +
                    (document.getElementById(`status-card-${statusKey}`)?.getBoundingClientRect().width ?? 0) / 2
                  }px`,
                  transform: "translate(-50%, -100%)",
                  marginTop: "-12px",
                }}
              >
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium whitespace-nowrap">
                  {statusInfo.description}
                  {transitions.length > 0 && (
                    <div className="text-slate-300 mt-1">
                      Pode ir para: {transitions.length} {transitions.length === 1 ? "status" : "status"} (
                      {transitions
                        .map((t) => STATUS_INFO.find((s) => s.key === t)?.name)
                        .filter(Boolean)
                        .join(", ")}
                      )
                    </div>
                  )}
                  {transitions.length === 0 && (
                    <div className="text-slate-300 mt-1">Não pode mais ser alterado</div>
                  )}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              </div>,
              document.body
            )}

          {/* Card do Status */}
          <div
            id={`status-card-${statusKey}`}
            className={`relative px-5 py-3 rounded-xl text-white font-semibold text-sm shadow-lg cursor-pointer
              transition-all duration-300 min-w-[120px] text-center
              ${isHovered ? "ring-4 ring-white ring-opacity-50 shadow-2xl" : ""}
              ${isCurrent ? "ring-4 ring-yellow-400 ring-opacity-80" : ""}`}
            style={{ backgroundColor: statusInfo.color }}
          >
            {/* Badge "Status Atual" */}
            {isCurrent && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                ATUAL
              </div>
            )}
            <div className="font-bold text-sm">{statusInfo.name}</div>
          </div>

          {/* Descrição (apenas em mobile ou quando não hover) */}
          {!showTooltip && (
            <div className="mt-2 text-[10px] text-slate-500 text-center max-w-[120px] lg:hidden">
              {statusInfo.description}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Título */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800">Fluxo de Status da Demanda</h3>
          <p className="text-sm text-slate-600 mt-2">
            Passe o mouse sobre um status para destacar suas possíveis transições
          </p>
        </div>

        {/* Diagrama Horizontal */}
        <div className="space-y-8">
          {/* Fluxo Principal */}
          <div className="py-6">
            <div className="text-xs font-semibold text-slate-500 mb-4 text-center">FLUXO PRINCIPAL</div>
            <div className="flex items-center justify-center gap-3 flex-nowrap overflow-x-auto px-8 py-4">
              {mainFlowStatuses.map((status, index) => (
                <React.Fragment key={status}>
                  {renderStatusCard(status)}
                  {index < mainFlowStatuses.length - 1 && (
                    <div className="text-slate-300 text-xl font-light flex-shrink-0">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Status Secundários */}
          <div className="py-4">
            <div className="text-xs font-semibold text-slate-500 mb-4 text-center">STATUS ALTERNATIVOS</div>
            <div className="flex items-center justify-center gap-8 px-8 py-4">
              {secondaryStatuses.map((status) => renderStatusCard(status))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="border-t pt-4 mt-6">
          <p className="text-xs text-slate-500 text-center italic">
            Os status alternativos podem ser acessados de múltiplos pontos do fluxo
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Botão de ícone */}
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-full hover:bg-slate-100 transition-colors group relative ${className}`}
        title="Ver fluxo completo de status"
      >
        <Info className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
      </button>

      {/* Modal */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-200/40 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Fluxo de Status</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-8 pb-8">{renderFlowDiagram()}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
