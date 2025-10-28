import { http } from "@/lib/http";
import type { DashboardCards, DemandStatus } from "@/types/api";

export async function getCards() {
  const { data } = await http.get<DashboardCards>("/dashboard/cards");
  return data;
}

export async function getPorStatus() {
  const { data } = await http.get<{ status: DemandStatus; qtde: number }[]>("/dashboard/por-status");
  return data;
}

export async function getPorArea() {
  const { data } = await http.get<{ area: string; qtde: number }[]>("/dashboard/por-area");
  return data;
}

export async function getPorModulo() {
  const { data } = await http.get<{ modulo: string; qtde: number }[]>("/dashboard/por-modulo");
  return data;
}

export async function getPorUnidade() {
  const { data } = await http.get<{ unidade: string; qtde: number }[]>("/dashboard/por-unidade");
  return data;
}

