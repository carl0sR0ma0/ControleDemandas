"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Shield, Users, Settings, Eye, Edit } from "lucide-react"
import { getCatalog, listUsers as listUsersWithPerms } from "@/lib/api/permissions"
import { getProfiles, applyProfileToUser } from "@/lib/api/profiles"
import { listUsers, createUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, updateUserPermissions } from "@/lib/api/users"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"

type CatalogItem = { code: string; value: number; name: string; description: string; category: string }
import { getAreas } from "@/lib/api/configs"
type UserRow = { id: string; name: string; email: string; active: boolean; permissions: number; createdAt: string }

export function PermissionsManager() {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [adding, setAdding] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", profileId: "", areaId: "", phone: "" })
  const [editUser, setEditUser] = useState<{ name: string; email: string; active: boolean; areaId?: string; phone?: string } | null>(null)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwd1, setPwd1] = useState("")
  const [pwd2, setPwd2] = useState("")
  const queryClient = useQueryClient()

  // Queries com cache para evitar chamadas duplicadas (StrictMode)
  const { data: catalog = [], isFetching: fetchingCatalog } = useQuery({
    queryKey: ["permissions", "catalog"],
    queryFn: getCatalog,
  })
  const { data: users = [], isFetching: fetchingUsers } = useQuery({
    queryKey: ["permissions", "users"],
    queryFn: async () => (await listUsersWithPerms()) as any as UserRow[],
  })
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: getProfiles })
  const { data: areas = [] } = useQuery({ queryKey: ["areas"], queryFn: getAreas })
  const profileMap = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles])
  const loading = fetchingCatalog || fetchingUsers

  const grouped = useMemo(() => {
    return catalog.reduce((acc, p) => {
      acc[p.category] = acc[p.category] || []
      acc[p.category].push(p)
      return acc
    }, {} as Record<string, CatalogItem[]>)
  }, [catalog])

  const selectedUser = users.find((u) => u.id === selectedUserId)
  const selectedIsAdmin = selectedUser?.email?.toLowerCase() === "admin@empresa.com"

  const sortedUsers = useMemo(() => {
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })
    const arr = [...users]
    arr.sort((a: any, b: any) => {
      const pa = (a.profile ?? '') as string
      const pb = (b.profile ?? '') as string
      const aHas = pa.trim().length > 0
      const bHas = pb.trim().length > 0
      if (aHas && !bHas) return -1 // com perfil vem antes
      if (!aHas && bHas) return 1   // sem perfil vai pro final
      if (aHas && bHas) {
        const byProfile = collator.compare(pa, pb)
        if (byProfile !== 0) return byProfile
      }
      return collator.compare(a.name, b.name)
    })
    return arr
  }, [users])

  // Seleciona o primeiro usuário quando a lista carregar
  useEffect(() => {
    if (!selectedUserId && users?.length) setSelectedUserId(users[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users?.length])

  useEffect(() => {
    if (selectedUser) {
      setEditUser({ name: selectedUser.name, email: (selectedUser as any).email, active: (selectedUser as any).active, areaId: (selectedUser as any).areaId ?? "", phone: (selectedUser as any).phone ?? "" })
    } else {
      setEditUser(null)
    }
  }, [selectedUserId, users])

  // Single profile defines permissions

  const hasFlag = (flags: number, value: number) => (flags & value) === value

  const updateUser = async (user: UserRow, newFlags: number) => {
    const codes = catalog.filter(c => (newFlags & c.value) === c.value).map(c => c.code)
    await updateUserPermissions(user.id, codes)
    // Atualiza cache local sem refazer todas chamadas
    queryClient.setQueryData<UserRow[]>(["permissions", "users"], (prev) =>
      (prev ?? []).map(u => u.id === user.id ? { ...u, permissions: newFlags } as any : u)
    )
  }

  const applyProfile = async (profileId: string) => {
    if (!selectedUser) return
    await applyProfileToUser(selectedUser.id, profileId)
    await queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
  }

  const togglePermission = async (item: CatalogItem, on: boolean) => {
    if (!selectedUser) return
    const prev = selectedUser.permissions
    const next = on ? prev | item.value : prev & ~item.value
    await updateUser(selectedUser, next)
  }

  // Role application removed

  const onCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    let codes: string[] = []
    if (!newUser.profileId) return
    const prof = profiles.find(p => p.id === newUser.profileId)
    if (prof) {
      codes = catalog.filter(c => ((prof.permissions & c.value) === c.value)).map(c => c.code)
    }
    const res = await createUser({ ...newUser, permissionCodes: codes, profileId: newUser.profileId || undefined, areaId: newUser.areaId || undefined })
    setAdding(false)
    setNewUser({ name: "", email: "", password: "", profileId: "", areaId: "", phone: "" })
    await queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
    setSelectedUserId(res.id)
  }

  const onDeleteUser = async (id: string) => {
    if (selectedIsAdmin) return
    await apiDeleteUser(id)
    if (selectedUserId === id) setSelectedUserId("")
    await queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
  }

  const onSaveUserDetails = async () => {
    if (!selectedUser || !editUser) return
    await apiUpdateUser(selectedUser.id, editUser)
    await queryClient.invalidateQueries({ queryKey: ["permissions", "users"] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de usuários e Permissões</h1>
          <p className="text-slate-600 mt-1">Configure as Permissões de acesso dos usuários</p>
        </div>
        <Dialog open={adding} onOpenChange={setAdding}>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={()=>setAdding(true)}>
            <Plus className="w-4 h-4 mr-1"/> Novo usuário
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo usuário</DialogTitle>
              <DialogDescription>Informe os dados básicos. As Permissões podem ser ajustadas após criar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={newUser.name} onChange={(e)=>setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input type="tel" value={newUser.phone} onChange={(e)=>setNewUser({...newUser, phone: e.target.value})} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label>Senha</Label>
                <Input type="password" value={newUser.password} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                <Label>Perfil</Label>
                <Select value={newUser.profileId} onValueChange={(v)=>setNewUser({...newUser, profileId: v})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione"/></SelectTrigger>
                  <SelectContent>
                    {profiles.map(p=> (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    {!profiles.length && (<SelectItem value="no-profiles" disabled>Sem perfis</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Área</Label>
                <Select value={newUser.areaId} onValueChange={(v)=>setNewUser({...newUser, areaId: v})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione"/></SelectTrigger>
                  <SelectContent>
                    {areas.map((a: any)=> (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={onCreateUser} className="bg-teal-600 hover:bg-teal-700">Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5" /> Usuários
            </CardTitle>
            <CardDescription>Selecione um usuário para gerenciar Permissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedUsers.map((u) => (
              <div
                key={u.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUserId === u.id ? "border-teal-600 bg-teal-50" : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedUserId(u.id)}
              >
                <div className="flex items-center gap-3 justify-between">
                  {/* Removed initial avatar for cleaner look */}
                  <div>
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      {u.name}
                      {(u as any).isSpecial && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">Especial</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      {(u as any).profile && (
                        <Badge
                          variant="secondary"
                          className={profileMap[((u as any).profileId ?? "")]?.badgeClass ?? "bg-slate-100 text-slate-700"}
                        >
                          {profileMap[((u as any).profileId ?? "")]?.name ?? (u as any).profile}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {/* Removed inline 'Aplicar perfil' select; applying profile is available only when selected */}
                    <Button variant="ghost" size="icon" disabled={(u as any).email?.toLowerCase()==='admin@empresa.com'} onClick={()=>{ onDeleteUser(u.id) }}>
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedUser ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Permissões — {selectedUser.name}
                </CardTitle>
                <CardDescription>Ative ou desative Permissões específicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input value={editUser.name} onChange={(e)=>setEditUser({...editUser, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={editUser.email} onChange={(e)=>setEditUser({...editUser, email: e.target.value})} />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input type="tel" value={editUser.phone || ""} onChange={(e)=>setEditUser({...editUser, phone: e.target.value})} placeholder="(11) 99999-9999" />
                    </div>
                    <div>
                      <Label>Perfil</Label>
                      <Select value={(selectedUser as any).profileId ?? ""} onValueChange={(v)=>applyProfile(v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                          {profiles.map(p=> (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                          {!profiles.length && (<SelectItem value="no-profiles" disabled>Sem perfis</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Área</Label>
                      <Select value={(editUser as any)?.areaId ?? ""} onValueChange={(v)=>setEditUser({ ...(editUser as any), areaId: v })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                          {(areas || []).map((a: any)=> (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={()=>{ setPwd1(""); setPwd2(""); setPwdOpen(true); }}>Alterar senha</Button>
                    </div>
                    <div className="flex justify-end md:col-span-2">
                      <Button onClick={onSaveUserDetails} className="bg-teal-600 hover:bg-teal-700">Salvar dados</Button>
                    </div>
                  </div>
                )}

                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      {category === "Dashboard" && <Eye className="h-4 w-4" />}
                      {category === "Demandas" && <Edit className="h-4 w-4" />}
                      {category === "Sistema" && <Settings className="h-4 w-4" />}
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {items.map((p) => (
                        <div key={p.code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{p.name}</p>
                            <p className="text-sm text-slate-600">{p.description}</p>
                          </div>
                          <Switch
                            checked={hasFlag(selectedUser.permissions, p.value)}
                            onCheckedChange={(on) => togglePermission(p, on)}
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                    {category !== "Sistema" && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Selecione um usuário para gerenciar suas Permissões</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Modal de alteração de senha */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Defina a nova senha do usuário</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nova senha</Label>
              <Input type="password" value={pwd1} onChange={e=>setPwd1(e.target.value)} />
            </div>
            <div>
              <Label>Confirmar senha</Label>
              <Input type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setPwdOpen(false)}>Cancelar</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={async()=>{
                if(!selectedUser) return;
                if(!pwd1 || pwd1 !== pwd2) return;
                await apiUpdateUser(selectedUser.id, { password: pwd1 });
                setPwdOpen(false); setPwd1(""); setPwd2("");
              }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}




