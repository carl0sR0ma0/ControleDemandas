import { ProtocolLookup } from "@/components/protocol-lookup"

export default function ConsultarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-hidden">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Consultar Protocolo</h1>
            <p className="text-slate-600 text-lg">
              Digite o número do protocolo da sua solicitação para acompanhar o andamento
            </p>
          </div>

          <ProtocolLookup />

          {/* Instructions */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Como usar</h2>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#04A4A1] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <p>Digite o número do protocolo que você recebeu por e-mail quando criou a solicitação</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#04A4A1] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <p>Clique em "Consultar" para ver o status atual da sua demanda</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#04A4A1] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <p>Acompanhe o progresso através do timeline de status</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Não encontrou seu protocolo ou precisa de ajuda?{" "}
              <a href="mailto:suporte@exemplo.com" className="text-[#04A4A1] hover:underline">
                Entre em contato conosco
              </a>
            </p>
          </div>
        </div>
      </main>

    </div>
  )
}
