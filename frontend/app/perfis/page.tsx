"use client";

import { ProfilesManager } from "@/components/profiles-manager"
import { PERMS, useAuthGuard } from "@/hooks/useAuthGuard"

export default function ProfilesPage() {
  useAuthGuard(PERMS.GerenciarPerfis);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <ProfilesManager />
      </div>
    </div>
  )
}

