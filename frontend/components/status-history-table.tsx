import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusHistoryTableProps {
  protocol: string
}

export function StatusHistoryTable({ protocol }: StatusHistoryTableProps) {
  // Mock data - in real app, fetch from API
  const history = [
    {
      status: "Execução",
      date: "2025-01-17 10:15",
      author: "Maria Santos",
      observation: "Iniciando desenvolvimento da correção",
    },
    {
      status: "Aprovação",
      date: "2025-01-16 14:20",
      author: "João Silva",
      observation: "Demanda aprovada para execução",
    },
    {
      status: "Ranqueado",
      date: "2025-01-15 09:30",
      author: "Sistema",
      observation: "Demanda criada e ranqueada automaticamente",
    },
  ]

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
              {history.map((entry, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 px-2 font-medium text-slate-800">{entry.status}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{new Date(entry.date).toLocaleString("pt-BR")}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{entry.author}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{entry.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
