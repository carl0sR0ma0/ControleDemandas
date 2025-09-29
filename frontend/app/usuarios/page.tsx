import { UsersTable } from "@/components/users-table"
import { RolesCard } from "@/components/roles-card"

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Usuários & Permissões</h1>
          <p className="text-slate-600 mt-1">Gerencie usuários, perfis e permissões do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsersTable />
        </div>
        <div>
          <RolesCard />
        </div>
      </div>
    </div>
  )
}
