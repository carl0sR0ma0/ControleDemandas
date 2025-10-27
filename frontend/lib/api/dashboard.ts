import { http } from "@/lib/http";
import type { DashboardCards } from "@/types/api";

export async function getCards() {
  const { data } = await http.get<DashboardCards>("/dashboard/cards");
  return data;
}

export async function getPorStatus() {
  const { data } = await http.get<{ status: number; qtde: number }[]>("/dashboard/por-status");
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

export async function getPorCliente() {
  const { data } = await http.get<{ cliente: string; qtde: number }[]>("/dashboard/por-cliente");
  return data;
}

