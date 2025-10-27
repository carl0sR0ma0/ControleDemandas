import { useQuery } from "@tanstack/react-query";
import { getCards, getPorArea, getPorModulo, getPorResponsavel, getPorStatus } from "@/lib/api/dashboard";
import type { DashboardCards } from "../types/api";

export function useDashboardCards() {
  return useQuery({
    queryKey: ["dashboard", "cards"],
    queryFn: async () => {
      return await getCards();
    },
  });
}

export function useDemandasPorStatus() {
  return useQuery({
    queryKey: ["dashboard", "por-status"],
    queryFn: async () => {
      return await getPorStatus();
    },
  });
}

export function useDemandasPorArea() {
  return useQuery({
    queryKey: ["dashboard", "por-area"],
    queryFn: async () => {
      return await getPorArea();
    },
  });
}

export function useDemandasPorModulo() {
  return useQuery({
    queryKey: ["dashboard", "por-modulo"],
    queryFn: async () => {
      return await getPorModulo();
    },
  });
}

export function useDemandasPorResponsavel() {
  return useQuery({
    queryKey: ["dashboard", "por-responsavel"],
    queryFn: async () => {
      return await getPorResponsavel();
    },
  });
}
