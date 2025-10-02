import { useQuery, useMutation } from "@tanstack/react-query";
import { http } from "../lib/http";
import type {
  DemandDetail,
  DemandListItem,
  DemandStatus,
  OccurrenceType,
  Classification,
} from "../types/api";
import { queryClient } from "../lib/queryClient";

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
  area?: string;
  modulo?: string;
  cliente?: string;
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

export function useDemandList(filters: DemandListFilters) {
  const q = toQuery({ page: 1, size: 20, ...filters });
  return useQuery({
    queryKey: ["demands", "list", q],
    queryFn: async () => {
      const { data } = await http.get<DemandListResponse>(`/demands?${q}`);
      return data;
    },
    keepPreviousData: true,
  });
}

export function useDemandDetail(id?: string) {
  return useQuery({
    queryKey: ["demands", "detail", id],
    queryFn: async () => {
      const { data } = await http.get<DemandDetail>(`/demands/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export interface CreateDemandDto {
  description: string;
  observation?: string;
  module: string;
  requesterResponsible: string;
  reporterArea: string;
  occurrenceType: OccurrenceType;
  unit: string;
  classification: Classification;
  client?: string;
  priority?: string;
  systemVersion?: string;
  reporter?: string;
  productModule?: string;
  documentUrl?: string;
  order?: number;
  reporterEmail?: string;
}

export function useCreateDemand() {
  return useMutation({
    mutationFn: async (payload: CreateDemandDto) => {
      const { data } = await http.post<{ id: string; protocol: string }>(`/demands`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export interface UpdateDemandDto {
  observation?: string;
  nextActionResponsible?: string;
  estimatedDelivery?: string;
  documentUrl?: string;
  order?: number;
}

export function useUpdateDemand(id: string) {
  return useMutation({
    mutationFn: async (payload: UpdateDemandDto) => {
      await http.put(`/demands/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["demands", "list"] });
    },
  });
}

export function useChangeDemandStatus(id: string) {
  return useMutation({
    mutationFn: async (params: { newStatus: DemandStatus; note?: string }) => {
      const { data } = await http.post<{ id: string; status: DemandStatus }>(
        `/demands/${id}/status`,
        params
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["demands", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUploadAttachments(id: string) {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      const { data } = await http.post<{ id: string; fileName: string; size: number }[]>(
        `/demands/${id}/attachments`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
    },
  });
}
