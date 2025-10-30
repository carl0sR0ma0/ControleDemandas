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

interface PriorityCellProps {
  demandId: string;
  currentPriority: number | null;
  canEdit: boolean;
}

export function PriorityCell({ demandId, currentPriority, canEdit }: PriorityCellProps) {
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handlePriorityChange = async (newValue: string) => {
    if (isUpdating) return;

    const newPriority = newValue === "null" ? null : Number(newValue);

    setIsUpdating(true);
    try {
      await updateDemandPriority(demandId, { priority: newPriority });

      // Invalidar cache para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ["demands"] });

      toast({
        title: "Prioridade atualizada",
        description: `Prioridade ${newPriority ? `definida para ${newPriority}` : "removida"} com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar prioridade",
        description: "Não foi possível atualizar a prioridade da demanda.",
      });
      console.error("Error updating priority:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!canEdit) {
    return (
      <Badge className={getPriorityColor(currentPriority)}>
        {currentPriority || "—"}
      </Badge>
    );
  }

  return (
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
  );
}
