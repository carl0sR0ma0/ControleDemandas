"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Save, Settings, Shield, Plus, X } from "lucide-react";
import { PERMS, useAuthGuard } from "@/hooks/useAuthGuard";

// 🔒 protege a página (ajuste a permissão se quiser)

type FormOptions = {
  areas: string[];
  clientes: string[];
  modulos: string[];
  prioridades: string[];
  unidades: string[];
  classificacoes: string[];
  status: string[];
};

type NewOptionInputs = {
  [K in keyof FormOptions]: string;
};

export default function ConfiguracoesPage() {
  useAuthGuard(PERMS.GerenciarUsuarios); // exige permissão de gerenciar usuários (ajuste se quiser)

  const [user, setUser] = useState<any>(null);

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      newDemands: true,
      statusUpdates: true,
      reminders: false,
    },
  });

  const [formOptions, setFormOptions] = useState<FormOptions>({
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
    prioridades: [
      "1 - Muito Alta",
      "2 - Alta",
      "3 - Média",
      "4 - Baixa",
      "5 - Muito Baixa",
    ],
    unidades: ["Unidade A", "Unidade B", "Unidade C"],
    classificacoes: ["Urgente", "Médio", "Baixo"],
    status: ["Ranqueado", "Aprovação", "Execução", "Validação", "Concluída"],
  });

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
  });

  const [newOptionInputs, setNewOptionInputs] = useState<NewOptionInputs>({
    areas: "",
    clientes: "",
    modulos: "",
    prioridades: "",
    unidades: "",
    classificacoes: "",
    status: "",
  });

  // carrega o usuário e preferências salvas localmente
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("auth_user"); // ✅ chave correta
    if (raw) setUser(JSON.parse(raw));

    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedFormOptions = localStorage.getItem("formOptions");
    if (savedFormOptions) setFormOptions(JSON.parse(savedFormOptions));

    const savedPermissions = localStorage.getItem("permissions");
    if (savedPermissions) setPermissions(JSON.parse(savedPermissions));
  }, []);

  const handleSave = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    localStorage.setItem("formOptions", JSON.stringify(formOptions));
    localStorage.setItem("permissions", JSON.stringify(permissions));
    alert("Configurações salvas com sucesso!");
  };

  const updateNotificationSetting = (
    key: keyof typeof settings.notifications,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const addOption = (category: keyof FormOptions) => {
    const newValue = newOptionInputs[category].trim();
    if (newValue && !formOptions[category].includes(newValue)) {
      setFormOptions((prev) => ({
        ...prev,
        [category]: [...prev[category], newValue],
      }));
      setNewOptionInputs((prev) => ({ ...prev, [category]: "" }));
    }
  };

  const removeOption = (category: keyof FormOptions, index: number) => {
    setFormOptions((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const updatePermission = (
    role: string,
    module: string,
    permission: string,
    value: boolean
  ) => {
    setPermissions((prev: any) => ({
      ...prev,
      [role]: {
        ...(prev[role] || {}),
        [module]: {
          ...((prev[role] || {})[module] || {}),
          [permission]: value,
        },
      },
    }));
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-600 mt-1">
            Personalize sua experiência no sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="formularios">Formulários</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-[#04A4A1]" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RowSwitch
                title="Notificações por E-mail"
                desc="Receba notificações importantes por e-mail"
                checked={settings.notifications.email}
                onChange={(v) => updateNotificationSetting("email", v)}
              />
              <Separator />
              <RowSwitch
                title="Notificações Push"
                desc="Receba notificações no navegador"
                checked={settings.notifications.push}
                onChange={(v) => updateNotificationSetting("push", v)}
              />
              <Separator />
              <RowSwitch
                title="Novas Demandas"
                desc="Seja notificado sobre novas demandas"
                checked={settings.notifications.newDemands}
                onChange={(v) => updateNotificationSetting("newDemands", v)}
              />
              <Separator />
              <RowSwitch
                title="Atualizações de Status"
                desc="Receba notificações sobre mudanças de status"
                checked={settings.notifications.statusUpdates}
                onChange={(v) => updateNotificationSetting("statusUpdates", v)}
              />
              <Separator />
              <RowSwitch
                title="Lembretes"
                desc="Receba lembretes sobre prazos"
                checked={settings.notifications.reminders}
                onChange={(v) => updateNotificationSetting("reminders", v)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formularios" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#04A4A1]" />
                <CardTitle>Opções dos Formulários</CardTitle>
              </div>
              <CardDescription>
                Configure as opções disponíveis nos formulários de demanda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {Object.entries(formOptions).map(([category, options]) => {
                const cat = category as keyof FormOptions;
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium capitalize">
                        {category}
                      </Label>
                      <Badge variant="secondary">{options.length} opções</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-slate-100 rounded-lg px-3 py-1"
                        >
                          <span className="text-sm">{option}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => removeOption(cat, index)}
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder={`Nova opção para ${category}`}
                        value={newOptionInputs[cat]}
                        onChange={(e) =>
                          setNewOptionInputs((prev) => ({
                            ...prev,
                            [cat]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addOption(cat)} // ✅ onKeyDown
                      />
                      <Button
                        variant="outline"
                        onClick={() => addOption(cat)}
                        disabled={!newOptionInputs[cat].trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                  </div>
                );
              })}
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
              <CardDescription>
                Configure as permissões para cada tipo de usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(permissions).map(([role, rolePermissions]) => (
                <div key={role} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#04A4A1] text-white">{role}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(rolePermissions as any).map(
                      ([module, modulePermissions]) => (
                        <Card key={module} className="border border-slate-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium capitalize">
                              {module}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {Object.entries(modulePermissions as any).map(
                              ([permission, value]) => (
                                <div
                                  key={permission}
                                  className="flex items-center justify-between"
                                >
                                  <Label className="text-xs capitalize">
                                    {permission}
                                  </Label>
                                  <Switch
                                    checked={Boolean(value)}
                                    onCheckedChange={(checked) =>
                                      updatePermission(
                                        role,
                                        module,
                                        permission,
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              )
                            )}
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-[#04A4A1] hover:bg-[#038a87]"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}

/* helper visual */
function RowSwitch({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base">{title}</Label>
        <p className="text-sm text-slate-600">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
