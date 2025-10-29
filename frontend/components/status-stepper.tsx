"use client"

import React from "react"
import { CheckCircle, Circle, Clock, CircleCheckBig } from "lucide-react"
import { DemandStatus, type StatusHistory } from "@/types/api"

interface StatusStepperProps {
  currentStatus: string
  history: StatusHistory[]
}

export function StatusStepper({ currentStatus, history }: StatusStepperProps) {
  const statusOrder = [
    { key: DemandStatus.Aberta, name: "Aberta", color: "#FFA726" },
    { key: DemandStatus.Ranqueado, name: "Ranqueado", color: "#B0BEC5" },
    { key: DemandStatus.Aprovacao, name: "Aprovação", color: "#66BB6A" },
    { key: DemandStatus.Execucao, name: "Execução", color: "#5C6BC0" },
    { key: DemandStatus.Validacao, name: "Validação", color: "#9C27B0" },
    { key: DemandStatus.Concluida, name: "Concluída", color: "#7CB342" },
  ]

  // Map history to get dates for each status
  const historyMap = new Map(
    history.map((h) => [h.status, h.date])
  )

  const steps = statusOrder.map((s) => ({
    name: s.name,
    color: s.color,
    date: historyMap.get(s.key) || "",
  }))

  const currentIndex = steps.findIndex((step) => step.name === currentStatus)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.name} className="flex flex-col items-center relative z-10 flex-1">
              {/* Círculo */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${isCompleted ? "bg-green-500 border-green-500 text-white" : isCurrent ? "border-2 text-white" : "bg-slate-200 border-slate-300 text-slate-400"}`}
                style={{
                  backgroundColor: isCurrent ? step.color : isCompleted ? "#10b981" : undefined,
                  borderColor: isCurrent ? step.color : isCompleted ? "#10b981" : undefined,
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

              {/* Linha inferior: labels */}
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${isCompleted || isCurrent ? "text-slate-800" : "text-slate-400"}`}>
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
