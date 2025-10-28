export enum DemandStatus {
  Aberta = "Aberta",
  Ranqueado = "Ranqueado",
  AguardandoAprovacao = "AguardandoAprovacao",
  Execucao = "Execucao",
  Validacao = "Validacao",
  Concluida = "Concluida",
}

export enum OccurrenceType {
  Incremental = "Incremental",
  Melhoria = "Melhoria",
  Bug = "Bug",
}
export enum Classification {
  Urgente = "Urgente",
  Medio = "Medio",
  Baixo = "Baixo",
}

export type Permission =
  | 0 // None
  | 1 // AcessarDashboard
  | 2 // VisualizarDemandas
  | 4 // RegistrarDemandas
  | 8 // EditarStatus
  | 16 // Aprovar
  | 32; // GerenciarUsuarios
// … lembre: isso é bitmask; o backend retorna um número somado (long)

// Usuário (resumo retornado pelo /auth/login)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Gestor" | "Colaborador" | "Visualizador" | string;
  permissions: number; // bitmask
}

// Demandas
export interface DemandListItem {
  id: string;
  protocol: string;
  openedAt: string;
  occurrenceType: OccurrenceType;
  module?: { id: string; name: string } | null;
  reporterArea?: { id: string; name: string } | null;
  unit?: { id: string; name: string } | null;
  systemVersion?: { id: string; version: string } | null;
  requester?: { id: string; name: string; email: string } | null;
  responsible?: string | null;
  classification: Classification;
  status: DemandStatus;
  nextActionResponsible?: string | null;
  estimatedDelivery?: string | null;
  documentUrl?: string | null;
}

export interface DemandDetail {
  id: string;
  protocol: string;
  openedAt: string;
  description: string;
  observation?: string | null;
  occurrenceType: OccurrenceType;
  classification: Classification;
  status: DemandStatus;
  system?: { id: string; name: string } | null;
  module?: { id: string; name: string; systemId: string } | null;
  reporterArea?: { id: string; name: string } | null;
  unit?: { id: string; name: string } | null;
  systemVersion?: { id: string; version: string } | null;
  requester?: { id: string; name: string; email: string } | null;
  responsible?: string | null;
  nextActionResponsible?: string | null;
  estimatedDelivery?: string | null;
  documentUrl?: string | null;
  attachments: Attachment[];
  history: StatusHistory[];
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  storagePath: string; // caminho físico no backend; você vai montar o link público se servir /storage
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  status: DemandStatus;
  date: string;
  author: string;
  note?: string | null;
}

// Dashboard
export interface DashboardCards {
  abertas: number;
  emExecucao: number;
  emValidacao: number;
  concluidasNoMes: number;
  slaMedioDias: number;
}
