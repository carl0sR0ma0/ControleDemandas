"use client";

import axios from "axios";
import { getApiBaseUrl } from "@/lib/env";
import * as nodeHttp from "http";
import * as nodeHttps from "https";

const baseURL = getApiBaseUrl();

// Mantém conexões HTTP/TLS abertas entre múltiplas requisições durante SSR (Node)
// Reduz latência por handshakes repetidos em páginas que fazem várias chamadas.
const isHttps = baseURL.startsWith("https://");
const keepAliveAgent = isHttps
  ? new nodeHttps.Agent({ keepAlive: true })
  : new nodeHttp.Agent({ keepAlive: true });

export const http = axios.create({
  baseURL,
  timeout: 15000,
  httpAgent: keepAliveAgent,
  httpsAgent: keepAliveAgent,
});

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
