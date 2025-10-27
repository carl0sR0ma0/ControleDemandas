"use client"

import { useIsFetching, useIsMutating } from "@tanstack/react-query"

// Loader global baseado em atividades de rede do React Query
export function QueryLoader() {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const active = fetching + mutating > 0

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* barra superior */}
      <div className="fixed left-0 right-0 top-0 h-0.5 overflow-hidden">
        <div className="h-full w-2/3 animate-[loading_0.8s_ease-in-out_infinite] rounded-r-full"
             style={{ background: "linear-gradient(90deg, #04A4A1 0%, #0595B7 50%, #04A4A1 100%)" }} />
      </div>

      {/* badge no canto (discreto) */}
      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-slate-700 shadow-sm">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#04A4A1] border-r-transparent" />
        Carregando...
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-66%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  )
}

