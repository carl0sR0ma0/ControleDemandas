"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { listBacklogs, createBacklog } from "@/lib/api/backlogs";
import { FolderPlus, ChevronLeft } from "lucide-react";

const createBacklogSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
});

type CreateBacklogForm = z.infer<typeof createBacklogSchema>;

interface ManageBacklogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDemandIds: string[];
  onBacklogSelected: (backlogId: string, backlogName: string) => void;
}

export function ManageBacklogsModal({
  open,
  onOpenChange,
  selectedDemandIds,
  onBacklogSelected
}: ManageBacklogsModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: backlogsData, isLoading } = useQuery({
    queryKey: ["backlogs", "list"],
    queryFn: () => listBacklogs(1, 100),
    enabled: open,
  });

  const backlogs = backlogsData?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBacklogForm>({
    resolver: zodResolver(createBacklogSchema),
  });

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleBack = () => {
    setIsCreating(false);
    reset();
  };

  const onSubmit = async (data: CreateBacklogForm) => {
    setIsSubmitting(true);
    try {
      const result = await createBacklog({
        name: data.name,
        demandIds: [],
      });

      toast({
        title: "Backlog criado",
        description: `Backlog "${data.name}" foi criado com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ["backlogs"] });

      reset();
      setIsCreating(false);
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

  const handleSelectBacklog = (backlogId: string, backlogName: string) => {
    onBacklogSelected(backlogId, backlogName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[600px] !w-[600px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreating && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            {isCreating ? "Criar Novo Backlog" : "Gerenciar Backlogs"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Digite o nome do novo backlog"
              : `Selecione um backlog para vincular ${selectedDemandIds.length} demanda(s)`}
          </DialogDescription>
        </DialogHeader>

        {isCreating ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#04A4A1] hover:bg-[#038a87] cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : "Criar Backlog"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-2">
              {isLoading ? (
                <p className="text-center py-4 text-slate-500">Carregando...</p>
              ) : backlogs.length === 0 ? (
                <p className="text-center py-4 text-slate-500">Nenhum backlog encontrado</p>
              ) : (
                backlogs.map((backlog) => (
                  <div
                    key={backlog.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleSelectBacklog(backlog.id, backlog.name)}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{backlog.name}</p>
                      <p className="text-sm text-slate-500">
                        {backlog.demandsCount} demanda(s)
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#04A4A1] hover:bg-[#038a87]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBacklog(backlog.id, backlog.name);
                      }}
                    >
                      Selecionar
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="flex-row justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateNew}
                className="cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Criar Novo Backlog
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
