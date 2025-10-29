"use client"

import { NewDemandForm } from "@/components/new-demand-form"
import { useAuthGuard, PERMS } from "@/hooks/useAuthGuard"

// Pagina full-width (sem card/modal), ocupando area ao lado do sidebar

export default function NewDemandPage() {
  useAuthGuard(PERMS.RegistrarDemandas)

  return (
    <div className="w-full h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Nova Demanda</h1>
        <p className="text-slate-600 mt-1">Registre uma nova solicitacao no sistema</p>
      </div>
      <NewDemandForm />
    </div>
  )
}
