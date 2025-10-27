import { useQuery, useMutation } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { DemandDetail, DemandListItem, DemandStatus, OccurrenceType, Classification } from "../types/api";
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

export const useDemandList = (filters: DemandListFilters) => {
  const q = toQuery({ page: 1, size: 20, ...filters });
  return useQuery({
    queryKey: ["demands", "list", q],
    queryFn: async () => (await http.get<DemandListResponse>(`/demands?${q}`)).data,
    keepPreviousData: true,
  });
};

export const useDemandDetail = (id?: string) =>
  useQuery({
    queryKey: ["demands", "detail", id],
    queryFn: async () => (await http.get<DemandDetail>(`/demands/${id}`)).data,
    enabled: !!id,
  });

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

export const useCreateDemand = () =>
  useMutation({
    mutationFn: async (payload: CreateDemandDto) => (await http.post<{ id: string; protocol: string }>(`/demands`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

export interface UpdateDemandDto {
  observation?: string;
  nextActionResponsible?: string;
  estimatedDelivery?: string;
  documentUrl?: string;
}

export const useUpdateDemand = (id: string) =>
  useMutation({
    mutationFn: async (payload: UpdateDemandDto) => {
      await http.put(`/demands/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["demands", "list"] });
    },
  });

export const useChangeDemandStatus = (id: string) =>
  useMutation({
    mutationFn: async (params: { newStatus: DemandStatus; note?: string }) =>
      (await http.post<{ id: string; status: DemandStatus }>(`/demands/${id}/status`, params)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["demands", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

export const useUploadAttachments = (id: string) =>
  useMutation({
    mutationFn: async (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      return (
        await http.post<{ id: string; fileName: string; size: number }[]>(`/demands/${id}/attachments`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
    },
  });
