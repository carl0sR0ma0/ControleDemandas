"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface NewUserFormProps {
  onClose: () => void
  onUserCreated: (user: any) => void
}

export function NewUserForm({ onClose, onUserCreated }: NewUserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    permissions: {
      acessarDashboard: false,
      visualizarDemandas: false,
      registrarDemandas: false,
      editarStatus: false,
      gerenciarUsuarios: false,
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const rolePermissions = {
    Admin: ["acessarDashboard", "visualizarDemandas", "registrarDemandas", "editarStatus", "gerenciarUsuarios"],
    Gestor: ["acessarDashboard", "visualizarDemandas", "registrarDemandas", "editarStatus"],
    Colaborador: ["acessarDashboard", "visualizarDemandas", "registrarDemandas"],
    Visualizador: ["acessarDashboard", "visualizarDemandas"],
  }

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: {
        acessarDashboard: rolePermissions[role as keyof typeof rolePermissions]?.includes("acessarDashboard") || false,
        visualizarDemandas:
          rolePermissions[role as keyof typeof rolePermissions]?.includes("visualizarDemandas") || false,
        registrarDemandas:
          rolePermissions[role as keyof typeof rolePermissions]?.includes("registrarDemandas") || false,
        editarStatus: rolePermissions[role as keyof typeof rolePermissions]?.includes("editarStatus") || false,
        gerenciarUsuarios:
          rolePermissions[role as keyof typeof rolePermissions]?.includes("gerenciarUsuarios") || false,
      },
    }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "Ativo",
      lastLogin: null,
      permissions: Object.keys(formData.permissions).filter(
        (key) => formData.permissions[key as keyof typeof formData.permissions],
      ),
    }

    onUserCreated(newUser)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700">
            Nome Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Digite o nome completo"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            E-mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">
          Perfil <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.role} onValueChange={handleRoleChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o perfil do usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Gestor">Gestor</SelectItem>
            <SelectItem value="Colaborador">Colaborador</SelectItem>
            <SelectItem value="Visualizador">Visualizador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Permissões Granulares</h3>
        <p className="text-sm text-slate-600">
          As permissões são definidas automaticamente pelo perfil, mas podem ser personalizadas conforme necessário.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="acessarDashboard" className="text-slate-700 font-medium">
                Acessar Dashboard
              </Label>
              <p className="text-sm text-slate-500">Permite visualizar a página inicial com métricas</p>
            </div>
            <Switch
              id="acessarDashboard"
              checked={formData.permissions.acessarDashboard}
              onCheckedChange={(checked) => handlePermissionChange("acessarDashboard", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="visualizarDemandas" className="text-slate-700 font-medium">
                Visualizar Demandas
              </Label>
              <p className="text-sm text-slate-500">Permite ver a lista e detalhes das demandas</p>
            </div>
            <Switch
              id="visualizarDemandas"
              checked={formData.permissions.visualizarDemandas}
              onCheckedChange={(checked) => handlePermissionChange("visualizarDemandas", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="registrarDemandas" className="text-slate-700 font-medium">
                Registrar Demandas
              </Label>
              <p className="text-sm text-slate-500">Permite criar novas solicitações</p>
            </div>
            <Switch
              id="registrarDemandas"
              checked={formData.permissions.registrarDemandas}
              onCheckedChange={(checked) => handlePermissionChange("registrarDemandas", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="editarStatus" className="text-slate-700 font-medium">
                Editar Status / Aprovar
              </Label>
              <p className="text-sm text-slate-500">Permite alterar status e aprovar demandas</p>
            </div>
            <Switch
              id="editarStatus"
              checked={formData.permissions.editarStatus}
              onCheckedChange={(checked) => handlePermissionChange("editarStatus", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gerenciarUsuarios" className="text-slate-700 font-medium">
                Gerenciar Usuários
              </Label>
              <p className="text-sm text-slate-500">Permite criar, editar e gerenciar usuários</p>
            </div>
            <Switch
              id="gerenciarUsuarios"
              checked={formData.permissions.gerenciarUsuarios}
              onCheckedChange={(checked) => handlePermissionChange("gerenciarUsuarios", checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-[#04A4A1] hover:bg-[#038a87] text-white flex-1">
          {isSubmitting ? "Criando..." : "Criar Usuário"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
