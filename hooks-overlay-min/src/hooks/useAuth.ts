import { useMutation } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { AuthUser } from "../types/api";
type LoginResponse={token:string;user:AuthUser};
export function useLogin(){return useMutation({mutationFn:async(p:{email:string;password:string})=>{const{data}=await http.post<LoginResponse>("/auth/login",p);localStorage.setItem("auth_token",data.token);localStorage.setItem("auth_user",JSON.stringify(data.user));return data.user;},});}
export function logout(){localStorage.removeItem("auth_token");localStorage.removeItem("auth_user");}
export function getCurrentUser():AuthUser|null{const raw=localStorage.getItem("auth_user");return raw?JSON.parse(raw) as AuthUser:null}
export function hasPermission(mask:number,bit:number){return (mask&bit)===bit}
