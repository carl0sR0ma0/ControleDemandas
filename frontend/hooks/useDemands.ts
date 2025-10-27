import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listDemands,
  getDemand,
  createDemand,
  updateDemand,
  changeDemandStatus,
  uploadAttachments,
  type DemandListResponse,
} from "@/lib/api/demands";
import type {
  DemandDetail,
  DemandListItem,
  DemandStatus,
  OccurrenceType,
  Classification,
} from "../types/api";
import { queryClient } from "../lib/queryClient";

export type { DemandListResponse };

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

export function useDemandList(filters: DemandListFilters) {
  const q = { page: 1, size: 20, ...filters };
  return useQuery({
    queryKey: ["demands", "list", q],
    queryFn: async () => {
      return await listDemands(q);
    },
    keepPreviousData: true,
  });
}

export function useDemandDetail(id?: string) {
  return useQuery({
    queryKey: ["demands", "detail", id],
    queryFn: async () => {
      return await getDemand(id!);
    },
    enabled: !!id,
  });
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

export function useCreateDemand() {
  return useMutation({
    mutationFn: async (payload: CreateDemandDto) => {
      return await createDemand(payload);
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
}

export function useUpdateDemand(id: string) {
  return useMutation({
    mutationFn: async (payload: UpdateDemandDto) => {
      await updateDemand(id!, payload);
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
      return await changeDemandStatus(id, params);
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
      return await uploadAttachments(id, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands", "detail", id] });
    },
  });
}
