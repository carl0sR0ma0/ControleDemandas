import { useQuery } from "@tanstack/react-query";
import { getProtocol, type PublicProtocolResponse } from "@/lib/api/public";
import type { DemandStatus } from "../types/api";

interface PublicStep {
  status: DemandStatus;
  date: string;
  author: string;
  note?: string | null;
}

export type { PublicProtocolResponse };

export function usePublicProtocol(protocol?: string) {
  return useQuery({
    queryKey: ["public", "protocol", protocol],
    queryFn: async () => {
      return await getProtocol(protocol!);
    },
    enabled: !!protocol && protocol.length > 0,
  });
}
