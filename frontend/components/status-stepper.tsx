"use client"

import React, { useState, useRef } from "react"
import { CheckCircle, Circle, Clock, CircleCheckBig } from "lucide-react"
import { DemandStatus, type StatusHistory } from "@/types/api"
import { detectStatusRegressions, getRegressionColor } from "@/lib/status-regression"
import { createPortal } from "react-dom"

interface StatusStepperProps {
  currentStatus: string
  history: StatusHistory[]
  showNoteTooltips?: boolean
}

interface TooltipPortalProps {
  children: React.ReactNode
  targetRef: React.RefObject<HTMLDivElement>
  show: boolean
}

function TooltipPortal({ children, targetRef, show }: TooltipPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 10,
        left: rect.left + rect.width / 2,
      })
    }
  }, [show, targetRef])

  if (!show || typeof window === "undefined") return null

  return createPortal(
    <div
      className="fixed transform -translate-x-1/2 -translate-y-full transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  )
}

export function StatusStepper({ currentStatus, history, showNoteTooltips = false }: StatusStepperProps) {
  const allStatusDefinitions = [
    { key: DemandStatus.Aberta, name: "Aberta", color: "#FFA726" },
    { key: DemandStatus.Arquivado, name: "Arquivado", color: "#78909C" },
    { key: DemandStatus.Ranqueado, name: "Ranqueado", color: "#B0BEC5" },
    { key: DemandStatus.Aprovacao, name: "Aprovação", color: "#66BB6A" },
    { key: DemandStatus.Documentacao, name: "Documentação", color: "#29B6F6" },
    { key: DemandStatus.Execucao, name: "Execução", color: "#5C6BC0" },
    { key: DemandStatus.Pausado, name: "Pausado", color: "#FFA726" },
    { key: DemandStatus.Validacao, name: "Validação", color: "#9C27B0" },
    { key: DemandStatus.Concluida, name: "Concluída", color: "#7CB342" },
  ]

  // Detecta retrocessos no histórico
  const regressions = detectStatusRegressions(history)

  // Map history to get dates for each status
  const historyMap = new Map(
    history.map((h) => [h.status, h.date])
  )

  // Ordenar histórico por data (mais antigo primeiro) para garantir ordem cronológica correta
  const sortedHistory = [...history].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Filtrar apenas os status que aparecem no histórico da demanda
  // Mantém a ordem cronológica do histórico (primeira aparição de cada status)
  const uniqueStatusOrder: string[] = []
  const seen = new Set<string>()

  for (const h of sortedHistory) {
    if (!seen.has(h.status)) {
      uniqueStatusOrder.push(h.status)
      seen.add(h.status)
    }
  }

  // Mapear para as definições completas mantendo a ordem cronológica
  const statusOrder = uniqueStatusOrder
    .map(status => allStatusDefinitions.find(def => def.key === status || def.name === status))
    .filter((def): def is typeof allStatusDefinitions[0] => def !== undefined)

  const steps = statusOrder.map((s) => ({
    name: s.name,
    key: s.key,
    color: s.color,
    date: historyMap.get(s.key) || "",
    regressionCount: regressions.get(s.key) || 0,
    regressionColor: getRegressionColor(regressions.get(s.key) || 0),
  }))

  const currentIndex = steps.findIndex((step) => step.key === currentStatus || step.name === currentStatus)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoveredNoteIndex, setHoveredNoteIndex] = useState<number | null>(null)
  const circleRefs = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className="w-full overflow-x-auto relative">
      <div className="flex items-center relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const hasRegression = step.regressionCount > 0

          // Busca a nota do histórico para este status
          const historyEntry = history.find((h) => h.status === step.key || h.status === step.name)
          const hasNote = showNoteTooltips && historyEntry?.note

          return (
            <div key={step.name} className="flex flex-col items-center relative z-10 flex-1">
              {/* Círculo com Tooltip */}
              <div className="relative">
                <div
                  ref={(el) => {
                    circleRefs.current[index] = el
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                    hasRegression ? "border-4 shadow-lg cursor-help" : hasNote ? "cursor-help" : ""
                  } ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "border-2 text-white"
                        : "bg-slate-200 border-slate-300 text-slate-400"
                  }`}
                  style={{
                    backgroundColor: hasRegression
                      ? step.regressionColor
                      : isCurrent
                        ? step.color
                        : isCompleted
                          ? "#10b981"
                          : undefined,
                    borderColor: hasRegression
                      ? step.regressionColor
                      : isCurrent
                        ? step.color
                        : isCompleted
                          ? "#10b981"
                          : undefined,
                  }}
                  onMouseEnter={() => {
                    if (hasRegression) {
                      setHoveredIndex(index)
                    } else if (hasNote) {
                      setHoveredNoteIndex(index)
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null)
                    setHoveredNoteIndex(null)
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    step.name === "Concluída" ? (
                      <CircleCheckBig className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Tooltip de Retrocesso usando Portal */}
                {hasRegression && hoveredIndex === index && (
                  <TooltipPortal
                    targetRef={{ current: circleRefs.current[index] }}
                    show={hoveredIndex === index}
                  >
                    <div className="px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap">
                      <div className="font-bold mb-1 text-center" style={{ color: step.regressionColor }}>
                        ⚠ Retrabalho Detectado
                      </div>
                      <div className="text-center">
                        Esta etapa teve{" "}
                        <span className="font-bold" style={{ color: step.regressionColor }}>
                          {step.regressionCount} retrocesso{step.regressionCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-center text-slate-300 mt-1">
                        {step.regressionCount === 1
                          ? "A demanda retornou para esta fase 1 vez"
                          : `A demanda retornou para esta fase ${step.regressionCount} vezes`}
                      </div>
                      {/* Seta do tooltip */}
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "6px solid #1e293b",
                        }}
                      />
                    </div>
                  </TooltipPortal>
                )}

                {/* Tooltip de Observação usando Portal */}
                {hasNote && !hasRegression && hoveredNoteIndex === index && (
                  <TooltipPortal
                    targetRef={{ current: circleRefs.current[index] }}
                    show={hoveredNoteIndex === index}
                  >
                    <div className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-xl max-w-xs">
                      <div className="font-bold mb-1 text-center">
                        📝 Observação
                      </div>
                      <div className="text-center">
                        {historyEntry?.note}
                      </div>
                      {historyEntry?.responsibleUser && (
                        <div className="text-center text-blue-100 mt-1 text-[10px]">
                          Responsável: {historyEntry.responsibleUser}
                        </div>
                      )}
                      {/* Seta do tooltip */}
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "6px solid #2563eb",
                        }}
                      />
                    </div>
                  </TooltipPortal>
                )}
              </div>

              {/* Linha inferior: labels */}
              <div className="mt-2 text-center">
                <p
                  className={`text-sm font-medium ${
                    hasRegression
                      ? "font-bold"
                      : isCompleted || isCurrent
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                  style={{
                    color: hasRegression ? step.regressionColor : undefined,
                  }}
                >
                  {step.name}
                </p>
                {step.date && (
                  <p className="text-xs text-slate-500 mt-1">{new Date(step.date).toLocaleString("pt-BR")}</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Conectores sobrepostos */}
        <div className="absolute top-5 left-0 right-0 flex pointer-events-none">
          <div className="flex-1" />
          {steps.slice(0, -1).map((_, index) => (
            <React.Fragment key={`connector-${index}`}>
              <div
                className="h-px rounded-full flex-1"
                style={{
                  backgroundColor: index < currentIndex ? "#10b981" : "#9ca3af",
                }}
              />
              <div className="flex-1" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
