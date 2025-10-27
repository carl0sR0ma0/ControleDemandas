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
import { FormConfigs } from "@/components/form-configs";
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="formularios">Formulários</TabsTrigger>
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
          <FormConfigs />
        </TabsContent>

        {/* Permissões movidas para página Usuários (limpeza de duplicidades) */}
      </Tabs>

      
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
