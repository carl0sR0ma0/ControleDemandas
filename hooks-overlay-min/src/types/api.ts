export enum DemandStatus{Ranqueado=1,AguardandoAprovacao,Execucao,Validacao,Concluida}
export enum OccurrenceType{Incremental=1,Melhoria,Bug}
export enum Classification{Urgente=1,Medio,Baixo}
export interface AuthUser{id:string;name:string;email:string;role:string;permissions:number}
export interface DemandListItem{id:string;protocol:string;openedAt:string;occurrenceType:OccurrenceType;module:string;client?:string|null;reporterArea:string;classification:Classification;status:DemandStatus;nextActionResponsible?:string|null;estimatedDelivery?:string|null;documentUrl?:string|null}
export interface Attachment{id:string;fileName:string;contentType:string;size:number;storagePath:string;createdAt:string}
export interface StatusHistory{id:string;status:DemandStatus;date:string;author:string;note?:string|null}
export interface DemandDetail extends DemandListItem{description:string;observation?:string|null;requesterResponsible:string;unit:string;priority?:string|null;systemVersion?:string|null;reporter?:string|null;productModule?:string|null;order?:number|null;attachments:Attachment[];history:StatusHistory[]}
export interface DashboardCards{abertas:number;emExecucao:number;emValidacao:number;concluidasNoMes:number;slaMedioDias:number}
