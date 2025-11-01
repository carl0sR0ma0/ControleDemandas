"use client";

import { Badge } from "@/components/ui/badge";

export function SprintBadge({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const tone = clamped >= 100 ? "bg-emerald-600" : clamped >= 50 ? "bg-blue-600" : "bg-amber-600";
  return (
    <Badge className={`${tone} text-white`}>
      {clamped}%
    </Badge>
  );
}

