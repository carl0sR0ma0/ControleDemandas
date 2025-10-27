"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ⬇️ hooks React Query da integração
import {
  useDemandDetail,
  useUpdateDemand,
  useUploadAttachments,
} from "@/hooks/useDemands";

interface EditDemandFormProps {
  protocol: string; // ← usamos como 'id' da demanda
  currentUserId?: string;
}

export function EditDemandForm({
  protocol,
  currentUserId,
}: EditDemandFormProps) {
  const router = useRouter();

  // ⬇️ carrega dados da demanda
  const { data, isLoading } = useDemandDetail(protocol);
  const update = useUpdateDemand(protocol);
  const upload = useUploadAttachments(protocol);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Mock: combos dependentes (mantive seu exemplo)
  const systemsData: Record<string, { modules: string[]; versions: string[] }> =
    {
      PGDI: {
        modules: ["PAP", "Ocorrências", "Online", "RTA"],
        versions: ["2.38.0", "2.38.1"],
      },
      PCP: {
        modules: ["Relatórios", "Planejamento", "Configurações", "Premissas"],
        versions: ["2.38.1", "2.39.0"],
      },
    };
  // estado do form inicializado a partir do detalhe
  const [formData, setFormData] = useState({
    description: "",
    module: "",
    responsible: currentUserId ?? "",
    area: "",
    system: "",
    type: "",
    classification: "",
    version: "",
    document: "",
    observation: "",
  });

  // quando o detalhe chegar, preenche o form
  useEffect(() => {
    if (!data) return;
    setFormData((prev) => ({
      ...prev,
      description: data.description ?? "",
      module: data.module ?? "",
      responsible: data.responsible ?? data.nextActionResponsible ?? currentUserId ?? "",
      area: data.reporterArea ?? "",
      system: data.productModule ?? "", // ajuste se no backend vier outro campo p/ sistema
      type: String(data.occurrenceType ?? "") || "",
      classification: String(data.classification ?? "") || "",
      version: data.systemVersion ?? "",
      document: data.documentUrl ?? "",
      observation: data.observation ?? "",
    }));
  }, [data, currentUserId]);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ⬇️ mapeia para o que a API aceita hoje (UpdateDemandDto)
      await update.mutateAsync({
        observation: formData.observation || undefined,
        documentUrl: formData.document || undefined,
        // nextActionResponsible / estimatedDelivery / order -> inclua se quiser expor esses campos
      });

      if (attachments.length > 0) {
        await upload.mutateAsync(attachments);
        setAttachments([]);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Erro ao atualizar demanda:", err);
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
              As informações da demanda #{data?.protocol ?? protocol} foram
              atualizadas.
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
          Editar Demanda #{data?.protocol ?? protocol}
        </h2>
        <p className="text-slate-600">
          Atualize as informações da demanda conforme necessário
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
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
            <RadioOption
              value="Incremental"
              label="Incremental"
              hint="implementação de algo novo ou evolução"
            />
            <RadioOption
              value="Melhoria"
              label="Melhoria"
              hint="pequeno ajuste de algo já existente"
            />
            <RadioOption
              value="Bug"
              label="Bug"
              hint="falha/erro que impede o funcionamento correto"
            />
          </RadioGroup>
        </div>

        {/* Sistema */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">
            Sistema <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.system}
            onValueChange={(value) =>
              setFormData((p) => ({
                ...p,
                system: value,
                module: "",
                version: "",
              }))
            }
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o sistema" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(systemsData).map((sys) => (
                <SelectItem key={sys} value={sys}>
                  {sys}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Módulo */}
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
              <SelectValue
                placeholder={
                  formData.system
                    ? "Selecione o módulo"
                    : "Selecione primeiro o sistema"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(formData.system
                ? systemsData[formData.system].modules
                : []
              ).map((mod) => (
                <SelectItem key={mod} value={mod}>
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Versão */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Versão do Sistema</Label>
          <Select
            disabled={!formData.system}
            value={formData.version}
            onValueChange={(value) => handleInputChange("version", value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  formData.system
                    ? "Selecione a versão"
                    : "Selecione primeiro o sistema"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(formData.system
                ? systemsData[formData.system].versions
                : []
              ).map((ver) => (
                <SelectItem key={ver} value={ver}>
                  {ver}
                </SelectItem>
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

        {/* Responsável */}
        <div className="space-y-2 col-span-12 md:col-span-6">
          <Label className="text-slate-700">Responsável</Label>
          <Input
            value={formData.responsible}
            onChange={(e) => handleInputChange("responsible", e.target.value)}
            placeholder="Informe o responsável"
          />
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
            <ClassRadio
              value="Urgente"
              badge={<Badge variant="destructive">Urgente</Badge>}
              hint="Indisponibilidade de sistema (impacto crítico imediato)"
            />
            <ClassRadio
              value="Médio"
              badge={<Badge className="bg-yellow-500">Médio</Badge>}
              hint="Falhas que impactam mas não bloqueiam o uso"
            />
            <ClassRadio
              value="Baixo"
              badge={<Badge variant="secondary">Baixo</Badge>}
              hint="Solicitações de melhoria ou ajustes"
            />
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
            disabled={isSubmitting || update.isPending || upload.isPending}
            className="bg-[#04A4A1] hover:bg-[#038a87] text-white"
          >
            {isSubmitting || update.isPending || upload.isPending
              ? "Salvando..."
              : "Atualizar Demanda"}
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

/* --- helpers visuais --- */
function RadioOption({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value={value} id={value} />
      <Label htmlFor={value} className="flex items-center gap-1">
        {label}
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </TooltipTrigger>
          <TooltipContent side="top">{hint}</TooltipContent>
        </Tooltip>
      </Label>
    </div>
  );
}

function ClassRadio({
  value,
  badge,
  hint,
}: {
  value: string;
  badge: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value={value} id={`class-${value}`} />
      <Label htmlFor={`class-${value}`} className="flex items-center gap-1">
        {badge}
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </TooltipTrigger>
          <TooltipContent side="top">{hint}</TooltipContent>
        </Tooltip>
      </Label>
    </div>
  );
}
