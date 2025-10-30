import type { BacklogSummary, BacklogDetail, CreateBacklogPayload, UpdatePriorityPayload } from "@/types/api";
import { http } from "../http";

export async function listBacklogs(page = 1, pageSize = 20) {
  const res = await http.get<{
    data: BacklogSummary[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }>(`/backlogs?page=${page}&pageSize=${pageSize}`);
  return res.data;
}

export async function getBacklog(id: string) {
  const res = await http.get<BacklogDetail>(`/backlogs/${id}`);
  return res.data;
}

export async function createBacklog(payload: CreateBacklogPayload) {
  const res = await http.post<{ id: string; name: string }>("/backlogs", payload);
  return res.data;
}

export async function updateDemandPriority(demandId: string, payload: UpdatePriorityPayload) {
  const res = await http.patch<{ id: string; priority: number | null }>(`/demands/${demandId}/priority`, payload);
  return res.data;
}

export async function addDemandsToBacklog(backlogId: string, demandIds: string[]) {
  const res = await http.post<{ message: string }>(`/backlogs/${backlogId}/demands`, { demandIds });
  return res.data;
}
