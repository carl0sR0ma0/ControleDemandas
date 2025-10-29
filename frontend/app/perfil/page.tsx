"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Key, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/useProfile";
import { useAreas } from "@/hooks/useConfigs";

export default function PerfilPage() {
  useAuthGuard();

  const { data: profile, isLoading } = useProfile();
  const { data: areas = [] } = useAreas();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    areaId: "",
  });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleEditStart = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || "",
        areaId: profile.areaId || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || "",
        areaId: profile.areaId || "",
      });
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError("Preencha todos os campos");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordSuccess(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Erro ao alterar senha");
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: "bg-red-100 text-red-800",
      Gestor: "bg-blue-100 text-blue-800",
      Colaborador: "bg-green-100 text-green-800",
    };
    return colors[role] ?? "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#04A4A1]" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-600 mt-1">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-[#04A4A1] text-white text-2xl">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge className={getRoleColor(profile.role)}>{profile.role}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-slate-600">Membro desde</p>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {profile.areaName && (
              <>
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-slate-600">Área</p>
                  <p className="font-medium">{profile.areaName}</p>
                </div>
              </>
            )}
            <Separator />
            <div className="text-center">
              <p className="text-sm text-slate-600">Demandas Criadas</p>
              <p className="font-medium text-[#04A4A1]">{profile.demandsCount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={handleEditStart}>
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfile.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="bg-[#04A4A1] hover:bg-[#038a87]"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {updateProfile.isSuccess && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Perfil atualizado com sucesso!
                </AlertDescription>
              </Alert>
            )}
            {updateProfile.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao atualizar perfil. Tente novamente.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={isEditing ? formData.name : profile.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">
                  O e-mail não pode ser alterado
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={isEditing ? formData.phone : (profile.phone || "")}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                {isEditing ? (
                  <Select
                    value={formData.areaId || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, areaId: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="area"
                    value={profile.areaName || "Não definida"}
                    disabled
                    className="bg-slate-50"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Gerencie suas configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#04A4A1] bg-opacity-10 rounded-lg">
                  <Key className="h-5 w-5 text-[#04A4A1]" />
                </div>
                <div>
                  <p className="font-medium">Alterar Senha</p>
                  <p className="text-sm text-slate-600">
                    Mantenha sua conta segura
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e escolha uma nova senha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Senha alterada com sucesso!
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                disabled={changePassword.isPending || passwordSuccess}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                disabled={changePassword.isPending || passwordSuccess}
              />
              <p className="text-xs text-slate-500">
                Mínimo de 6 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={changePassword.isPending || passwordSuccess}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPasswordDialogOpen(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordError("");
                  setPasswordSuccess(false);
                }}
                disabled={changePassword.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={changePassword.isPending || passwordSuccess}
                className="bg-[#04A4A1] hover:bg-[#038a87]"
              >
                {changePassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
