'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusStepper } from '@/components/status-stepper';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { getPublicDemandByProtocol } from '@/lib/api/demands';
import { DemandStatus, OccurrenceType } from '@/types/api';

interface PublicDemandResult {
  protocol: string;
  openedAt: string;
  occurrenceType: string;
  description: string;
  observation: string | null;
  status: string;
  estimatedDelivery: string | null;
  steps: Array<{
    status: string;
    date: string;
    author: string;
    note: string | null;
  }>;
}

export function ProtocolLookup() {
  const [protocol, setProtocol] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PublicDemandResult | null>(
    null
  );
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol.trim()) {
      setError('Por favor, digite um número de protocolo');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      // Clean protocol input (remove # if present)
      const cleanProtocol = protocol.replace('#', '').trim();

      // Call the public API endpoint
      const result = await getPublicDemandByProtocol(cleanProtocol);
      setSearchResult(result);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(
          'Protocolo não encontrado. Verifique o número e tente novamente.'
        );
      } else {
        setError('Erro ao buscar protocolo. Tente novamente mais tarde.');
      }
      console.error('Erro ao buscar protocolo:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Aberta: 'bg-[#FFA726] text-white',
      Ranqueado: 'bg-[#B0BEC5] text-white',
      Aprovacao: 'bg-[#66BB6A] text-white',
      Execucao: 'bg-[#5C6BC0] text-white',
      Validacao: 'bg-[#9C27B0] text-white',
      Concluida: 'bg-[#7CB342] text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      Aberta: 'Aberta',
      Ranqueado: 'Ranqueado',
      Aprovacao: 'Aprovação',
      Execucao: 'Execução',
      Validacao: 'Validação',
      Concluida: 'Concluída',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Bug: 'bg-red-100 text-red-800',
      Incremental: 'bg-blue-100 text-blue-800',
      Melhoria: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Buscar Protocolo
          </CardTitle>
          <CardDescription>
            Digite o número do protocolo para consultar o status da sua demanda
          </CardDescription>
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
              Protocolo encontrado! Veja abaixo o status atual da sua
              solicitação.
            </AlertDescription>
          </Alert>

          {/* Demand Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">
                    Protocolo #{searchResult.protocol}
                  </CardTitle>
                  <CardDescription>
                    Criada em{' '}
                    {new Date(searchResult.openedAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={getTypeColor(searchResult.occurrenceType)}
                  >
                    {searchResult.occurrenceType}
                  </Badge>
                  <Badge className={getStatusColor(searchResult.status)}>
                    {getStatusLabel(searchResult.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Descrição</h3>
                <p className="text-slate-600 leading-relaxed">
                  {searchResult.description}
                </p>
              </div>

              {/* Observation */}
              {searchResult.observation && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Observação
                  </h3>
                  <p className="text-slate-600">{searchResult.observation}</p>
                </div>
              )}

              {/* Estimated Delivery or Delivery */}
              {searchResult.estimatedDelivery && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Previsão de Entrega
                  </h3>
                  <p className="text-slate-600">
                    {new Date(
                      searchResult.estimatedDelivery
                    ).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Andamento da Solicitação</CardTitle>
              <CardDescription>
                Acompanhe o progresso da sua demanda através das etapas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusStepper
                currentStatus={getStatusLabel(searchResult.status)}
                history={searchResult.steps.map((step) => ({
                  id: step.date,
                  status: step.status as DemandStatus,
                  date: step.date,
                  author: step.author,
                  note: step.note,
                }))}
              />
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="border-0 shadow-sm bg-slate-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-slate-800">
                  Precisa de mais informações?
                </h3>
                <p className="text-slate-600 text-sm">
                  Para detalhes adicionais ou dúvidas sobre sua solicitação,
                  entre em contato conosco informando o protocolo #
                  {searchResult.protocol}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
