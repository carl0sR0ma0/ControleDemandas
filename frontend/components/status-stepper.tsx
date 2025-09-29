"use client"

import React from "react"
import { CheckCircle, Circle, Clock } from "lucide-react"

interface StatusStepperProps {
  currentStatus: string
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const steps = [
    { name: "Ranqueado", color: "#7CB342", date: "2025-01-15 09:30" },
    { name: "Aprovação", color: "#66BB6A", date: "2025-01-16 14:20" },
    { name: "Execução", color: "#5C6BC0", date: "2025-01-17 10:15" },
    { name: "Validação", color: "#B0BEC5", date: "" },
    { name: "Concluída", color: "#BDBDBD", date: "" },
  ]

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
                  <Clock className="w-5 h-5" />
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
