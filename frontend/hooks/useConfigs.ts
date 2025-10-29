import { useQuery } from "@tanstack/react-query";
import {
  getAreas,
  getUnits,
  getSystems,
  getVersions,
  getModules,
  type Area,
  type Unit,
  type SystemEntity,
  type SystemVersion,
  type ModuleEntity,
} from "@/lib/api/configs";

export function useAreas() {
  return useQuery<Area[], Error>({
    queryKey: ["configs", "areas"],
    queryFn: getAreas,
  });
}

export function useUnits() {
  return useQuery<Unit[], Error>({
    queryKey: ["configs", "units"],
    queryFn: getUnits,
  });
}

export function useSystems() {
  return useQuery<SystemEntity[], Error>({
    queryKey: ["configs", "systems"],
    queryFn: getSystems,
  });
}

export function useVersions(systemId?: string) {
  return useQuery<SystemVersion[], Error>({
    queryKey: ["configs", "versions", systemId],
    queryFn: () => getVersions(systemId!),
    enabled: !!systemId,
  });
}

export function useModules(systemId?: string) {
  return useQuery<ModuleEntity[], Error>({
    queryKey: ["configs", "modules", systemId],
    queryFn: () => getModules(systemId!),
    enabled: !!systemId,
  });
}
