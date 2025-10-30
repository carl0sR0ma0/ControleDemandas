"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { getSystems, getModules, getVersions, getAreas, getUnits } from "@/lib/api/configs";
import { createDemand } from "@/lib/api/demands";
import { Classification, OccurrenceType, Priority } from "@/types/api";
import { getCurrentUser } from "@/hooks/useAuth";

export function NewDemandForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    description: "",
    reporterAreaId: "",
    occurrenceType: "",
    moduleId: "",
    systemId: "",
    systemVersionId: "",
    unitId: "",
    classification: "",
    priority: "",
    responsible: "",
    requesterUserId: "",
    documentUrl: "",
    observation: "",
  });
  const NO_SYSTEM_VERSION_VALUE = "__no_system_version__";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const user = getCurrentUser();
    if (!user?.id) return;
    setFormData((prev) =>
      prev.requesterUserId === user.id ? prev : { ...prev, requesterUserId: user.id },
    );
  }, []);
  // Opcoes (via API)
  const { data: systems = [] } = useQuery({ queryKey: ["cfg","systems"], queryFn: getSystems });
  const { data: areas = [] } = useQuery({ queryKey: ["cfg","areas"], queryFn: getAreas });
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
      if (!formData.requesterUserId) {
        alert("Nao foi possivel identificar o usuario solicitante.");
        setIsSubmitting(false);
        return;
      }
      const payload = {
        description: formData.description,
        observation: formData.observation || undefined,
        moduleId: formData.moduleId,
        requesterUserId: formData.requesterUserId,
        reporterAreaId: formData.reporterAreaId,
        occurrenceType: (Number(formData.occurrenceType) || OccurrenceType.Incremental) as OccurrenceType,
        unitId: formData.unitId,
        classification: (Number(formData.classification) || Classification.Baixo) as Classification,
        priority: (Number(formData.priority) || Priority.Media) as Priority,
        systemVersionId: formData.systemVersionId || undefined,
        documentUrl: formData.documentUrl || undefined,
        reporterEmail: undefined,
        responsible: formData.responsible || undefined,
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
              Sua solicitacao foi registrada no sistema.
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
              Um e-mail de confirmaAAo foi enviado com o numero do protocolo e
              detalhes da solicitacao.
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
          Informacoes da Demanda
        </h2>
        <p className="text-slate-600">
          Preencha todos os campos Obrigatorios para registrar sua solicitacao
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
            value={formData.occurrenceType}
            onValueChange={(value) => handleInputChange("occurrenceType", value)}
            required
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(OccurrenceType.Incremental)} id="incremental" />
              <Label htmlFor="incremental" className="flex items-center gap-1">
                Incremental
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    implementacao de algo novo ou evoluAAo
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(OccurrenceType.Melhoria)} id="melhoria" />
              <Label htmlFor="melhoria" className="flex items-center gap-1">
                Melhoria
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    pequeno ajuste de algo ja existente
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(OccurrenceType.Bug)} id="bug" />
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
              setFormData((prev) => ({ ...prev, systemId: value, moduleId: "", systemVersionId: "" }));
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

        {/* Modulo (dependente de Sistema) */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">
            Modulo <span className="text-red-500">*</span>
          </Label>
          <Select
            disabled={!formData.systemId}
            value={formData.moduleId}
            onValueChange={(value) => handleInputChange("moduleId", value)}
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={formData.systemId ? "Selecione o modulo" : "Selecione primeiro o sistema"} />
            </SelectTrigger>
            <SelectContent>
              {(modules || []).map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Versao (dependente de Sistema) */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Versao do Sistema</Label>
          <Select
            disabled={!formData.systemId}
            value={formData.systemVersionId}
            onValueChange={(value) =>
              handleInputChange(
                "systemVersionId",
                value === NO_SYSTEM_VERSION_VALUE ? "" : value,
              )
            }
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={formData.systemId ? "Selecione a versao" : "Selecione primeiro o sistema"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_SYSTEM_VERSION_VALUE}>Sem versao definida</SelectItem>
              {(versions || []).map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.version}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Relatora */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">
            Area Relatora <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.reporterAreaId}
            onValueChange={(value) => handleInputChange("reporterAreaId", value)}
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Selecione a area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsavel */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Responsavel</Label>
          <Input
            value={formData.responsible}
            onChange={(e) => handleInputChange("responsible", e.target.value)}
            placeholder="Informe quem sera responsavel"
            className={fieldClass}
          />
        </div>

        {/* Unidade */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Unidade</Label>
          <Select
            value={formData.unitId}
            onValueChange={(value) => handleInputChange("unitId", value)}
            required
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Classificacao */}
        <div className="space-y-3 col-span-12">
          <Label className="text-slate-700">
            Classificacao <span className="text-red-500">*</span>
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
              <RadioGroupItem value={String(Classification.Urgente)} id="urgente" />
              <Label htmlFor="urgente" className="flex items-center gap-1">
                <Badge variant="destructive">Urgente</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Indisponibilidade de sistema (impacto critico imediato)
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(Classification.Medio)} id="medio" />
              <Label htmlFor="medio" className="flex items-center gap-1">
                <Badge className="bg-yellow-500">Medio</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Falhas que impactam mas nao bloqueiam o uso
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(Classification.Baixo)} id="baixo" />
              <Label htmlFor="baixo" className="flex items-center gap-1">
                <Badge variant="secondary">Baixo</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Solicitacoes de melhoria ou ajustes
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Prioridade */}
        <div className="space-y-2 col-span-12">
          <Label htmlFor="priority" className="text-slate-700">
            Prioridade <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.priority}
            onValueChange={(value) =>
              handleInputChange("priority", value)
            }
            required
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(Priority.Baixa)} id="prioridade-baixa" />
              <Label htmlFor="prioridade-baixa" className="flex items-center gap-1">
                <Badge variant="secondary" className="bg-slate-400">Baixa (1)</Badge>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(Priority.Media)} id="prioridade-media" />
              <Label htmlFor="prioridade-media" className="flex items-center gap-1">
                <Badge className="bg-blue-500">Média (2)</Badge>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(Priority.Alta)} id="prioridade-alta" />
              <Label htmlFor="prioridade-alta" className="flex items-center gap-1">
                <Badge variant="destructive">Alta (3)</Badge>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="col-span-12" />

        {/* Descricao */}
        <div className="space-y-2 col-span-12">
          <Label htmlFor="description" className="text-slate-700">
            Descricao <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva detalhadamente sua solicitacao..."
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
            value={formData.documentUrl}
            onChange={(e) => handleInputChange("documentUrl", e.target.value)}
          />
        </div>

        {/* Observacao */}
        <div className="space-y-2 col-span-12">
          <Label htmlFor="observation" className="text-slate-700">
            Observacao
          </Label>
          <Textarea
            id="observation"
            placeholder="Informacoes adicionais..."
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
