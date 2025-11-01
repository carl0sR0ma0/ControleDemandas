"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ArrowLeft, Columns3, LineChart as LineChartIcon } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  getSprint,
  getBurndown,
  updateSprintItemStatus,
  SprintDetail,
  SprintItem,
  SprintItemStatus,
  SprintStatus,
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
import { LineChart as RechartsLineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

const PERMS = {
  VisualizarDemandas: 2,
};

const columns = [
  { id: SprintItemStatus.Backlog, title: "Backlog", color: "bg-gray-100" },
  { id: SprintItemStatus.Todo, title: "To Do", color: "bg-blue-100" },
  { id: SprintItemStatus.InProgress, title: "Doing", color: "bg-yellow-100" },
  { id: SprintItemStatus.Done, title: "Done", color: "bg-green-100" },
];

const normalizeSprintStatus = (status: unknown): SprintStatus => {
  if (typeof status === "number") return status as SprintStatus;
  if (typeof status === "string") {
    const enumMatch = (SprintStatus as unknown as Record<string, number | string>)[status];
    if (typeof enumMatch === "number") return enumMatch as SprintStatus;
    const numeric = Number(status);
    if (!Number.isNaN(numeric)) return numeric as SprintStatus;
  }
  return SprintStatus.NotStarted;
};

const normalizeItemStatus = (status: unknown): SprintItemStatus => {
  if (typeof status === "number") return status as SprintItemStatus;
  if (typeof status === "string") {
    const enumMatch = (SprintItemStatus as unknown as Record<string, number | string>)[status];
    if (typeof enumMatch === "number") return enumMatch as SprintItemStatus;
    const numeric = Number(status);
    if (!Number.isNaN(numeric)) return numeric as SprintItemStatus;
  }
  return SprintItemStatus.Backlog;
};

const sprintStatusLabel = (status: SprintStatus) => {
  switch (status) {
    case SprintStatus.NotStarted:
      return "Nao iniciada";
    case SprintStatus.InProgress:
      return "Em andamento";
    case SprintStatus.Paused:
      return "Pausada";
    case SprintStatus.Completed:
      return "Concluida";
    default:
      return "Sem status";
  }
};

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
  const [activeTab, setActiveTab] = useState<"kanban" | "dashboard">("kanban");
  const [burndown, setBurndown] = useState<Array<{ date: string; planned: number; remaining: number }>>([]);
  const [loadingBurndown, setLoadingBurndown] = useState(true);
  const [burndownError, setBurndownError] = useState<string | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value === "dashboard" ? "dashboard" : "kanban");
  };

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
      const normalizedStatus = normalizeSprintStatus(data.status);
      const normalizedItems = data.items.map((item) => ({
        ...item,
        status: normalizeItemStatus(item.status),
      }));
      setSprint({ ...data, status: normalizedStatus, items: normalizedItems });
    } catch (error) {
      toast.error("Erro ao carregar sprint");
      router.push("/sprints");
    } finally {
      setLoading(false);
    }
  };

  const loadBurndown = async () => {
    try {
      setLoadingBurndown(true);
      setBurndownError(null);
      const data = await getBurndown(sprintId);
      setBurndown(data);
    } catch (error) {
      setBurndownError("Erro ao carregar burndown");
    } finally {
      setLoadingBurndown(false);
    }
  };

  useEffect(() => {
    loadSprint();
  }, [sprintId]);

  useEffect(() => {
    loadBurndown();
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
    const newStatus = normalizeItemStatus(over.id);

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

  const burndownChartData = useMemo(
    () =>
      burndown.map((point) => ({
        label: new Date(point.date).toLocaleDateString("pt-BR"),
        planned: Number(point.planned ?? 0),
        remaining: Number(point.remaining ?? 0),
      })),
    [burndown]
  );

  const burndownChartConfig = useMemo<ChartConfig>(
    () => ({
      planned: { label: "Planejado", color: "#f97316" },
      remaining: { label: "Restante", color: "#007d66" },
    }),
    []
  );

  const hasBurndownData = burndownChartData.length > 0;

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Carregando sprint...</p>
      </div>
    );
  }

  if (!sprint) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/sprints")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Sprints
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{sprint.name}</h1>
              <p className="text-slate-600">
                {new Date(sprint.startDate).toLocaleDateString("pt-BR")} -{" "}
                {new Date(sprint.endDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-200 text-slate-600">
              Itens: {sprint.items.length}
            </Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-600">
              {sprintStatusLabel(sprint.status)}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-1 flex-col"
      >
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <Columns3 className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <LineChartIcon className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="px-6 pb-6">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  items={getItemsByColumn(column.id)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeItem && activeItem.demand && <DemandCard item={activeItem} isDragging />}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="dashboard" className="px-6 pb-6">
          {loadingBurndown ? (
            <p className="text-slate-500">Carregando burndown...</p>
          ) : burndownError ? (
            <p className="text-sm text-red-600">{burndownError}</p>
          ) : hasBurndownData ? (
            <ChartContainer
              config={burndownChartConfig}
              className="h-[360px] w-full"
            >
              <RechartsLineChart data={burndownChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="var(--color-planned)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="remaining"
                  stroke="var(--color-remaining)"
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsLineChart>
            </ChartContainer>
          ) : (
            <p className="text-slate-500">Sem dados de burndown para esta sprint.</p>
          )}
        </TabsContent>
      </Tabs>
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
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className={`p-3 hover:shadow-md transition-shadow ${
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
    </div>
  );
}
