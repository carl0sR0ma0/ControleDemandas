import { DemandStatus } from "../types/api";

// Paleta base
export const COLORS = {
  primary: "#04A4A1",
  dark: "#606062",
  medium: "#8B8D90",
  warning: "#FF7100",
};

export function colorByStatus(s: DemandStatus): string {
  switch (s) {
    case DemandStatus.Aberta:
      return COLORS.primary;
    case DemandStatus.Ranqueado:
      return COLORS.primary; // Em Aberto
    case DemandStatus.Documentacao:
      return "#29B6F6"; // Azul claro
    case DemandStatus.Aprovacao:
      return COLORS.medium; // Diretoria
    case DemandStatus.Execucao:
      return COLORS.warning; // Em andamento
    case DemandStatus.Pausado:
      return "#FFA726"; // Laranja
    case DemandStatus.Validacao:
      return COLORS.dark; // QA
    case DemandStatus.Concluida:
      return COLORS.medium; // Encerrado
    default:
      return COLORS.medium;
  }
}

export const statusLabel = (s: DemandStatus) =>
  ({
    [DemandStatus.Aberta]: "Aberta",
    [DemandStatus.Ranqueado]: "Ranqueado (Em Aberto)",
    [DemandStatus.Documentacao]: "Documentação",
    [DemandStatus.Aprovacao]: "Aprovação",
    [DemandStatus.Execucao]: "Execução",
    [DemandStatus.Pausado]: "Pausado",
    [DemandStatus.Validacao]: "Validação",
    [DemandStatus.Concluida]: "Concluída",
  }[s]);
