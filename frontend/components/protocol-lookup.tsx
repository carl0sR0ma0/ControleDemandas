"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusStepper } from "@/components/status-stepper"
import { Search, AlertCircle, CheckCircle } from "lucide-react"

export function ProtocolLookup() {
  const [protocol, setProtocol] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [error, setError] = useState("")

  // Mock data for demonstration
  const mockDemands = {
    "2025-000123": {
      protocol: "2025-000123",
      date: "2025-01-15",
      type: "Bug",
      status: "Execução",
      description: "Peso dos indicadores do PGDI não funciona",
      observation: "Problema identificado e em correção pela equipe de desenvolvimento",
      estimatedDate: "2025-01-20",
    },
    "2025-000124": {
      protocol: "2025-000124",
      date: "2025-01-14",
      type: "Incremental",
      status: "Aprovação",
      description: "Recuperação de Senha",
      observation: "Aprovação da diretoria para implementação",
      estimatedDate: "2025-01-25",
    },
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!protocol.trim()) {
      setError("Por favor, digite um número de protocolo")
      return
    }

    setIsSearching(true)
    setError("")
    setSearchResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Clean protocol input (remove # if present)
    const cleanProtocol = protocol.replace("#", "").trim()

    // Check if protocol exists in mock data
    const result = mockDemands[cleanProtocol as keyof typeof mockDemands]

    if (result) {
      setSearchResult(result)
    } else {
      setError("Protocolo não encontrado. Verifique o número e tente novamente.")
    }

    setIsSearching(false)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Ranqueado: "bg-[#7CB342] text-white",
      Aprovação: "bg-[#66BB6A] text-white",
      Execução: "bg-[#5C6BC0] text-white",
      Validação: "bg-[#B0BEC5] text-white",
      Concluída: "bg-[#BDBDBD] text-white",
    }
    return colors[status as keyof typeof colors] || "bg-gray-500 text-white"
  }

  const getTypeColor = (type: string) => {
    const colors = {
      Bug: "bg-red-100 text-red-800",
      Incremental: "bg-blue-100 text-blue-800",
      Melhoria: "bg-green-100 text-green-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-slate-800">Buscar Protocolo</CardTitle>
          <CardDescription>Digite o número do protocolo para consultar o status da sua demanda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Ex: 2025-000123 ou #2025-000123"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="pl-10 text-center text-lg font-mono border-slate-200 focus:border-[#04A4A1] focus:ring-[#04A4A1]"
                  disabled={isSearching}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-[#04A4A1] hover:bg-[#038a87] text-white text-lg py-6"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Consultar Protocolo
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <div className="space-y-6">
          {/* Success Alert */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Protocolo encontrado! Veja abaixo o status atual da sua solicitação.
            </AlertDescription>
          </Alert>

          {/* Demand Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Protocolo #{searchResult.protocol}</CardTitle>
                  <CardDescription>Criada em {new Date(searchResult.date).toLocaleDateString("pt-BR")}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className={getTypeColor(searchResult.type)}>
                    {searchResult.type}
                  </Badge>
                  <Badge className={getStatusColor(searchResult.status)}>{searchResult.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Descrição</h3>
                <p className="text-slate-700">{searchResult.description}</p>
              </div>

              {/* Observation */}
              {searchResult.observation && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Observação</h3>
                  <p className="text-slate-600">{searchResult.observation}</p>
                </div>
              )}

              {/* Estimated Date */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Previsão de Entrega</h3>
                <p className="text-slate-700">{new Date(searchResult.estimatedDate).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Andamento da Solicitação</CardTitle>
              <CardDescription>Acompanhe o progresso da sua demanda através das etapas</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusStepper currentStatus={searchResult.status} />
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="border-0 shadow-sm bg-slate-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-slate-800">Precisa de mais informações?</h3>
                <p className="text-slate-600 text-sm">
                  Para detalhes adicionais ou dúvidas sobre sua solicitação, entre em contato conosco informando o
                  protocolo #{searchResult.protocol}
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <a href="mailto:suporte@exemplo.com" className="text-[#04A4A1] hover:underline text-sm font-medium">
                    suporte@exemplo.com
                  </a>
                  <span className="text-slate-400">|</span>
                  <a href="tel:+5511999999999" className="text-[#04A4A1] hover:underline text-sm font-medium">
                    (11) 99999-9999
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sample Protocols for Testing */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 mb-2">Para testar o sistema</h3>
            <p className="text-slate-600 text-sm mb-3">Use um dos protocolos de exemplo abaixo:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setProtocol("2025-000123")}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-mono hover:bg-slate-50 transition-colors"
              >
                2025-000123
              </button>
              <button
                onClick={() => setProtocol("2025-000124")}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-mono hover:bg-slate-50 transition-colors"
              >
                2025-000124
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
