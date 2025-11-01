"use client"

import { useState } from "react"
import { DemandsTable } from "@/components/demands-table"
import { ManageBacklogsModal } from "@/components/manage-backlogs-modal"
import { Button } from "@/components/ui/button"
import { FolderKanban } from "lucide-react"
import { useAuthGuard, PERMS } from "@/hooks/useAuthGuard"
import { useAuth } from "@/hooks/useAuth"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { addDemandsToBacklog } from "@/lib/api/backlogs"

export default function DemandsPage() {
  useAuthGuard(PERMS.VisualizarDemandas)
  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState(false)
  const [selectedDemandIds, setSelectedDemandIds] = useState<string[]>([])
  const { user } = useAuth()
  const canManageBacklogs = user && (user.permissions & 512) === 512
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleOpenModal = () => {
    if (selectedDemandIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma demanda selecionada",
        description: "Selecione ao menos uma demanda para vincular a um backlog"
      })
      return
    }
    setIsBacklogModalOpen(true)
  }

  const handleBacklogSelected = async (backlogId: string, backlogName: string, alreadyLinked?: boolean) => {
    try {
      if (!alreadyLinked) {
        await addDemandsToBacklog(backlogId, selectedDemandIds)
      }

      toast({
        title: "Demandas vinculadas",
        description: `${selectedDemandIds.length} demanda(s) vinculada(s) ao backlog "${backlogName}" com sucesso.`
      })

      queryClient.invalidateQueries({ queryKey: ["demands"] })
      queryClient.invalidateQueries({ queryKey: ["backlogs"] })

      setSelectedDemandIds([])
      setIsBacklogModalOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao vincular demandas",
        description: error?.response?.data?.error || "Não foi possível vincular as demandas ao backlog."
      })
      console.error("Error adding demands to backlog:", error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Demandas</h1>
          <p className="text-slate-600 mt-1">Gerencie todas as solicitações do sistema</p>
        </div>
        {canManageBacklogs && (
          <div className="flex items-center gap-3">
            {selectedDemandIds.length > 0 && (
              <span className="text-sm text-slate-600">
                {selectedDemandIds.length} selecionada{selectedDemandIds.length !== 1 ? "s" : ""}
              </span>
            )}
            <Button
              onClick={handleOpenModal}
              className="bg-[#04A4A1] hover:bg-[#038a87] cursor-pointer disabled:cursor-not-allowed"
              disabled={selectedDemandIds.length === 0}
            >
              <FolderKanban className="w-4 h-4 mr-2" />
              Backlogs
            </Button>
          </div>
        )}
      </div>
      <DemandsTable
        selectedDemands={selectedDemandIds}
        onSelectionChange={setSelectedDemandIds}
      />

      {canManageBacklogs && (
        <ManageBacklogsModal
          open={isBacklogModalOpen}
          onOpenChange={setIsBacklogModalOpen}
          selectedDemandIds={selectedDemandIds}
          onBacklogSelected={handleBacklogSelected}
        />
      )}
    </div>
  )
}
