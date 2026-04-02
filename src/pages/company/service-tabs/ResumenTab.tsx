import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, RefreshCw, Users, CheckCircle2, Calendar,
  BarChart3, AlertCircle, Target, Lightbulb, Edit3, Save, X, Plus, Trash2,
  HelpCircle, FileText, Download, MessageSquare, Crown, Star, Shield, Eye, EyeOff
} from "lucide-react";
import { formatCOP } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function Section({ title, icon: Icon, children, onEdit, isEditing, onSave, onCancel }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  onEdit?: () => void; isEditing?: boolean; onSave?: () => void; onCancel?: () => void;
}) {
  return (
    <section className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Icon className="w-4 h-4 text-primary" /> {title}</h3>
        {isEditing ? (
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Cancelar</Button>
            <Button size="sm" className="h-7 text-[10px]" onClick={onSave}><Save className="w-3 h-3 mr-1" /> Guardar</Button>
          </div>
        ) : onEdit ? (
          <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground" onClick={onEdit}><Edit3 className="w-3 h-3 mr-1" /> Editar</Button>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function ResumenTab({ service, sales, activeSubscriptions, vendorCount, updateService }: any) {
  const { commissionTiers, vendorCommissionAssignments } = useDemo();
  const extended = extendedServiceDetails[service.id];

  // Section-level editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const salesThisMonth = sales.filter((s: any) => s.createdAt.startsWith(thisMonth));
    const gmv = salesThisMonth.reduce((a: number, s: any) => a + (s.amountCOP || s.grossAmount), 0);
    const held = sales.filter((s: any) => s.status === 'HELD').length;
    const released = sales.filter((s: any) => s.status === 'COMPLETED').length;
    const weeklyData: { week: string; ventas: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const ws = new Date(now); ws.setDate(ws.getDate() - i * 7);
      const we = new Date(ws); we.setDate(we.getDate() + 7);
      weeklyData.push({ week: `S${8 - i}`, ventas: sales.filter((s: any) => { const d = new Date(s.createdAt); return d >= ws && d < we; }).length });
    }
    return { total: sales.length, thisMonth: salesThisMonth.length, gmv, held, released, weeklyData };
  }, [sales]);

  const estimatedCommission = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
  const platformFee = Math.round(service.priceCOP * service.mensualistaPct / 100);
  const companyNet = service.priceCOP - estimatedCommission - platformFee;

  const startEdit = (section: string, data: Record<string, any>) => {
    setEditingSection(section);
    setEditData(data);
  };

  const saveSection = (section: string) => {
    if (section === 'pricing') {
      updateService(service.id, { priceCOP: editData.priceCOP, vendorCommissionPct: editData.vendorCommissionPct });
    } else if (section === 'description') {
      updateService(service.id, { description: editData.description });
    }
    setEditingSection(null);
    toast.success("Cambios guardados");
  };

  const kpis = [
    { icon: DollarSign, label: 'GMV este mes', value: formatCOP(metrics.gmv), accent: true },
    { icon: ShoppingCart, label: 'Ventas/mes', value: String(metrics.thisMonth) },
    ...(service.type === 'suscripción' ? [{ icon: RefreshCw, label: 'Suscripciones activas', value: String(activeSubscriptions) }] : []),
    { icon: Users, label: 'Vendedores', value: String(vendorCount) },
    { icon: CheckCircle2, label: 'Liberadas', value: String(metrics.released) },
    { icon: Calendar, label: 'En retención', value: String(metrics.held) },
  ];

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className={`p-3 rounded-xl border text-center ${kpi.accent ? 'bg-primary/5 border-primary/20' : ''}`}>
            <kpi.icon className={`w-4 h-4 mx-auto mb-1 ${kpi.accent ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-lg font-bold">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {metrics.total > 0 && (
        <div className="p-4 rounded-xl border border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Ventas por semana
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={metrics.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="ventas" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pricing */}
      <Section title="Precio y comisiones" icon={DollarSign}
        onEdit={() => startEdit('pricing', { priceCOP: service.priceCOP, vendorCommissionPct: service.vendorCommissionPct })}
        isEditing={editingSection === 'pricing'}
        onSave={() => saveSection('pricing')}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'pricing' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Precio COP</Label>
              <Input type="number" className="h-9" value={editData.priceCOP || ''} onChange={e => setEditData({ ...editData, priceCOP: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Comisión vendedor %</Label>
              <Input type="number" className="h-9" value={editData.vendorCommissionPct || ''} onChange={e => setEditData({ ...editData, vendorCommissionPct: Number(e.target.value) })} />
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between"><span>Comisión vendedor:</span><span className="font-medium text-foreground">{formatCOP(Math.round((editData.priceCOP || 0) * (editData.vendorCommissionPct || 0) / 100))}</span></div>
              <div className="flex justify-between"><span>Fee plataforma ({service.mensualistaPct}%):</span><span className="font-medium text-foreground">{formatCOP(Math.round((editData.priceCOP || 0) * service.mensualistaPct / 100))}</span></div>
              <div className="flex justify-between border-t border-border pt-1 mt-1"><span className="font-medium">Neto empresa:</span><span className="font-bold text-foreground">{formatCOP((editData.priceCOP || 0) - Math.round((editData.priceCOP || 0) * (editData.vendorCommissionPct || 0) / 100) - Math.round((editData.priceCOP || 0) * service.mensualistaPct / 100))}</span></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border bg-primary/5 border-primary/20">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Precio cliente</p>
              <p className="text-xl font-bold text-primary mt-1">{formatCOP(service.priceCOP)}</p>
              <p className="text-[10px] text-muted-foreground">{service.type === 'suscripción' ? 'mensual' : 'pago único'}</p>
            </div>
            <div className="p-3 rounded-xl border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Comisión vendedor</p>
              <p className="text-xl font-bold mt-1">{service.vendorCommissionPct}%</p>
              <p className="text-[10px] text-muted-foreground">{formatCOP(estimatedCommission)}/venta</p>
            </div>
            <div className="p-3 rounded-xl border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Neto empresa</p>
              <p className="text-xl font-bold mt-1">{formatCOP(companyNet)}</p>
              <p className="text-[10px] text-muted-foreground">Fee plat. {service.mensualistaPct}%</p>
            </div>
          </div>
        )}
      </Section>

      {/* Description */}
      <Section title="Descripción" icon={FileText}
        onEdit={() => startEdit('description', { description: extended?.shortDescription || service.description })}
        isEditing={editingSection === 'description'}
        onSave={() => saveSection('description')}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'description' ? (
          <Textarea className="text-sm" rows={3} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{extended?.shortDescription || service.description}</p>
        )}
      </Section>

      {/* Problem / Result / Audience */}
      <Section title="Propuesta de valor" icon={Target}
        onEdit={() => startEdit('value', { problem: extended?.problemSolved || '', result: extended?.promisedResult || '', audience: extended?.targetAudience || '' })}
        isEditing={editingSection === 'value'}
        onSave={() => { setEditingSection(null); toast.success("Propuesta de valor actualizada"); }}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'value' ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3 text-destructive" /> Problema que resuelve</Label>
              <Textarea className="text-sm" rows={2} value={editData.problem} onChange={e => setEditData({ ...editData, problem: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Target className="w-3 h-3 text-emerald-600" /> Resultado prometido</Label>
              <Textarea className="text-sm" rows={2} value={editData.result} onChange={e => setEditData({ ...editData, result: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Users className="w-3 h-3 text-blue-600" /> Audiencia objetivo</Label>
              <Textarea className="text-sm" rows={2} value={editData.audience} onChange={e => setEditData({ ...editData, audience: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-destructive"><AlertCircle className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Problema</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">{extended?.problemSolved || 'No definido'}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600"><Target className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Resultado</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">{extended?.promisedResult || 'No definido'}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-600"><Users className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Audiencia</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">{extended?.targetAudience || 'No definido'}</p>
            </div>
          </div>
        )}
      </Section>

      {/* Sales Pitch */}
      <Section title="Cómo se vende" icon={Lightbulb}
        onEdit={() => startEdit('pitch', {
          pitchOneLine: extended?.pitchOneLine || '',
          pitchThreeLines: extended?.pitchThreeLines || '',
          idealClient: extended?.idealClient || '',
          objections: extended?.objections || [],
        })}
        isEditing={editingSection === 'pitch'}
        onSave={() => { setEditingSection(null); toast.success("Pitch actualizado"); }}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'pitch' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Pitch en una frase</Label>
              <Input className="h-9" value={editData.pitchOneLine} onChange={e => setEditData({ ...editData, pitchOneLine: e.target.value })} placeholder="Ej: Cotiza seguros en 30 segundos con IA" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Guión corto (3 líneas)</Label>
              <Textarea className="text-sm" rows={3} value={editData.pitchThreeLines} onChange={e => setEditData({ ...editData, pitchThreeLines: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cliente ideal</Label>
              <Textarea className="text-sm" rows={2} value={editData.idealClient} onChange={e => setEditData({ ...editData, idealClient: e.target.value })} />
            </div>
            {/* Objections editor */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Objeciones y respuestas</Label>
              {(editData.objections || []).map((obj: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                  <Input className="h-8 text-xs" placeholder="Objeción" value={obj.objection}
                    onChange={e => { const o = [...editData.objections]; o[i] = { ...o[i], objection: e.target.value }; setEditData({ ...editData, objections: o }); }} />
                  <Input className="h-8 text-xs" placeholder="Respuesta" value={obj.response}
                    onChange={e => { const o = [...editData.objections]; o[i] = { ...o[i], response: e.target.value }; setEditData({ ...editData, objections: o }); }} />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"
                    onClick={() => setEditData({ ...editData, objections: editData.objections.filter((_: any, j: number) => j !== i) })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-7 text-[10px]"
                onClick={() => setEditData({ ...editData, objections: [...(editData.objections || []), { objection: '', response: '' }] })}>
                <Plus className="w-3 h-3 mr-1" /> Agregar objeción
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Pitch en una frase</p>
              <p className="text-sm font-medium italic text-foreground">"{extended?.pitchOneLine || `${service.name} automatiza tu trabajo.`}"</p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Guión corto</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{extended?.pitchThreeLines || 'No definido'}</p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Cliente ideal</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{extended?.idealClient || 'No definido'}</p>
            </div>
            {extended?.objections && extended.objections.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Objeciones ({extended.objections.length})</p>
                {extended.objections.map((obj: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 space-y-1">
                    <p className="text-xs font-medium text-foreground">"{obj.objection}"</p>
                    <p className="text-[11px] text-muted-foreground">→ {obj.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Features */}
      <Section title="Qué incluye" icon={CheckCircle2}
        onEdit={() => startEdit('features', {
          features: extended?.features || [],
          notIncluded: extended?.notIncluded || [],
        })}
        isEditing={editingSection === 'features'}
        onSave={() => { setEditingSection(null); toast.success("Características actualizadas"); }}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'features' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-emerald-600">Incluye</Label>
              {(editData.features || []).map((f: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input className="h-8 text-xs flex-1" value={f}
                    onChange={e => { const fs = [...editData.features]; fs[i] = e.target.value; setEditData({ ...editData, features: fs }); }} />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"
                    onClick={() => setEditData({ ...editData, features: editData.features.filter((_: any, j: number) => j !== i) })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-7 text-[10px]"
                onClick={() => setEditData({ ...editData, features: [...(editData.features || []), ''] })}>
                <Plus className="w-3 h-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-destructive">No incluye</Label>
              {(editData.notIncluded || []).map((f: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input className="h-8 text-xs flex-1" value={f}
                    onChange={e => { const fs = [...editData.notIncluded]; fs[i] = e.target.value; setEditData({ ...editData, notIncluded: fs }); }} />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"
                    onClick={() => setEditData({ ...editData, notIncluded: editData.notIncluded.filter((_: any, j: number) => j !== i) })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-7 text-[10px]"
                onClick={() => setEditData({ ...editData, notIncluded: [...(editData.notIncluded || []), ''] })}>
                <Plus className="w-3 h-3 mr-1" /> Agregar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-medium">Incluye</p>
              {(extended?.features || []).map((f: string, i: number) => (
                <p key={i} className="text-xs text-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" /> {f}
                </p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-destructive font-medium">No incluye</p>
              {(extended?.notIncluded || []).map((f: string, i: number) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <X className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" /> {f}
                </p>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Materials */}
      <Section title="Materiales de venta" icon={Download}
        onEdit={() => startEdit('materials', {})}
        isEditing={editingSection === 'materials'}
        onSave={() => { setEditingSection(null); toast.success("Materiales actualizados"); }}
        onCancel={() => setEditingSection(null)}
      >
        {editingSection === 'materials' ? (
          <div className="space-y-3">
            {[
              { key: 'brochure', label: 'Brochure', icon: FileText },
              { key: 'salesScript', label: 'Guión de ventas', icon: MessageSquare },
              { key: 'priceList', label: 'Lista de precios', icon: DollarSign },
              { key: 'faq', label: 'FAQ', icon: HelpCircle },
            ].map(m => (
              <div key={m.key} className="space-y-1">
                <Label className="text-xs flex items-center gap-1"><m.icon className="w-3 h-3" /> {m.label}</Label>
                <div className="flex gap-2">
                  <Input className="h-8 text-xs flex-1" placeholder="URL del archivo o subir..." value={editData[m.key] || ''} onChange={e => setEditData({ ...editData, [m.key]: e.target.value })} />
                  <Button size="sm" variant="outline" className="h-8 text-[10px]">Subir</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: 'Brochure', icon: FileText },
              { name: 'Guión de ventas', icon: MessageSquare },
              { name: 'Lista de precios', icon: DollarSign },
              { name: 'FAQ', icon: HelpCircle },
            ].map(m => (
              <div key={m.name} className="p-3 rounded-xl border flex flex-col items-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors text-center">
                <m.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{m.name}</span>
                <Download className="w-3 h-3 text-primary" />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
