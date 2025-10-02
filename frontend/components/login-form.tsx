"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

// ⬇️ Hook de auth via React Query (ajuste o caminho se necessário)
import { useLogin } from "@/hooks/useAuth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const { mutateAsync: login, isPending } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // chama /auth/login na API; o hook já salva token e usuário no localStorage
      await login({ email, password })
      router.replace("/dashboard")
    } catch (err: any) {
      const msg =
        err?.response?.status === 401
          ? "Credenciais inválidas."
          : "Erro ao fazer login. Tente novamente."
      setError(msg)
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-slate-800">Entrar</CardTitle>
        <CardDescription className="text-slate-600">
          Acesse sua conta para gerenciar demandas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-slate-200 focus:border-[#04A4A1] focus:ring-[#04A4A1]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-slate-200 focus:border-[#04A4A1] focus:ring-[#04A4A1]"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#04A4A1] hover:bg-[#038a87] text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="text-center">
            <a href="#" className="text-sm text-[#04A4A1] hover:underline">
              Esqueci minha senha
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
