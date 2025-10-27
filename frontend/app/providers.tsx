"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { QueryLoader } from "@/components/query-loader";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Loader global sempre que houver requisições em andamento */}
      <QueryLoader />
      {children}
    </QueryClientProvider>
  );
}
