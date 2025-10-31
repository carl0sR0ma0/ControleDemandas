"use client"

import React, { useState, useEffect } from "react"
import { Info, X } from "lucide-react"
import { DemandStatus } from "@/types/api"
import { createPortal } from "react-dom"

interface StatusFlowDiagramProps {
  className?: string
}

// Workflow completo do sistema
const STATUS_TRANSITIONS: Record<DemandStatus, DemandStatus[]> = {
  [DemandStatus.Aberta]: [DemandStatus.Arquivado, DemandStatus.Ranqueado, DemandStatus.Concluida],
  [DemandStatus.Arquivado]: [DemandStatus.Ranqueado, DemandStatus.Aberta],
  [DemandStatus.Ranqueado]: [DemandStatus.Aprovacao, DemandStatus.Arquivado, DemandStatus.Aberta, DemandStatus.Concluida],
  [DemandStatus.Aprovacao]: [DemandStatus.Documentacao, DemandStatus.Ranqueado, DemandStatus.Concluida],
  [DemandStatus.Documentacao]: [DemandStatus.Execucao, DemandStatus.Aprovacao, DemandStatus.Concluida],
  [DemandStatus.Execucao]: [DemandStatus.Pausado, DemandStatus.Validacao, DemandStatus.Documentacao, DemandStatus.Concluida],
  [DemandStatus.Pausado]: [DemandStatus.Execucao, DemandStatus.Validacao],
  [DemandStatus.Validacao]: [DemandStatus.Concluida, DemandStatus.Pausado, DemandStatus.Execucao],
  [DemandStatus.Concluida]: [],
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

export function StatusFlowDiagram({ className = "" }: StatusFlowDiagramProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredStatus, setHoveredStatus] = useState<DemandStatus | null>(null)

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
    return (
      <div className="space-y-6">
        {/* Título */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800">Fluxo de Status da Demanda</h3>
          <p className="text-sm text-slate-600 mt-1">Visualize os possíveis caminhos que uma demanda pode percorrer</p>
        </div>

        {/* Diagrama */}
        <div className="space-y-3">
          {STATUS_INFO.map((statusInfo) => {
            const transitions = getTransitionsFrom(statusInfo.key)
            const isHovered = hoveredStatus === statusInfo.key
            const isHighlighted = hoveredStatus
              ? hoveredStatus === statusInfo.key || transitions.includes(hoveredStatus)
              : false

            return (
              <div
                key={statusInfo.key}
                className={`transition-all ${isHighlighted ? "opacity-100" : hoveredStatus ? "opacity-30" : "opacity-100"}`}
                onMouseEnter={() => setHoveredStatus(statusInfo.key)}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                {/* Status atual */}
                <div className="flex items-center gap-3">
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium text-sm shadow-md min-w-[140px] text-center cursor-help"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    {statusInfo.name}
                  </div>
                  <div className="flex-1 text-xs text-slate-600">{statusInfo.description}</div>
                </div>

                {/* Transições possíveis */}
                {transitions.length > 0 && (
                  <div className="ml-8 mt-2 flex items-center gap-2">
                    <div className="text-slate-400 text-xs font-medium">Pode ir para:</div>
                    <div className="flex flex-wrap gap-2">
                      {transitions.map((nextStatus) => {
                        const nextInfo = STATUS_INFO.find((s) => s.key === nextStatus)
                        if (!nextInfo) return null
                        return (
                          <div
                            key={nextStatus}
                            className="px-3 py-1 rounded text-white text-xs font-medium shadow-sm"
                            style={{ backgroundColor: nextInfo.color }}
                          >
                            {nextInfo.name}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Status final */}
                {transitions.length === 0 && (
                  <div className="ml-8 mt-2 text-xs text-slate-500 italic">Status final - não pode ser alterado</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="border-t pt-4 mt-6">
          <p className="text-xs text-slate-600 text-center">
            <strong>Dica:</strong> Passe o mouse sobre um status para destacar suas possíveis transições
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
              <div className="p-6">{renderFlowDiagram()}</div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
