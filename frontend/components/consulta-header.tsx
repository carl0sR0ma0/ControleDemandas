export function ConsultaHeader() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-[#04A4A1] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CD</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Controle de Demandas</h1>
        </div>
      </div>
    </header>
  )
}
