"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Save, Settings, Shield, Plus, X } from "lucide-react"

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      newDemands: true,
      statusUpdates: true,
      reminders: false,
    },
  })

  const [formOptions, setFormOptions] = useState({
    areas: ["Tecnologia", "Engenharia", "PMO", "CX"],
    clientes: ["Interno", "Raízen", "Cliente A", "Cliente B"],
    modulos: [
      "PGDI - Configuração",
      "PAP",
      "Ocorrências",
      "Tela Monitoramento",
      "Dashboard",
      "Relatório",
      "PCP",
      "Plano de Safra",
      "Usuário",
      "RTA",
      "Metas Online",
      "Indicadores",
      "Editor",
      "Online",
    ],
    prioridades: ["1 - Muito Alta", "2 - Alta", "3 - Média", "4 - Baixa", "5 - Muito Baixa"],
    unidades: ["Unidade A", "Unidade B", "Unidade C"],
    classificacoes: ["Urgente", "Médio", "Baixo"],
    status: ["Ranqueado", "Aprovação", "Execução", "Validação", "Concluída"],
  })

  const [permissions, setPermissions] = useState({
    Colaborador: {
      dashboard: { view: true, edit: false },
      demands: { view: true, create: true, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, export: false },
      settings: { view: false, edit: false },
    },
    Gestor: {
      dashboard: { view: true, edit: true },
      demands: { view: true, create: true, edit: true, delete: false },
      users: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, export: true },
      settings: { view: true, edit: false },
    },
    Administrador: {
      dashboard: { view: true, edit: true },
      demands: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, export: true },
      settings: { view: true, edit: true },
    },
  })

  const [newOptionInputs, setNewOptionInputs] = useState({
    areas: "",
    clientes: "",
    modulos: "",
    prioridades: "",
    unidades: "",
    classificacoes: "",
    status: "",
  })

  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
    }

    // Load saved settings
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Load saved form options
    const savedFormOptions = localStorage.getItem("formOptions")
    if (savedFormOptions) {
      setFormOptions(JSON.parse(savedFormOptions))
    }

    // Load saved permissions
    const savedPermissions = localStorage.getItem("permissions")
    if (savedPermissions) {
      setPermissions(JSON.parse(savedPermissions))
    }
  }, [router])

  const handleSave = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
    localStorage.setItem("formOptions", JSON.stringify(formOptions))
    localStorage.setItem("permissions", JSON.stringify(permissions))
    alert("Configurações salvas com sucesso!")
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    })
  }

  // Removed appearance and privacy helpers

  const addOption = (category: string) => {
    const newValue = newOptionInputs[category as keyof typeof newOptionInputs].trim()
    if (newValue && !formOptions[category as keyof typeof formOptions].includes(newValue)) {
      setFormOptions({
        ...formOptions,
        [category]: [...formOptions[category as keyof typeof formOptions], newValue],
      })
      setNewOptionInputs({
        ...newOptionInputs,
        [category]: "",
      })
    }
  }

  const removeOption = (category: string, index: number) => {
    setFormOptions({
      ...formOptions,
      [category]: formOptions[category as keyof typeof formOptions].filter((_, i) => i !== index),
    })
  }

  const updatePermission = (role: string, module: string, permission: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...((prev as any)[role] || {}),
        [module]: {
          ...(((prev as any)[role] || {})[module] || {}),
          [permission]: value,
        },
      },
    }))
  }

  if (!user) return null

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-600 mt-1">Personalize sua experiência no sistema</p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="formularios">Formulários</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          {/* Notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-[#04A4A1]" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por E-mail</Label>
                  <p className="text-sm text-slate-600">Receba notificações importantes por e-mail</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações Push</Label>
                  <p className="text-sm text-slate-600">Receba notificações no navegador</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateNotificationSetting("push", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Novas Demandas</Label>
                  <p className="text-sm text-slate-600">Seja notificado sobre novas demandas</p>
                </div>
                <Switch
                  checked={settings.notifications.newDemands}
                  onCheckedChange={(checked) => updateNotificationSetting("newDemands", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Atualizações de Status</Label>
                  <p className="text-sm text-slate-600">Receba notificações sobre mudanças de status</p>
                </div>
                <Switch
                  checked={settings.notifications.statusUpdates}
                  onCheckedChange={(checked) => updateNotificationSetting("statusUpdates", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Lembretes</Label>
                  <p className="text-sm text-slate-600">Receba lembretes sobre prazos</p>
                </div>
                <Switch
                  checked={settings.notifications.reminders}
                  onCheckedChange={(checked) => updateNotificationSetting("reminders", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aparência e Privacidade removidos */}
        </TabsContent>

        <TabsContent value="formularios" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#04A4A1]" />
                <CardTitle>Opções dos Formulários</CardTitle>
              </div>
              <CardDescription>Configure as opções disponíveis nos formulários de demanda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {Object.entries(formOptions).map(([category, options]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium capitalize">{category}</Label>
                    <Badge variant="secondary">{options.length} opções</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-1 bg-slate-100 rounded-lg px-3 py-1">
                        <span className="text-sm">{option}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => removeOption(category, index)}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder={`Nova opção para ${category}`}
                      value={newOptionInputs[category as keyof typeof newOptionInputs]}
                      onChange={(e) =>
                        setNewOptionInputs({
                          ...newOptionInputs,
                          [category]: e.target.value,
                        })
                      }
                      onKeyPress={(e) => e.key === "Enter" && addOption(category)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => addOption(category)}
                      disabled={!newOptionInputs[category as keyof typeof newOptionInputs].trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#04A4A1]" />
                <CardTitle>Sistema de Permissões</CardTitle>
              </div>
              <CardDescription>Configure as permissões para cada tipo de usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(permissions).map(([role, rolePermissions]) => (
                <div key={role} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#04A4A1] text-white">{role}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(rolePermissions).map(([module, modulePermissions]) => (
                      <Card key={module} className="border border-slate-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium capitalize">{module}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(modulePermissions).map(([permission, value]) => (
                            <div key={permission} className="flex items-center justify-between">
                              <Label className="text-xs capitalize">{permission}</Label>
                              <Switch
                                checked={value as boolean}
                                onCheckedChange={(checked) => updatePermission(role, module, permission, checked)}
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 'sistema' removida */}
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#04A4A1] hover:bg-[#038a87]">
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}
