import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
export const http = axios.create({ baseURL });
http.interceptors.request.use((c)=>{const t=localStorage.getItem("auth_token"); if(t) c.headers.Authorization=`Bearer ${t}`; return c;});
http.interceptors.response.use(r=>r,e=>Promise.reject(e));
