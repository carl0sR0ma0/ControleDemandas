"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createBacklog } from "@/lib/api/backlogs";
import type { DemandListItem } from "@/types/api";

const createBacklogSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
});

type CreateBacklogForm = z.infer<typeof createBacklogSchema>;

interface CreateBacklogModalProps {
  open: boolean;
  onOpenChange: (open: boolean | undefined) => void;
  demands: DemandListItem[];
}

export function CreateBacklogModal({ open, onOpenChange, demands }: CreateBacklogModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBacklogForm>({
    resolver: zodResolver(createBacklogSchema),
  });

  // Verificar se há demandas sem prioridade
  const hasDemandsWithoutPriority = demands.some(d => !d.priority);

  console.log("Estado do botão:", {
    isSubmitting,
    demandsLength: demands.length,
    hasDemandsWithoutPriority,
    disabled: isSubmitting || demands.length === 0 || hasDemandsWithoutPriority
  });

  const onSubmit = async (data: CreateBacklogForm) => {
    console.log("onSubmit chamado", { data, demands });

    if (demands.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhuma demanda disponível para criar o backlog.",
      });
      return;
    }

    // Validar se todas as demandas têm prioridade definida
    const demandsWithoutPriority = demands.filter(d => !d.priority);

    if (demandsWithoutPriority.length > 0) {
      toast({
        variant: "destructive",
        title: "Prioridade não definida",
        description: `${demandsWithoutPriority.length} demanda(s) não possui(em) prioridade definida. Por favor, defina a prioridade antes de criar o backlog.`,
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Criando backlog...", { name: data.name, demandIds: demands.map(d => d.id) });

    try {
      const result = await createBacklog({
        name: data.name,
        demandIds: demands.map(d => d.id),
      });

      console.log("Backlog criado com sucesso", result);

      toast({
        title: "Backlog criado",
        description: `Backlog "${data.name}" foi criado com sucesso com ${demands.length} demanda(s).`,
      });

      // Invalidar cache para recarregar a lista de demandas
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["backlogs"] });

      // Resetar e fechar com sucesso
      reset();
      onOpenChange(true); // passar true para indicar sucesso
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar backlog",
        description: "Não foi possível criar o backlog. Tente novamente.",
      });
      console.error("Error creating backlog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[85vw] !w-[85vw] !h-[80vh] !max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Backlog</DialogTitle>
          <DialogDescription>
            Crie um novo backlog e associe demandas a ele
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            console.log("Form onSubmit event triggered", e);
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-4 flex-1 flex flex-col overflow-hidden"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Backlog *</Label>
            <Input
              id="name"
              placeholder="Digite o nome do backlog"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between">
              <Label>Demandas ({demands.length} selecionada{demands.length !== 1 ? 's' : ''})</Label>
            </div>

            <div className="border rounded-lg p-4 flex-1 overflow-y-auto space-y-2">
              {demands.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma demanda disponível
                </p>
              ) : (
                demands.map((demand) => {
                  const hasPriority = demand.priority !== null && demand.priority !== undefined;
                  return (
                    <div
                      key={demand.id}
                      className={`flex items-start p-3 rounded border cursor-default ${
                        !hasPriority ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#04A4A1]">
                            #{demand.protocol}
                          </span>
                          {!hasPriority && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                              Sem prioridade
                            </span>
                          )}
                          {hasPriority && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                              Prioridade {demand.priority}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 line-clamp-2 mt-1">
                          {demand.module?.name || "—"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {hasDemandsWithoutPriority && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Atenção: Algumas demandas não possuem prioridade definida.
                  Defina a prioridade de todas as demandas antes de criar o backlog.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(undefined); // undefined = cancelar sem sucesso
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#04A4A1] hover:bg-[#038a87] cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting || demands.length === 0 || hasDemandsWithoutPriority}
            >
              {isSubmitting ? "Criando..." : "Criar Backlog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
