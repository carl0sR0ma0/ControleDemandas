export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  let base = raw.trim();
  // Corrige faltas de barras no esquema: 'http:localhost' -> 'http://localhost'
  base = base.replace(/^(https?):(?!\/\/)/i, "$1://");
  // Remove barra final
  base = base.replace(/\/$/, "");

  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL não definido. Configure o endpoint público da API no ambiente (.env.local).",
    );
  }

  // Impede uso acidental de localhost/127.* apenas em produção
  if (process.env.NODE_ENV === 'production') {
    try {
      const u = new URL(base);
      const host = u.hostname.toLowerCase();
      const allowLocal = (process.env.NEXT_PUBLIC_ALLOW_LOCAL_API || "").toLowerCase() === "true";
      const isLocal = host === "localhost" || host.startsWith("127.") || host === "::1";
      if (isLocal && !allowLocal) {
        throw new Error(
          `Base de API inválida: ${base}. Evite localhost em builds reais. Defina NEXT_PUBLIC_ALLOW_LOCAL_API=true se quiser permitir local.`,
        );
      }
    } catch (e) {
      if (e instanceof Error) throw e;
    }
  }

  return base;
}
