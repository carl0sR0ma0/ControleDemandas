import { DemandStatus } from "../types/api";
export const COLORS={primary:"#04A4A1",dark:"#606062",medium:"#8B8D90",warning:"#FF7100"};
export const statusLabel=(s:DemandStatus)=>({1:"Ranqueado (Em Aberto)",2:"Aguardando Aprovação",3:"Execução",4:"Validação",5:"Concluída"} as Record<number,string>)[s];
export function colorByStatus(s:DemandStatus){switch(s){case 1:return COLORS.primary;case 2:return COLORS.medium;case 3:return COLORS.warning;case 4:return COLORS.dark;case 5:return COLORS.medium;default:return COLORS.medium}}
