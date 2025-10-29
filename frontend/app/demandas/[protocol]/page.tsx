"use client";

import { DemandDetail } from "@/components/demand-detail";
import { useAuthGuard, PERMS } from "@/hooks/useAuthGuard";

export default function DemandDetailPage({ params }: { params: { protocol: string } }) {
  useAuthGuard(PERMS.VisualizarDemandas)

  return (
    <div className="p-6">
      <DemandDetail protocol={decodeURIComponent(params.protocol)} />
    </div>
  );
}
