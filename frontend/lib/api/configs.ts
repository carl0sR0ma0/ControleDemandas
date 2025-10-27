import { http } from "@/lib/http";

export type SimpleItem = { id: string; name: string; active: boolean };
export type Area = SimpleItem;
export type Client = SimpleItem;
export type Unit = SimpleItem;
export type StatusConfig = SimpleItem;

export type SystemEntity = { id: string; name: string; active: boolean };
export type SystemVersion = { id: string; version: string; active: boolean };
export type ModuleEntity = { id: string; name: string; active: boolean };

export const getAreas = async () => (await http.get<Area[]>("/configs/areas")).data;
export const createArea = async (name: string, active = true) => (await http.post<{id:string}>("/configs/areas", { name, active })).data;
export const updateArea = async (id: string, payload: Partial<Pick<Area, 'name'|'active'>>) => { await http.put(`/configs/areas/${id}`, payload); };
export const deleteArea = async (id: string) => { await http.delete(`/configs/areas/${id}`); };

export const getClients = async () => (await http.get<Client[]>("/configs/clients")).data;
export const createClient = async (name: string, active = true) => (await http.post<{id:string}>("/configs/clients", { name, active })).data;
export const updateClient = async (id: string, payload: Partial<Pick<Client, 'name'|'active'>>) => { await http.put(`/configs/clients/${id}`, payload); };
export const deleteClient = async (id: string) => { await http.delete(`/configs/clients/${id}`); };

export const getUnits = async () => (await http.get<Unit[]>("/configs/units")).data;
export const createUnit = async (name: string, active = true) => (await http.post<{id:string}>("/configs/units", { name, active })).data;
export const updateUnit = async (id: string, payload: Partial<Pick<Unit, 'name'|'active'>>) => { await http.put(`/configs/units/${id}`, payload); };
export const deleteUnit = async (id: string) => { await http.delete(`/configs/units/${id}`); };

export const getStatuses = async () => (await http.get<StatusConfig[]>("/configs/statuses")).data;
export const createStatus = async (name: string, active = true) => (await http.post<{id:string}>("/configs/statuses", { name, active })).data;
export const updateStatus = async (id: string, payload: Partial<Pick<StatusConfig, 'name'|'active'>>) => { await http.put(`/configs/statuses/${id}`, payload); };
export const deleteStatus = async (id: string) => { await http.delete(`/configs/statuses/${id}`); };

export const getSystems = async () => (await http.get<SystemEntity[]>("/configs/systems")).data;
export const createSystem = async (name: string, active = true) => (await http.post<{id:string}>("/configs/systems", { name, active })).data;
export const updateSystem = async (id: string, payload: Partial<Pick<SystemEntity, 'name'|'active'>>) => { await http.put(`/configs/systems/${id}`, payload); };
export const deleteSystem = async (id: string) => { await http.delete(`/configs/systems/${id}`); };

export const getVersions = async (systemId: string) => (await http.get<SystemVersion[]>(`/configs/systems/${systemId}/versions`)).data;
export const createVersion = async (systemId: string, version: string, active = true) => (await http.post<{id:string}>(`/configs/systems/${systemId}/versions`, { version, active })).data;
export const updateVersion = async (systemId: string, id: string, payload: Partial<Pick<SystemVersion, 'version'|'active'>>) => { await http.put(`/configs/systems/${systemId}/versions/${id}`, payload); };
export const deleteVersion = async (systemId: string, id: string) => { await http.delete(`/configs/systems/${systemId}/versions/${id}`); };

export const getModules = async (systemId: string) => (await http.get<ModuleEntity[]>(`/configs/systems/${systemId}/modules`)).data;
export const createModule = async (systemId: string, name: string, active = true) => (await http.post<{id:string}>(`/configs/systems/${systemId}/modules`, { name, active })).data;
export const updateModule = async (systemId: string, id: string, payload: Partial<Pick<ModuleEntity, 'name'|'active'>>) => { await http.put(`/configs/systems/${systemId}/modules/${id}`, payload); };
export const deleteModule = async (systemId: string, id: string) => { await http.delete(`/configs/systems/${systemId}/modules/${id}`); };

