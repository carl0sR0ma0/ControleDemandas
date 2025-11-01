"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDemandPriority } from "@/lib/api/backlogs";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PriorityCellProps {
  demandId: string;
  currentPriority: number | null;
  canEdit: boolean;
}

export function PriorityCell({ demandId, currentPriority, canEdit }: PriorityCellProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPriority, setPendingPriority] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getPriorityColor = (priority: number | null) => {
    if (!priority) return "bg-gray-400 text-white";
    if (priority === 1) return "bg-red-600 text-white";
    if (priority === 2) return "bg-orange-500 text-white";
    if (priority === 3) return "bg-yellow-500 text-white";
    if (priority === 4) return "bg-blue-500 text-white";
    return "bg-slate-400 text-white";
  };

  const getPriorityLabel = (priority: number | null) => {
    if (!priority) return "Definir";
    return `Prioridade ${priority}`;
  };

  const applyPriority = async (newPriority: number | null) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDemandPriority(demandId, { priority: newPriority });
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      toast({
        title: "Prioridade atualizada",
        description: `Prioridade ${newPriority !== null ? `definida para ${newPriority}` : "removida"} com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar prioridade",
        description: "Nao foi possivel atualizar a prioridade da demanda.",
      });
      console.error("Error updating priority:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = (newValue: string) => {
    const newPriority = newValue === "null" ? null : Number(newValue);
    // De null -> algum valor: sem confirmacao
    if (currentPriority === null && newPriority !== null) {
      void applyPriority(newPriority);
      return;
    }
    // Ja existe prioridade e vai alterar (inclusive para null): confirmar
    if (currentPriority !== null && newPriority !== currentPriority) {
      setPendingPriority(newPriority);
      setConfirmOpen(true);
    }
  };

  if (!canEdit) {
    return (
      <Badge className={getPriorityColor(currentPriority)}>
        {currentPriority ?? "Sem prioridade"}
      </Badge>
    );
  }

  const confirmText =
    pendingPriority === null
      ? `Isto ira remover a prioridade ${currentPriority ?? "-"}.`
      : `Isto ira alterar a prioridade ${currentPriority ?? "-"} para ${pendingPriority}.`;

  return (
    <>
      <Select
        value={currentPriority?.toString() ?? "null"}
        onValueChange={handlePriorityChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue>
            <Badge className={getPriorityColor(currentPriority)}>
              {getPriorityLabel(currentPriority)}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">
            <span className="text-gray-600">Sem prioridade</span>
          </SelectItem>
          <SelectItem value="1">
            <Badge className="bg-red-600 text-white">Prioridade 1</Badge>
          </SelectItem>
          <SelectItem value="2">
            <Badge className="bg-orange-500 text-white">Prioridade 2</Badge>
          </SelectItem>
          <SelectItem value="3">
            <Badge className="bg-yellow-500 text-white">Prioridade 3</Badge>
          </SelectItem>
          <SelectItem value="4">
            <Badge className="bg-blue-500 text-white">Prioridade 4</Badge>
          </SelectItem>
          <SelectItem value="5">
            <Badge className="bg-slate-400 text-white">Prioridade 5</Badge>
          </SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteracao de prioridade</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingPriority ?? null;
                setConfirmOpen(false);
                void applyPriority(target);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
