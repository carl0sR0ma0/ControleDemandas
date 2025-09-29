import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Users, Eye, Edit } from "lucide-react"

export function RolesCard() {
  const roles = [
    {
      name: "Admin",
      icon: Shield,
      color: "bg-red-100 text-red-800",
      description: "Acesso total ao sistema",
      permissions: [
        "Acessar Dashboard",
        "Visualizar Demandas",
        "Registrar Demandas",
        "Editar Status / Aprovar",
        "Gerenciar Usuários",
      ],
    },
    {
      name: "Gestor",
      icon: Users,
      color: "bg-blue-100 text-blue-800",
      description: "Gerencia demandas e aprova solicitações",
      permissions: ["Acessar Dashboard", "Visualizar Demandas", "Registrar Demandas", "Editar Status / Aprovar"],
    },
    {
      name: "Colaborador",
      icon: Edit,
      color: "bg-green-100 text-green-800",
      description: "Cria e acompanha suas demandas",
      permissions: ["Acessar Dashboard", "Visualizar Demandas", "Registrar Demandas"],
    },
    {
      name: "Visualizador",
      icon: Eye,
      color: "bg-gray-100 text-gray-800",
      description: "Apenas visualiza informações",
      permissions: ["Acessar Dashboard", "Visualizar Demandas"],
    },
  ]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Perfis e Permissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {roles.map((role, index) => {
          const Icon = role.icon
          return (
            <div key={index}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-slate-50">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <Badge variant="secondary" className={role.color}>
                    {role.name}
                  </Badge>
                  <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                </div>
              </div>
              <div className="ml-11 space-y-1">
                {role.permissions.map((permission, permIndex) => (
                  <div key={permIndex} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#04A4A1] rounded-full" />
                    <span className="text-sm text-slate-600">{permission}</span>
                  </div>
                ))}
              </div>
              {index < roles.length - 1 && <Separator className="mt-4" />}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
