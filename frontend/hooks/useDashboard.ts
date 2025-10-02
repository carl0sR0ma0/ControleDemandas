import { useQuery } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { DashboardCards } from "../types/api";

export function useDashboardCards() {
  return useQuery({
    queryKey: ["dashboard", "cards"],
    queryFn: async () => {
      const { data } = await http.get<DashboardCards>("/dashboard/cards");
      return data;
    },
  });
}

export function useDemandasPorStatus() {
  return useQuery({
    queryKey: ["dashboard", "por-status"],
    queryFn: async () => {
      const { data } = await http.get<{ status: number; qtde: number }[]>("/dashboard/por-status");
      return data;
    },
  });
}

export function useDemandasPorArea() {
  return useQuery({
    queryKey: ["dashboard", "por-area"],
    queryFn: async () => {
      const { data } = await http.get<{ area: string; qtde: number }[]>("/dashboard/por-area");
      return data;
    },
  });
}

export function useDemandasPorModulo() {
  return useQuery({
    queryKey: ["dashboard", "por-modulo"],
    queryFn: async () => {
      const { data } = await http.get<{ modulo: string; qtde: number }[]>("/dashboard/por-modulo");
      return data;
    },
  });
}

export function useDemandasPorCliente() {
  return useQuery({
    queryKey: ["dashboard", "por-cliente"],
    queryFn: async () => {
      const { data } = await http.get<{ cliente: string; qtde: number }[]>("/dashboard/por-cliente");
      return data;
    },
  });
}
