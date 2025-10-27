import { useQuery } from "@tanstack/react-query";import { http } from "../lib/http";import type { DashboardCards } from "../types/api";
export const useDashboardCards=()=>useQuery({queryKey:["dashboard","cards"],queryFn:async()=> (await http.get<DashboardCards>("/dashboard/cards")).data});
export const useDemandasPorStatus=()=>useQuery({queryKey:["dashboard","por-status"],queryFn:async()=> (await http.get<{status:number;qtde:number}[]>("/dashboard/por-status")).data});
export const useDemandasPorArea=()=>useQuery({queryKey:["dashboard","por-area"],queryFn:async()=> (await http.get<{area:string;qtde:number}[]>("/dashboard/por-area")).data});
export const useDemandasPorModulo=()=>useQuery({queryKey:["dashboard","por-modulo"],queryFn:async()=> (await http.get<{modulo:string;qtde:number}[]>("/dashboard/por-modulo")).data});
export const useDemandasPorResponsavel=()=>useQuery({queryKey:["dashboard","por-responsavel"],queryFn:async()=> (await http.get<{responsavel:string;qtde:number}[]>("/dashboard/por-responsavel")).data});
