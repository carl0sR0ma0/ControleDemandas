export enum DemandStatus {
  Ranqueado = 1,
  AguardandoAprovacao = 2,
  Execucao = 3,
  Validacao = 4,
  Concluida = 5,
}

export enum OccurrenceType {
  Incremental = 1,
  Melhoria = 2,
  Bug = 3,
}
export enum Classification {
  Urgente = 1,
  Medio = 2,
  Baixo = 3,
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
  module: string;
  client?: string | null;
  reporterArea: string;
  classification: Classification;
  status: DemandStatus;
  nextActionResponsible?: string | null;
  estimatedDelivery?: string | null;
  documentUrl?: string | null;
}

export interface DemandDetail extends DemandListItem {
  description: string;
  observation?: string | null;
  requesterResponsible: string;
  unit: string;
  priority?: string | null;
  systemVersion?: string | null;
  reporter?: string | null;
  productModule?: string | null;
  order?: number | null;
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
