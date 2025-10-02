import { useQuery } from "@tanstack/react-query";import { http } from "../lib/http";import type { DemandStatus } from "../types/api";
interface PublicStep{status:DemandStatus;date:string;author:string;note?:string|null}
export interface PublicProtocolResponse{protocol:string;openedAt:string;occurrenceType:number;observation?:string|null;status:DemandStatus;steps:PublicStep[]}
export const usePublicProtocol=(protocol?:string)=>useQuery({queryKey:["public","protocol",protocol],queryFn:async()=> (await http.get<PublicProtocolResponse>(`/public/protocol/${protocol}`)).data,enabled:!!protocol&&protocol.length>0})
