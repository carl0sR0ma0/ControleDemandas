"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Shield, Users } from "lucide-react"
import { getProfiles, createProfile, updateProfile, setProfilePermissions, deleteProfile, type ProfileVm } from "@/lib/api/profiles"
import { getCatalog, type CatalogItem } from "@/lib/api/permissions"

export function ProfilesManager() {
  const qc = useQueryClient()
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: getProfiles })
  const { data: catalog = [] } = useQuery({ queryKey: ["permissions", "catalog"], queryFn: getCatalog })
  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [creating, setCreating] = useState({ name: "", badgeClass: "" })
  const [rename, setRename] = useState<{ id: string; name: string }>({ id: "", name: "" })
  const [selectedId, setSelectedId] = useState<string>("")
  const [badgeClass, setBadgeClass] = useState<string>("")

  const selected = profiles.find(p => p.id === selectedId) || null

  useEffect(() => {
    setBadgeClass(selected?.badgeClass ?? "")
  }, [selected?.id])

  const grouped = useMemo(() => {
    return (catalog as CatalogItem[]).reduce((acc, p) => {
      acc[p.category] = acc[p.category] || []
      acc[p.category].push(p)
      return acc
    }, {} as Record<string, CatalogItem[]>)
  }, [catalog])

  const hasFlag = (mask: number, v: number) => (mask & v) === v

  const onCreate = async () => {
    if (!creating.name.trim()) return
    await createProfile({ name: creating.name.trim(), badgeClass: creating.badgeClass || undefined })
    setOpen(false)
    setCreating({ name: "", badgeClass: "" })
    await qc.invalidateQueries({ queryKey: ["profiles"] })
  }

  const togglePerm = async (item: CatalogItem, on: boolean) => {
    if (!selected) return
    const codes = (catalog as CatalogItem[])
      .filter(c => c.category) // all
      .filter(c => c.code === item.code ? on : hasFlag(selected.permissions, c.value))
      .map(c => c.code)
    await setProfilePermissions(selected.id, codes)
    await qc.invalidateQueries({ queryKey: ["profiles"] })
  }

  const onRename = async (name: string) => {
    if (!selected) return
    await updateProfile(selected.id, { name })
    await qc.invalidateQueries({ queryKey: ["profiles"] })
  }

  const onDelete = async (id: string) => {
    await deleteProfile(id)
    if (selectedId === id) setSelectedId("")
    await qc.invalidateQueries({ queryKey: ["profiles"] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Perfis</h1>
          <p className="text-slate-600 mt-1">Gerencie os perfis de acesso</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">Novo perfil</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo perfil</DialogTitle>
              <DialogDescription>Informe o nome do perfil</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={creating.name} onChange={(e)=>setCreating({name: e.target.value})} />
              </div>
              <div>
                <Label>Classe do badge (Tailwind ou preset ex.: badge-yellow)</Label>
                <Input value={creating.badgeClass} onChange={(e)=>setCreating({ ...creating, badgeClass: e.target.value })} placeholder="ex.: bg-emerald-50 text-emerald-700" />
                <div className="mt-2">
                  <Badge variant="secondary" className={creating.badgeClass || "bg-slate-100 text-slate-700"}>Exemplo</Badge>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={onCreate} className="bg-teal-600 hover:bg-teal-700">Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogo para renomear perfil */}
        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Renomear perfil</DialogTitle>
              <DialogDescription>Atualize o nome do perfil selecionado</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Novo nome</Label>
                <Input value={rename.name} onChange={(e)=>setRename(prev=>({...prev, name: e.target.value}))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setRenameOpen(false)}>Cancelar</Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={async ()=>{ if(!rename.id.trim()) return; await updateProfile(rename.id, { name: rename.name.trim() }); setRenameOpen(false); await qc.invalidateQueries({ queryKey: ["profiles"] }); }}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5" /> Perfis
            </CardTitle>
            <CardDescription>Selecione um perfil para editar permissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedId===p.id?"border-teal-600 bg-teal-50":"border-slate-200 hover:border-slate-300"}`} onClick={()=>setSelectedId(p.id)}>
                <div className="flex items-center gap-3 justify-between">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{p.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">{p.active?"Ativo":"Inativo"}</Badge>
                      <div className="flex items-center text-xs text-slate-600"><Users className="w-3 h-3 mr-1"/>{p.userCount}</div>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={(e)=>{e.stopPropagation(); setRename({ id: p.id, name: p.name }); setRenameOpen(true);}}>Renomear</Button>
                    <Button size="icon" variant="ghost" onClick={(e)=>{e.stopPropagation(); onDelete(p.id)}}>
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selected ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Permissões – {selected.name}</CardTitle>
                <CardDescription>Ajuste as permissões deste perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Classe do badge (Tailwind ou preset ex.: badge-yellow)</Label>
                    <Input value={badgeClass} onChange={(e)=>setBadgeClass(e.target.value)} placeholder="ex.: bg-emerald-50 text-emerald-700" />
                    <div className="mt-2">
                      <Badge variant="secondary" className={badgeClass || "bg-slate-100 text-slate-700"}>Exemplo</Badge>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button className="bg-teal-600 hover:bg-teal-700" onClick={async ()=>{ if(!selected) return; await updateProfile(selected.id, { badgeClass }); await qc.invalidateQueries({ queryKey: ["profiles"] }) }}>Salvar estilo</Button>
                  </div>
                </div>
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-slate-900 mb-3">{category}</h3>
                    <div className="space-y-3">
                      {items.map((p) => (
                        <div key={p.code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{p.name}</p>
                            <p className="text-sm text-slate-600">{p.description}</p>
                          </div>
                          <Switch
                            checked={hasFlag(selected.permissions, p.value)}
                            onCheckedChange={(on) => togglePerm(p, on)}
                          />
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-slate-500">Selecione um perfil</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

