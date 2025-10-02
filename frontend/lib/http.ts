"use client";

import axios from "axios";

// Em Next, use NEXT_PUBLIC_*
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const http = axios.create({ baseURL });

// Interceptor: injeta Authorization se houver token (apenas no client)
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata 401 e erros padronizados
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // opcional: faça um redirect global ou limpe sessão
      // if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
