import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DemandStatus, type StatusHistory } from "@/types/api"

interface StatusHistoryTableProps {
  history: StatusHistory[]
}

const getStatusLabel = (status: DemandStatus) => {
  switch (status) {
    case DemandStatus.Aberta:
      return "Aberta"
    case DemandStatus.Ranqueado:
      return "Ranqueado"
    case DemandStatus.Aprovacao:
      return "Aprovação"
    case DemandStatus.Execucao:
      return "Execução"
    case DemandStatus.Validacao:
      return "Validação"
    case DemandStatus.Concluida:
      return "Concluída"
    default:
      return status
  }
}

export function StatusHistoryTable({ history }: StatusHistoryTableProps) {
  // Sort history by date descending (most recent first)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Histórico de Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Data</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Alterado por</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Observação</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((entry, index) => (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="py-3 px-2 font-medium text-slate-800">{getStatusLabel(entry.status)}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{new Date(entry.date).toLocaleString("pt-BR")}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{entry.author}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{entry.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
