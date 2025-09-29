import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  // In a real app, check if user is authenticated and redirect to dashboard
  // For now, show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Controle de Demandas</h1>
          <p className="text-slate-600">Sistema de Gestão de Solicitações</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
