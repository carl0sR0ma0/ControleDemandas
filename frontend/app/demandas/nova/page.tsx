import { NewDemandForm } from "@/components/new-demand-form"
// Página full-width (sem card/modal), ocupando área ao lado do sidebar

export default function NewDemandPage() {
  return (
    <div className="w-full h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Nova Demanda</h1>
        <p className="text-slate-600 mt-1">Registre uma nova solicitação no sistema</p>
      </div>
      {/* TODO: substituir pelo ID real do usuário autenticado */}
      <NewDemandForm currentUserId="user-123" />
    </div>
  )
}
