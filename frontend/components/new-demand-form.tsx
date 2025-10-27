"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getSystems, getModules, getVersions, getAreas, getClients, getUnits } from "@/lib/api/configs";
import { createDemand } from "@/lib/api/demands";
import type { Classification, OccurrenceType } from "@/types/api";

export function NewDemandForm({ currentUserId }: { currentUserId?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    description: "",
    module: "",
    responsible: currentUserId ?? "",
    area: "",
    systemId: "",
    type: "",
    classification: "",
    client: "",
    unit: "",
    version: "",
    document: "",
    observation: "",
  });
  // Opções (via API)
  const { data: systems = [] } = useQuery({ queryKey: ["cfg","systems"], queryFn: getSystems });
  const { data: areas = [] } = useQuery({ queryKey: ["cfg","areas"], queryFn: getAreas });
  const { data: clients = [] } = useQuery({ queryKey: ["cfg","clients"], queryFn: getClients });
  const { data: units = [] } = useQuery({ queryKey: ["cfg","units"], queryFn: getUnits });
  const { data: versions = [] } = useQuery({ queryKey: ["cfg","versions", formData.systemId], queryFn: () => formData.systemId ? getVersions(formData.systemId) : Promise.resolve([]), enabled: !!formData.systemId });
  const { data: modules = [] } = useQuery({ queryKey: ["cfg","modules", formData.systemId], queryFn: () => formData.systemId ? getModules(formData.systemId) : Promise.resolve([]), enabled: !!formData.systemId });

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
      const payload = {
        description: formData.description,
        observation: formData.observation || undefined,
        module: formData.module,
        requesterResponsible: formData.responsible || "",
        reporterArea: formData.area,
        occurrenceType: (formData.type || "") as unknown as OccurrenceType,
        unit: formData.unit || "",
        classification: (formData.classification || "Baixo") as unknown as Classification,
        client: formData.client || undefined,
        priority: undefined,
        systemVersion: formData.version || undefined,
        reporter: undefined,
        productModule: undefined,
        documentUrl: formData.document || undefined,
        order: undefined,
        reporterEmail: undefined,
      };
      const res = await createDemand(payload);
      setGeneratedProtocol(res.protocol);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full h-full px-0 py-6 ">
        <div className="w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Demanda Criada com Sucesso!
            </h2>
            <p className="text-slate-600 mb-4">
              Sua solicitação foi registrada no sistema.
            </p>
            <div className="bg-[#04A4A1] text-white px-6 py-3 rounded-lg inline-block">
              <span className="text-sm font-medium">Protocolo:</span>
              <span className="text-xl font-bold ml-2">
                #{generatedProtocol}
              </span>
            </div>
          </div>
          <Alert>
            <AlertDescription>
              Um e-mail de confirmaÃ§Ã£o foi enviado com o número do protocolo e
              detalhes da solicitação.
            </AlertDescription>
          </Alert>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push(`/demandas/${generatedProtocol}`)}
              className="bg-[#04A4A1] hover:bg-[#038a87]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Cadastrar Nova
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fieldClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 focus-visible:border-teal-500 placeholder:text-slate-400";
  const triggerClass = "w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 focus-visible:border-teal-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full px-0 py-2"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Informações da Demanda
        </h2>
        <p className="text-slate-600">
          Preencha todos os campos Obrigatórios para registrar sua solicitação
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Selecionais primeiro */}
        

        

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
                    implementação de algo novo ou evoluÃ§Ã£o
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
            value={formData.systemId}
            onValueChange={(value) => {
              // Reset dependents when changing Sistema
              setFormData((prev) => ({ ...prev, system: value, module: "", version: "" }));
            }}
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Selecione o sistema" />
            </SelectTrigger>
            <SelectContent>
              {systems.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
            disabled={!formData.systemId}
            value={formData.module}
            onValueChange={(value) => handleInputChange("module", value)}
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={formData.systemId ? "Selecione o módulo" : "Selecione primeiro o sistema"} />
            </SelectTrigger>
            <SelectContent>
              {(modules || []).map((m) => (
                <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Versão (dependente de Sistema) */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Versão do Sistema</Label>
          <Select
            disabled={!formData.systemId}
            value={formData.version}
            onValueChange={(value) => handleInputChange("version", value)}
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={formData.systemId ? "Selecione a versão" : "Selecione primeiro o sistema"} />
            </SelectTrigger>
            <SelectContent>
              {(versions || []).map((v) => (
                <SelectItem key={v.id} value={v.version}>{v.version}</SelectItem>
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
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
              ))}
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
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unidade */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Unidade</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => handleInputChange("unit", value)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
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
            className={`resize-none col-span-12 ${fieldClass}`}
          />
        </div>

        {/* Anexos */}
        <div className="space-y-2 col-span-12">
          <Label className="text-slate-700">Anexos</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center col-span-12 bg-white dark:bg-slate-900">
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
            className={`resize-none ${fieldClass}`}
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
            {isSubmitting ? "Salvando..." : "Salvar Demanda"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}










