"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSprint, saveSprint } from "@/lib/api-sprints";

type DemandPick = { id: string; protocol?: string; description?: string };

type ItemRow = {
  demandId: string;
  plannedHours: number;
  workedHours: number;
};

interface SprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId?: string;
  // opcional: seeds vindos de uma selecao de demandas no backlog
  seedDemands?: DemandPick[];
}

export function SprintModal({ open, onOpenChange, sprintId, seedDemands }: SprintModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ItemRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (sprintId) {
      getSprint(sprintId).then((s) => {
        setName(s.name);
        setStartDate(s.startDate.slice(0, 10));
        setEndDate(s.endDate.slice(0, 10));
        setItems(s.items.map((i) => ({ demandId: i.demandId, plannedHours: i.plannedHours ?? 0, workedHours: i.workedHours ?? 0 })));
      });
    } else {
      setName("");
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      if (seedDemands && seedDemands.length) {
        setItems(seedDemands.map((d) => ({ demandId: d.id, plannedHours: 0, workedHours: 0 })));
      } else {
        setItems([]);
      }
    }
  }, [open, sprintId, seedDemands]);

  const handleChangeItem = (idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) => {
      const arr = [...prev];
      const num = parseFloat(value);
      (arr[idx] as any)[field] = isNaN(num) ? 0 : num;
      return arr;
    });
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Nome obrigatorio" });
      return;
    }
    if (endDate < startDate) {
      toast({ variant: "destructive", title: "Data final deve ser >= inicial" });
      return;
    }
    setSaving(true);
    try {
      await saveSprint({
        id: sprintId,
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: items.map((i) => ({ demandId: i.demandId, plannedHours: i.plannedHours, workedHours: i.workedHours })),
      });
      toast({ title: sprintId ? "Sprint atualizada" : "Sprint criada" });
      onOpenChange(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao salvar sprint" });
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{sprintId ? "Editar Sprint" : "Nova Sprint"}</DialogTitle>
          <DialogDescription>Defina periodo e itens (horas planejadas x trabalhadas).</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Sprint 24.11" />
          </div>
          <div className="space-y-2">
            <Label>Inicio</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Fim</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="border rounded-md">
          <div className="grid grid-cols-12 text-sm font-medium text-slate-600 p-2 border-b bg-slate-50">
            <div className="col-span-6">Demanda</div>
            <div className="col-span-3 text-right">Horas planejadas</div>
            <div className="col-span-3 text-right">Horas trabalhadas</div>
          </div>
          {items.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Nenhum item adicionado</div>
          ) : (
            items.map((it, idx) => (
              <div key={`${it.demandId}-${idx}`} className="grid grid-cols-12 items-center p-2 border-b last:border-b-0">
                <div className="col-span-6 text-sm truncate">{it.demandId}</div>
                <div className="col-span-3 flex justify-end">
                  <Input
                    type="number"
                    className="max-w-[140px] text-right"
                    value={it.plannedHours}
                    onChange={(e) => handleChangeItem(idx, "plannedHours", e.target.value)}
                    step="0.5"
                    min="0"
                  />
                </div>
                <div className="col-span-3 flex justify-end">
                  <Input
                    type="number"
                    className="max-w-[140px] text-right"
                    value={it.workedHours}
                    onChange={(e) => handleChangeItem(idx, "workedHours", e.target.value)}
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button className="bg-[#04A4A1] hover:bg-[#038a87]" onClick={onSave} disabled={saving}>
            {saving ? "Salvando..." : sprintId ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

