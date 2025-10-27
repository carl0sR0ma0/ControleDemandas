"use client"

import { useEffect, useMemo, useState } from "react"

type LoadingStepsProps = {
  steps?: string[]
  intervalMs?: number
}

export function LoadingSteps({
  steps: customSteps,
  intervalMs = 450,
}: LoadingStepsProps) {
  const steps = useMemo(
    () =>
      customSteps ?? [
        "Preparando layout",
        "Conectando à API",
        "Carregando dados iniciais",
        "Renderizando componentes",
        "Aplicando estilos",
        "Carregado!",
      ],
    [customSteps],
  )
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx >= steps.length - 1) return
    const t = setTimeout(() => setIdx((v) => Math.min(v + 1, steps.length - 1)), intervalMs)
    return () => clearTimeout(t)
  }, [idx, intervalMs, steps.length])

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-4 text-slate-700">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" aria-label="carregando" />
        <div className="text-sm">
          {steps.map((s, i) => (
            <div key={i} className={`transition-opacity ${i <= idx ? "opacity-100" : "opacity-30"}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

