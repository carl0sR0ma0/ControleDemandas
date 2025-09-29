import { DemandsTable } from "@/components/demands-table"

export default function DemandsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Demandas</h1>
          <p className="text-slate-600 mt-1">Gerencie todas as solicitações do sistema</p>
        </div>
      </div>
      <DemandsTable />
    </div>
  )
}
