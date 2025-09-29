"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle, FileText, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface EditDemandFormProps {
  protocol: string;
  currentUserId?: string;
}

export function EditDemandForm({ protocol, currentUserId }: EditDemandFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    description: "",
    module: "",
    responsible: currentUserId ?? "",
    area: "",
    system: "",
    type: "",
    classification: "",
    client: "",
    version: "",
    document: "",
    observation: "",
  });

  // Mocked models for cascading selects (Sistema -> Módulo/Versão) and Clientes
  const systemsData: Record<string, { modules: string[]; versions: string[] }> = {
    PGDI: {
      modules: ["PAP", "Ocorrências", "Online", "RTA"],
      versions: ["2.38.0", "2.38.1"],
    },
    PCP: {
      modules: ["Relatórios", "Planejamento", "Configurações", "Premissas"],
      versions: ["2.38.1", "2.39.0"],
    },
  };
  const clientsMock = [
    "Cliente A",
    "Cliente B",
    "Cliente C",
  ];

  // Load demand data when component mounts
  useEffect(() => {
    const loadDemandData = async () => {
      setIsLoading(true);
      try {
        // Mock API call - in real app, fetch from API based on protocol
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with actual API call
        const mockDemandData = {
          protocol: protocol,
          date: "2025-01-15",
          type: "Bug",
          area: "Tecnologia",
          system: "PGDI",
          module: "Indicadores",
          client: "Interno",
          classification: "Urgente",
          status: "Execução",
          responsible: "João Silva",
          estimatedDate: "2025-01-20",
          document: "https://exemplo.com/documento.pdf",
          description:
            "O sistema de peso dos indicadores do PGDI não está funcionando corretamente. Quando o usuário tenta alterar o peso de um indicador, o sistema não salva as alterações e retorna um erro 500. Este problema está afetando a geração dos relatórios mensais.",
          attachments: ["screenshot-erro.png", "log-sistema.txt"],
          version: "2.1.0",
          observation: "Problema identificado após a última atualização do sistema.",
        };

        // Update form data with loaded demand data
        setFormData({
          description: mockDemandData.description,
          module: mockDemandData.module,
          responsible: mockDemandData.responsible,
          area: mockDemandData.area,
          system: mockDemandData.system,
          type: mockDemandData.type,
          classification: mockDemandData.classification,
          client: mockDemandData.client,
          version: mockDemandData.version,
          document: mockDemandData.document || "",
          observation: mockDemandData.observation || "",
        });
      } catch (error) {
        console.error("Erro ao carregar dados da demanda:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDemandData();
  }, [protocol]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call for update
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSubmitted(true);
    } catch (error) {
      console.error("Erro ao atualizar demanda:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full px-0 py-6 ml-4 mr-4">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#04A4A1] mx-auto mb-2"></div>
            <p className="text-slate-600">Carregando dados da demanda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="w-full h-full px-0 py-6 ml-4 mr-4">
        <div className="w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Demanda Atualizada com Sucesso!
            </h2>
            <p className="text-slate-600 mb-4">
              As alterações foram salvas no sistema.
            </p>
          </div>
          <Alert>
            <AlertDescription>
              As informações da demanda #{protocol} foram atualizadas.
            </AlertDescription>
          </Alert>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push(`/demandas/${protocol}`)}
              className="bg-[#04A4A1] hover:bg-[#038a87]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Editar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-h-[calc(100vh-64px)] px-0 py-6 pr-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Editar Demanda #{protocol}
        </h2>
        <p className="text-slate-600">
          Atualize as informações da demanda conforme necessário
        </p>
      </div>

      <div
        className="grid grid-cols-12 gap-4"
      >
        {/* Tipo */}
        <div className="space-y-3 col-span-12">
          <Label className="text-slate-700">
            Tipo de Demanda <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value)}
            required
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Incremental" id="incremental" />
              <Label htmlFor="incremental" className="flex items-center gap-1">
                Incremental
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    implementação de algo novo ou evolução
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Melhoria" id="melhoria" />
              <Label htmlFor="melhoria" className="flex items-center gap-1">
                Melhoria
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    pequeno ajuste de algo já existente
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Bug" id="bug" />
              <Label htmlFor="bug" className="flex items-center gap-1">
                Bug
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    falha/erro que impede o funcionamento correto
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Sistema */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">
            Sistema <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.system}
            onValueChange={(value) => {
              // Reset dependents when changing Sistema
              setFormData((prev) => ({ ...prev, system: value, module: "", version: "" }));
            }}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o sistema" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(systemsData).map((sys) => (
                <SelectItem key={sys} value={sys}>{sys}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Módulo (dependente de Sistema) */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">
            Módulo <span className="text-red-500">*</span>
          </Label>
          <Select
            disabled={!formData.system}
            value={formData.module}
            onValueChange={(value) => handleInputChange("module", value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={formData.system ? "Selecione o módulo" : "Selecione primeiro o sistema"} />
            </SelectTrigger>
            <SelectContent>
              {(formData.system ? systemsData[formData.system].modules : []).map((mod) => (
                <SelectItem key={mod} value={mod}>{mod}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Versão (dependente de Sistema) */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Versão do Sistema</Label>
          <Select
            disabled={!formData.system}
            value={formData.version}
            onValueChange={(value) => handleInputChange("version", value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={formData.system ? "Selecione a versão" : "Selecione primeiro o sistema"} />
            </SelectTrigger>
            <SelectContent>
              {(formData.system ? systemsData[formData.system].versions : []).map((ver) => (
                <SelectItem key={ver} value={ver}>{ver}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Área Relatora */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">
            Área Relatora <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.area}
            onValueChange={(value) => handleInputChange("area", value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              <SelectItem value="Engenharia">Engenharia</SelectItem>
              <SelectItem value="PMO">PMO</SelectItem>
              <SelectItem value="CX">CX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cliente (selecionável) */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Cliente</Label>
          <Select
            value={formData.client}
            onValueChange={(value) => handleInputChange("client", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientsMock.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classificação */}
        <div className="space-y-3 col-span-12">
          <Label className="text-slate-700">
            Classificação <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.classification}
            onValueChange={(value) =>
              handleInputChange("classification", value)
            }
            required
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Urgente" id="urgente" />
              <Label htmlFor="urgente" className="flex items-center gap-1">
                <Badge variant="destructive">Urgente</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Indisponibilidade de sistema (impacto crítico imediato)
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Médio" id="medio" />
              <Label htmlFor="medio" className="flex items-center gap-1">
                <Badge className="bg-yellow-500">Médio</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Falhas que impactam mas não bloqueiam o uso
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Baixo" id="baixo" />
              <Label htmlFor="baixo" className="flex items-center gap-1">
                <Badge variant="secondary">Baixo</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Solicitações de melhoria ou ajustes
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="col-span-12" />

        {/* Descrição */}
        <div className="space-y-2 col-span-12">
          <Label htmlFor="description" className="text-slate-700">
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva detalhadamente sua solicitação..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
            rows={4}
            className="resize-none col-span-12"
          />
        </div>

        {/* Anexos */}
        <div className="space-y-2 col-span-12">
          <Label className="text-slate-700">Anexos</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center col-span-12">
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-slate-600 mb-2">
              Clique para selecionar arquivos ou arraste aqui
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Selecionar Arquivos
            </Button>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded"
                >
                  <span className="text-sm text-slate-600">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documento */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label htmlFor="document" className="text-slate-700">
            Documento (URL)
          </Label>
          <Input
            id="document"
            type="url"
            placeholder="https://exemplo.com/documento"
            value={formData.document}
            onChange={(e) => handleInputChange("document", e.target.value)}
          />
        </div>

        {/* Observação */}
        <div className="space-y-2 col-span-12">
          <Label htmlFor="observation" className="text-slate-700">
            Observação
          </Label>
          <Textarea
            id="observation"
            placeholder="Informações adicionais..."
            value={formData.observation}
            onChange={(e) => handleInputChange("observation", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-4 w-full justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#04A4A1] hover:bg-[#038a87] text-white"
          >
            {isSubmitting ? "Salvando..." : "Atualizar Demanda"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/demandas/${protocol}`)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
