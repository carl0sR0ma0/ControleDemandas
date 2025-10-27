import { http } from "@/lib/http";
import type { DemandStatus } from "@/types/api";

interface PublicStep {
  status: DemandStatus;
  date: string;
  author: string;
  note?: string | null;
}

export interface PublicProtocolResponse {
  protocol: string;
  openedAt: string;
  occurrenceType: number;
  observation?: string | null;
  status: DemandStatus;
  steps: PublicStep[];
}

export async function getProtocol(protocol: string) {
  const { data } = await http.get<PublicProtocolResponse>(`/public/protocol/${protocol}`);
  return data;
}

