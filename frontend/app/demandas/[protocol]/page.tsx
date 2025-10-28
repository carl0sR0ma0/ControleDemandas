"use client";

import { DemandDetail } from "@/components/demand-detail";

export default function DemandDetailPage({ params }: { params: { protocol: string } }) {
  return (
    <div className="p-6">
      <DemandDetail protocol={decodeURIComponent(params.protocol)} />
    </div>
  );
}
