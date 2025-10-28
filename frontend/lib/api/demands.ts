import { http } from "@/lib/http";
import type { DemandListItem, DemandDetail, DemandStatus, OccurrenceType, Classification } from "@/types/api";

export interface DemandListResponse {
  total: number;
  page: number;
  size: number;
  items: DemandListItem[];
}

export interface DemandListFilters {
  page?: number;
  size?: number;
  q?: string;
  status?: DemandStatus;
  reporterAreaId?: string;
  moduleId?: string;
  unitId?: string;
  requesterUserId?: string;
  systemVersionId?: string;
  responsavel?: string;
  tipo?: OccurrenceType;
  classificacao?: Classification;
  from?: string;
  to?: string;
}

const toQuery = (f: DemandListFilters) =>
  Object.entries(f)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

export async function listDemands(filters: DemandListFilters) {
  const q = toQuery({ page: 1, size: 20, ...filters });
  const { data } = await http.get<any>(`/demands?${q}`);
  // map backend shape -> frontend types
  const items: DemandListItem[] = (data.items ?? []).map((x: any) => ({
    id: x.id,
    protocol: x.protocol,
    openedAt: x.openedAt,
    occurrenceType: x.occurrenceType,
    module: x.module ?? null,
    reporterArea: x.reporterArea ?? null,
    unit: x.unit ?? null,
    systemVersion: x.systemVersion ?? null,
    requester: x.requester ?? null,
    responsible: x.responsible ?? null,
    classification: x.classification,
    status: x.status,
    nextActionResponsible: x.nextActionResponsible ?? null,
    estimatedDelivery: x.estimatedDelivery ?? null,
    documentUrl: x.documentUrl ?? null,
  }));
  return { total: data.total ?? items.length, page: data.page ?? 1, size: data.size ?? items.length, items };
}

export async function getDemand(id: string) {
  const { data } = await http.get<DemandDetail>(`/demands/${id}`);
  return data;
}

export async function getDemandByProtocol(protocol: string) {
  const { data } = await http.get<DemandDetail>(`/demands/protocol/${protocol}`);
  return data;
}

export interface CreateDemandDto {
  description: string;
  observation?: string;
  moduleId: string;
  requesterUserId: string;
  reporterAreaId: string;
  occurrenceType: OccurrenceType;
  unitId: string;
  classification: Classification;
  responsible?: string;
  systemVersionId?: string;
  documentUrl?: string;
  reporterEmail?: string;
}

export async function createDemand(payload: CreateDemandDto) {
  const { data } = await http.post<{ id: string; protocol: string }>(`/demands`, payload);
  return data;
}

export interface UpdateDemandDto {
  observation?: string;
  nextActionResponsible?: string;
  estimatedDelivery?: string;
  documentUrl?: string;
}

export async function updateDemand(id: string, payload: UpdateDemandDto) {
  await http.put(`/demands/${id}`, payload);
}

export async function changeDemandStatus(id: string, params: { newStatus: DemandStatus; note?: string }) {
  const { data } = await http.post<{ id: string; status: DemandStatus }>(`/demands/${id}/status`, params);
  return data;
}

export async function uploadAttachments(id: string, files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const { data } = await http.post<{ id: string; fileName: string; size: number }[]>(
    `/demands/${id}/attachments`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

