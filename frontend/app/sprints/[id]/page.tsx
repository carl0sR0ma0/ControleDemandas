"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  getSprint,
  updateSprintItemStatus,
  SprintDetail,
  SprintItem,
  SprintItemStatus,
} from "@/lib/api-sprints";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const PERMS = {
  VisualizarDemandas: 2,
};

const columns = [
  { id: SprintItemStatus.Backlog, title: "Backlog", color: "bg-gray-100" },
  { id: SprintItemStatus.Todo, title: "To Do", color: "bg-blue-100" },
  { id: SprintItemStatus.InProgress, title: "Doing", color: "bg-yellow-100" },
  { id: SprintItemStatus.Done, title: "Done", color: "bg-green-100" },
];

const priorityColors: Record<number, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-blue-100 text-blue-700",
  5: "bg-gray-100 text-gray-700",
};

const priorityLabels: Record<number, string> = {
  1: "Crítica",
  2: "Alta",
  3: "Média",
  4: "Baixa",
  5: "Muito Baixa",
};

export default function SprintDetailPage() {
  useAuthGuard(PERMS.VisualizarDemandas);

  const params = useParams();
  const router = useRouter();
  const sprintId = params.id as string;

  const [sprint, setSprint] = useState<SprintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<SprintItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadSprint = async () => {
    try {
      setLoading(true);
      const data = await getSprint(sprintId);
      setSprint(data);
    } catch (error) {
      toast.error("Erro ao carregar sprint");
      router.push("/sprints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSprint();
  }, [sprintId]);

  const handleDragStart = (event: DragStartEvent) => {
    const item = sprint?.items.find((i) => i.id === event.active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;

    if (!over || !sprint) return;

    const itemId = active.id as string;
    const newStatus = over.id as SprintItemStatus;

    const item = sprint.items.find((i) => i.id === itemId);
    if (!item || item.status === newStatus) return;

    try {
      await updateSprintItemStatus(itemId, newStatus);

      setSprint({
        ...sprint,
        items: sprint.items.map((i) =>
          i.id === itemId ? { ...i, status: newStatus } : i
        ),
      });

      toast.success("Status atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const getItemsByColumn = (columnId: SprintItemStatus) => {
    return sprint?.items.filter((item) => item.status === columnId) || [];
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-center text-slate-500">Carregando sprint...</p>
      </div>
    );
  }

  if (!sprint) {
    return null;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/sprints")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Sprints
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{sprint.name}</h1>
            <p className="text-slate-600 mt-1">
              {new Date(sprint.startDate).toLocaleDateString("pt-BR")} -{" "}
              {new Date(sprint.endDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={getItemsByColumn(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem && activeItem.demand && (
            <DemandCard item={activeItem} isDragging />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  column,
  items,
}: {
  column: { id: SprintItemStatus; title: string; color: string };
  items: SprintItem[];
}) {
  const { useDroppable } = require("@dnd-kit/core");
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className={`${column.color} rounded-lg p-3 font-semibold text-sm`}>
        <div className="flex items-center justify-between">
          <span>{column.title}</span>
          <Badge variant="secondary" className="ml-2">
            {items.length}
          </Badge>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 min-h-[500px] bg-slate-50 rounded-lg p-3 space-y-2"
      >
        {items.map((item) => (
          <DemandCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">
            Nenhum item
          </div>
        )}
      </div>
    </div>
  );
}

function DemandCard({
  item,
  isDragging = false,
}: {
  item: SprintItem;
  isDragging?: boolean;
}) {
  const { useDraggable } = require("@dnd-kit/core");
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id!,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (!item.demand) return null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50 rotate-3" : ""
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-xs text-slate-500">
            {item.demand.protocol}
          </span>
          {item.demand.priority && (
            <Badge className={priorityColors[item.demand.priority]}>
              {priorityLabels[item.demand.priority]}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium text-slate-700 line-clamp-2">
          {item.demand.description}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{item.plannedHours}h planejadas</span>
          <span>{item.workedHours}h trabalhadas</span>
        </div>
      </div>
    </Card>
  );
}
