"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Settings } from "lucide-react"
import {
  getAreas, createArea, updateArea, deleteArea,
  getUnits, createUnit, updateUnit, deleteUnit,
  getSystems, createSystem, updateSystem, deleteSystem,
  getVersions, createVersion, updateVersion, deleteVersion,
  getModules, createModule, updateModule, deleteModule,
} from "@/lib/api/configs"

type Item = { id: string; name: string; active: boolean }

export function FormConfigs() {
  const qc = useQueryClient()

  const areas = useQuery({ queryKey: ["cfg","areas"], queryFn: getAreas })
  const units = useQuery({ queryKey: ["cfg","units"], queryFn: getUnits })
  const systems = useQuery({ queryKey: ["cfg","systems"], queryFn: getSystems })
  const [selectedSystem, setSelectedSystem] = useState<string>("")
  const versions = useQuery({ queryKey: ["cfg","versions", selectedSystem], queryFn: ()=> selectedSystem ? getVersions(selectedSystem) : Promise.resolve([]), enabled: !!selectedSystem })
  const modules = useQuery({ queryKey: ["cfg","modules", selectedSystem], queryFn: ()=> selectedSystem ? getModules(selectedSystem) : Promise.resolve([]), enabled: !!selectedSystem })

  useEffect(()=>{
    if(!selectedSystem && (systems.data?.length||0)>0) setSelectedSystem(systems.data![0].id)
  }, [systems.data?.length])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#04A4A1]" />
          <CardTitle>Formulários</CardTitle>
        </div>
        <CardDescription>Cadastros básicos usados nos formulários</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="areas" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="areas">Áreas</TabsTrigger>
            <TabsTrigger value="unidades">Unidades</TabsTrigger>
            <TabsTrigger value="sistemas">Sistemas</TabsTrigger>
          </TabsList>

          <TabsContent value="areas"><SimpleList title="Áreas" qk={["cfg","areas"]} items={areas.data||[]} onCreate={createArea} onUpdate={updateArea} onDelete={deleteArea} /></TabsContent>
          <TabsContent value="unidades"><SimpleList title="Unidades" qk={["cfg","units"]} items={units.data||[]} onCreate={createUnit} onUpdate={updateUnit} onDelete={deleteUnit} /></TabsContent>
          <TabsContent value="sistemas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <SimpleList title="Sistemas" qk={["cfg","systems"]} items={systems.data||[]} onCreate={createSystem} onUpdate={updateSystem} onDelete={deleteSystem} onSelect={setSelectedSystem} selectedId={selectedSystem}/>
              </div>
              <div className="md:col-span-2 space-y-6">
                <SimpleList
                  title="Versões"
                  small
                  qk={["cfg","versions", selectedSystem]}
                  items={(versions.data||[]).map((v:any)=>({ id: v.id, name: v.version, active: v.active }))}
                  onCreate={(name)=>createVersion(selectedSystem, name)}
                  onUpdate={(id,p)=>updateVersion(selectedSystem, id, { version: p.name, active: p.active})}
                  onDelete={(id)=>deleteVersion(selectedSystem, id)}
                  disabled={!selectedSystem}
                />
                <SimpleList title="Módulos" small qk={["cfg","modules", selectedSystem]} items={modules.data||[]} onCreate={(name)=>createModule(selectedSystem, name)} onUpdate={(id,p)=>updateModule(selectedSystem, id, p)} onDelete={(id)=>deleteModule(selectedSystem, id)} disabled={!selectedSystem}/>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SimpleList({ title, items, onCreate, onUpdate, onDelete, qk, onSelect, selectedId, small, disabled }: {
  title: string
  items: Item[]
  onCreate: (name: string)=>Promise<any>
  onUpdate: (id: string, payload: Partial<Item>)=>Promise<any>
  onDelete: (id: string)=>Promise<any>
  qk: any[]
  onSelect?: (id: string)=>void
  selectedId?: string
  small?: boolean
  disabled?: boolean
}){
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState<string>("")
  const [editingName, setEditingName] = useState<string>("")
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder={`Novo ${title.toLowerCase().slice(0,-1)}`} value={name} onChange={e=>setName(e.target.value)} disabled={disabled}/>
          <Button variant="outline" onClick={async()=>{ if(!name.trim()) return; await onCreate(name.trim()); setName(""); await qc.invalidateQueries({ queryKey: qk }) }} disabled={disabled}><Plus className="w-4 h-4"/></Button>
        </div>
        <Separator/>
        <div className="space-y-2">
          {items.map(it=> (
            <div key={it.id} className={`p-2 rounded border flex items-center justify-between w-full ${selectedId===it.id?"border-teal-600 bg-teal-50":"border-slate-200"}`} onClick={()=>onSelect?.(it.id)}>
              <div className="flex items-center gap-2 min-w-0">
                {editingId === it.id ? (
                  <>
                    <Input className="h-8 w-full max-w-[280px]" value={editingName} onChange={e=>setEditingName(e.target.value)} disabled={disabled} />
                    <Button className="h-8" onClick={async (e)=>{ e.stopPropagation(); if(!editingName.trim()) return; await onUpdate(it.id, { name: editingName.trim() }); setEditingId(""); setEditingName(""); await qc.invalidateQueries({ queryKey: qk }) }} disabled={disabled}>Salvar</Button>
                    <Button variant="outline" className="h-8" onClick={(e)=>{ e.stopPropagation(); setEditingId(""); setEditingName(""); }}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <div className="truncate max-w-[300px]" title={it.name}>{it.name}</div>
                    <Button variant="outline" className="h-8" onClick={(e)=>{ e.stopPropagation(); setEditingId(it.id); setEditingName(it.name); }} disabled={disabled}>Editar</Button>
                  </>
                )}
                <Button variant={it.active?"default":"outline"} className="h-8" onClick={async(e)=>{ e.stopPropagation(); await onUpdate(it.id, { active: !it.active }); await qc.invalidateQueries({ queryKey: qk }) }} disabled={disabled}>{it.active?"Ativo":"Inativo"}</Button>
              </div>
              <Button size="icon" variant="ghost" onClick={async(e)=>{ e.stopPropagation(); await onDelete(it.id); await qc.invalidateQueries({ queryKey: qk })}} disabled={disabled}><Trash2 className="w-4 h-4"/></Button>
            </div>
          ))}
          {!items.length && (<div className="text-sm text-slate-500">Nenhum registro</div>)}
        </div>
      </CardContent>
    </Card>
  )
}
