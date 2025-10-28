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
    case DemandStatus.AguardandoAprovacao:
      return COLORS.medium; // Diretoria
    case DemandStatus.Execucao:
      return COLORS.warning; // Em andamento
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
    [DemandStatus.AguardandoAprovacao]: "Aguardando Aprovação",
    [DemandStatus.Execucao]: "Execução",
    [DemandStatus.Validacao]: "Validação",
    [DemandStatus.Concluida]: "Concluída",
  }[s]);
