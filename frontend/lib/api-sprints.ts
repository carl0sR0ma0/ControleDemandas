import { http } from "./http";

export enum SprintStatus {
  NotStarted = 0,
  InProgress = 1,
  Paused = 2,
  Completed = 3
}

export enum SprintItemStatus {
  Backlog = 0,
  Todo = 1,
  InProgress = 2,
  Done = 3
}

export type SprintSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  percent: number;
};

export type SprintItem = {
  id?: string;
  demandId: string;
  plannedHours: number;
  workedHours: number;
  status: SprintItemStatus;
  demand?: {
    id: string;
    protocol: string;
    description: string;
    priority: number | null;
    status: number | string;
    backlog?: {
      id: string;
      name: string;
    } | null;
  };
};

export type SprintDetail = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  items: SprintItem[];
};

export type SprintAvailableBacklogDemand = {
  id: string;
  protocol: string;
  description: string;
  priority: number | null;
  status: string;
};

export type SprintAvailableBacklog = {
  id: string;
  name: string;
  demands: SprintAvailableBacklogDemand[];
};

export async function listSprints() {
  const res = await http.get<{ data: SprintSummary[] }>(`/sprints`);
  return res.data.data;
}

export async function getSprint(id: string) {
  const res = await http.get<SprintDetail>(`/sprints/${id}`);
  return res.data;
}

export async function saveSprint(payload: {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  items: { demandId: string; plannedHours: number; workedHours: number }[];
}) {
  const body = {
    id: payload.id ?? null,
    name: payload.name,
    startDate: payload.startDate,
    endDate: payload.endDate,
    items: payload.items,
  };
  if (payload.id) {
    const res = await http.put<{ id: string }>(`/sprints/${payload.id}`, body);
    return res.data;
  }
  const res = await http.post<{ id: string }>(`/sprints`, body);
  return res.data;
}

export async function removeSprint(id: string) {
  await http.delete(`/sprints/${id}`);
}

export async function getBurndown(id: string) {
  const res = await http.get<{ date: string; planned: number; remaining: number }[]>(`/sprints/${id}/burndown`);
  return res.data;
}

export async function updateSprintStatus(id: string, status: SprintStatus) {
  const res = await http.patch<{ id: string; status: SprintStatus }>(`/sprints/${id}/status`, { status });
  return res.data;
}

export async function updateSprintItemStatus(itemId: string, status: SprintItemStatus) {
  const res = await http.patch<{ id: string; status: SprintItemStatus }>(`/sprints/items/${itemId}/status`, { status });
  return res.data;
}

export async function listAvailableSprintBacklogs() {
  const res = await http.get<{ data: SprintAvailableBacklog[] }>(`/sprints/available-backlogs`);
  return res.data.data;
}
