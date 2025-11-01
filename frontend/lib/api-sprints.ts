import { http } from "./http";

export type SprintSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  percent: number;
};

export type SprintItem = {
  id?: string;
  demandId: string;
  plannedHours: number;
  workedHours: number;
};

export type SprintDetail = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  items: SprintItem[];
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

