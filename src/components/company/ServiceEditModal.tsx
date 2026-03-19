import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatCOP, formatDate, type Service, type Sale } from "@/data/mockData";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import {
  Edit3, Save, X, DollarSign, Package, RefreshCw, Zap,
  Check, AlertCircle, Target, Users, Lightbulb, HelpCircle,
  Upload, FileText, Download, Shield, Globe, Key, TrendingUp,
  ShoppingCart, BarChart3, ExternalLink, MessageSquare, Play,
  CheckCircle2, Calendar, Eye
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import insuranceImg from "@/assets/service-covers/insurance-ai.jpg";
import legalImg from "@/assets/service-covers/legal-ai.jpg";
import marketingImg from "@/assets/service-covers/marketing-ai.jpg";
import salesImg from "@/assets/service-covers/sales-ai.jpg";
import supportImg from "@/assets/service-covers/support-ai.jpg";
import accountingImg from "@/assets/service-covers/accounting-ai.jpg";
import hrImg from "@/assets/service-covers/hr-ai.jpg";
import securityImg from "@/assets/service-covers/security-ai.jpg";

const categoryCovers: Record<string, string> = {
  'IA para Seguros': insuranceImg,
  'IA Legal': legalImg,
  'IA para Marketing': marketingImg,
  'IA para Ventas': salesImg,
  'IA para Atención': supportImg,
  'IA para Contabilidad': accountingImg,
  'IA para RRHH': hrImg,
  'IA para Ciberseguridad': securityImg,
};

interface ServiceEditModalProps {
  service: Service | null;
  sales: Sale[];
  onClose: () => void;
  onSave: (updatedService: Partial<Service>) => void;
}

export default function ServiceEditModal({ service, sales, onClose, onSave }: ServiceEditModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Service>>({});

  const details = service ? extendedServiceDetails[service.id] : null;
  const coverImg = service ? categoryCovers[service.category] : '';

  const metrics = useMemo(() => {
    if (!service) return null;
    const serviceSales = sales.filter(s => s.serviceId === service.id);
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);
    const salesThisMonth = serviceSales.filter(s => s.createdAt.startsWith(thisMonth));
    const salesLastMonth = serviceSales.filter(s => s.createdAt.startsWith(lastMonth));
    const gmvThisMonth = salesThisMonth.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
    const heldSales = serviceSales.filter(s => s.status === 'HELD');
    const releasedSales = serviceSales.filter(s => s.status === 'RELEASED');

    const weeklyData: { week: string; ventas: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekSales = serviceSales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= weekStart && d < weekEnd;
      });
      weeklyData.push({ week: `S${8 - i}`, ventas: weekSales.length });
    }

    return {
      totalSales: serviceSales.length,
      salesThisMonth: salesThisMonth.length,
      salesGrowth: salesLastMonth.length > 0
        ? Math.round(((salesThisMonth.length - salesLastMonth.length) / salesLastMonth.length) * 100)
        : 0,
      gmvThisMonth,
      heldCount: heldSales.length,
      releasedCount: releasedSales.length,
      weeklyData,
      recentSales: serviceSales.slice(0, 5),
    };
  }, [service, sales]);

  const handleStartEdit = () => {
    if (!service) return;
    setEditData({
      name: service.name,
      description: service.description,
      priceCOP: service.priceCOP,
      vendorCommissionPct: service.vendorCommissionPct,
      requiresTraining: service.requiresTraining,
      trainingUrl: service.trainingUrl,
      refundPolicy: { ...service.refundPolicy },
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  if (!service || !metrics) return null;

  const codes = service.activationCodes;
  const codesAvailable = codes.filter(c => c.status === 'available').length;
  const codesDelivered = codes.filter(c => c.status === 'delivered').length;
  const codesPct = codes.length > 0 ? (codesAvailable / codes.length) * 100 : 0;

  return (
    <Dialog open={!!service} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden gap-0">
        {/* Hero Cover */}
        <div className="relative h-44 sm:h-52 overflow-hidden flex-shrink-0">
          <img src={coverImg} alt={service.category} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge className={service.type === 'suscripción' ? 'bg-blue-500 hover:bg-blue-600 text-white border-0' : 'bg-purple-500 hover:bg-purple-600 text-white border-0'}>
              {service.type === 'suscripción' ? <><RefreshCw className="w-3 h-3 mr-1" /> Recurrente</> : <><Zap className="w-3 h-3 mr-1" /> Puntual</>}
            </Badge>
            <Badge className={service.status === 'activo' ? 'bg-green-500 text-white border-0' : 'bg-yellow-500 text-white border-0'}>
              {service.status === 'activo' ? 'Activo' : 'Pausado'}
            </Badge>
          </div>

          {/* Edit button on hero */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/90 hover:bg-white text-foreground" onClick={handleStartEdit}>
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Editar
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/90 hover:bg-white" onClick={() => { setIsEditing(false); setEditData({}); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                </Button>
                <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>
                  <Save className="w-3.5 h-3.5 mr-1" /> Guardar
                </Button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white/70 text-xs mb-1">{service.category}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{service.name}</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(92vh-11rem)]">
          <div className="p-5 sm:p-6 space-y-8">

            {/* ── Metrics Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border bg-primary/5 border-primary/20 text-center">
                <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{formatCOP(metrics.gmvThisMonth)}</p>
                <p className="text-[10px] text-muted-foreground">Vendido este mes</p>
              </div>
              <div className="p-3 rounded-xl border text-center">
                <ShoppingCart className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{metrics.salesThisMonth}</p>
                <p className="text-[10px] text-muted-foreground">Ventas/mes</p>
              </div>
              <div className="p-3 rounded-xl border text-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{metrics.releasedCount}</p>
                <p className="text-[10px] text-muted-foreground">Liberadas</p>
              </div>
              <div className="p-3 rounded-xl border text-center">
                <Calendar className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{metrics.heldCount}</p>
                <p className="text-[10px] text-muted-foreground">En retención</p>
              </div>
            </div>

            {/* ── Sales Chart ── */}
            {metrics.totalSales > 0 && (
              <section className="p-4 rounded-xl border">
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
              </section>
            )}

            {/* ── Pricing (editable) ── */}
            <section>
              <h3 className="text-sm font-semibold mb-3">Precio y comisiones</h3>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Precio COP</Label>
                    <Input type="number" className="h-9" value={editData.priceCOP || ''} onChange={e => setEditData({ ...editData, priceCOP: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Comisión vendedor %</Label>
                    <Input type="number" className="h-9" value={editData.vendorCommissionPct || ''} onChange={e => setEditData({ ...editData, vendorCommissionPct: Number(e.target.value) })} />
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
                    <p className="text-[10px] text-muted-foreground">{formatCOP(Math.round(service.priceCOP * service.vendorCommissionPct / 100))}/venta</p>
                  </div>
                  <div className="p-3 rounded-xl border">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Fee plataforma</p>
                    <p className="text-xl font-bold mt-1">{service.mensualistaPct}%</p>
                    <p className="text-[10px] text-muted-foreground">{formatCOP(Math.round(service.priceCOP * service.mensualistaPct / 100))}/venta</p>
                  </div>
                </div>
              )}
            </section>

            {/* ── Description (editable) ── */}
            <section>
              <h3 className="text-sm font-semibold mb-2">Descripción</h3>
              {isEditing ? (
                <Textarea className="text-sm" rows={3} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{details?.shortDescription || service.description}</p>
              )}
            </section>

            {/* ── Problem / Result / Audience ── */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border bg-muted/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Problema</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{details?.problemSolved || 'Procesos manuales lentos.'}</p>
              </div>
              <div className="p-3 rounded-xl border bg-green-500/5 border-green-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Target className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Resultado</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{details?.promisedResult || 'Ahorro de tiempo y productividad.'}</p>
              </div>
              <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Audiencia</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{details?.targetAudience || 'Empresas en Colombia.'}</p>
              </div>
            </div>

            {/* ── Activation Codes ── */}
            <section className="p-4 rounded-xl border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Códigos de activación
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-xl font-bold">{codes.length}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{codesAvailable}</p>
                  <p className="text-[10px] text-muted-foreground">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{codesDelivered}</p>
                  <p className="text-[10px] text-muted-foreground">Entregados</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stock</span>
                  <span className={codesAvailable < 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{codesAvailable} disponibles</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${codesAvailable === 0 ? 'bg-destructive' : codesAvailable < 5 ? 'bg-amber-500' : 'bg-primary'}`}
                    style={{ width: `${codesPct}%` }}
                  />
                </div>
              </div>
              {codesAvailable < 5 && (
                <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${codesAvailable === 0 ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-700'}`}>
                  {codesAvailable === 0 ? '⚠️ Sin códigos. Las ventas no se completarán.' : `⚠️ Quedan solo ${codesAvailable} códigos.`}
                </div>
              )}
            </section>

            {/* ── What's Included ── */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Qué incluye
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {(details?.features || ['Acceso completo', 'Soporte técnico', 'Actualizaciones', 'Panel admin', 'Reportes']).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-green-500/5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Sales Pitch ── */}
            <section className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" /> Cómo se vende
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Pitch en una frase</p>
                  <p className="text-sm font-medium italic">"{details?.pitchOneLine || `${service.name} automatiza tu trabajo.`}"</p>
                </div>
                <div className="border-t border-primary/10 pt-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Guión corto</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{details?.pitchThreeLines || 'Guión de ventas del servicio.'}</p>
                </div>
              </div>
            </section>

            {/* ── Objections ── */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Objeciones y respuestas
              </h3>
              <div className="space-y-2">
                {(details?.objections || [
                  { objection: '¿Es muy caro?', response: 'El ROI se ve en el primer mes.' },
                  { objection: '¿Es difícil?', response: 'La interfaz es intuitiva.' },
                ]).slice(0, 4).map((obj, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/20">
                    <p className="text-xs font-medium">❓ {obj.objection}</p>
                    <p className="text-xs text-muted-foreground mt-1">✅ {obj.response}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Refund Policy (editable) ── */}
            <section className="p-4 rounded-xl border bg-muted/20">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Política de devoluciones
              </h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Ventana de devolución</Label>
                      <Select
                        value={String(editData.refundPolicy?.refundWindowDays || 14)}
                        onValueChange={v => setEditData({ ...editData, refundPolicy: { ...editData.refundPolicy!, refundWindowDays: Number(v) as 7 | 14 | 30 } })}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 días</SelectItem>
                          <SelectItem value="14">14 días</SelectItem>
                          <SelectItem value="30">30 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <Switch
                        checked={editData.refundPolicy?.autoRefund || false}
                        onCheckedChange={v => setEditData({ ...editData, refundPolicy: { ...editData.refundPolicy!, autoRefund: v } })}
                      />
                      <Label className="text-xs">Automática</Label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Tipo</p>
                    <p className="text-sm font-medium">{service.refundPolicy.autoRefund ? 'Automática' : 'Aprobación manual'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ventana</p>
                    <p className="text-sm font-medium">{service.refundPolicy.refundWindowDays} días</p>
                  </div>
                </div>
              )}
            </section>

            {/* ── Training ── */}
            <section className="p-4 rounded-xl border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Capacitación
              </h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editData.requiresTraining ?? service.requiresTraining}
                      onCheckedChange={v => setEditData({ ...editData, requiresTraining: v })}
                    />
                    <Label className="text-xs">Requiere capacitación</Label>
                  </div>
                  {(editData.requiresTraining ?? service.requiresTraining) && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">URL de capacitación</Label>
                      <Input className="h-9 text-sm" value={editData.trainingUrl || service.trainingUrl || ''} onChange={e => setEditData({ ...editData, trainingUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {service.trainingType === 'video' ? <Play className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                    <div>
                      <p className="text-sm font-medium">
                        {service.requiresTraining ? `Capacitación en ${service.trainingType?.toUpperCase() || 'PDF'}` : 'Sin capacitación requerida'}
                      </p>
                      <p className="text-xs text-muted-foreground">~{details?.trainingDurationMinutes || 15} min</p>
                    </div>
                  </div>
                  {service.requiresTraining && (
                    <Badge className="bg-green-500/10 text-green-600 border-0">Activa</Badge>
                  )}
                </div>
              )}
            </section>

            {/* ── Materials ── */}
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" /> Materiales de venta
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Brochure', icon: FileText },
                  { name: 'Guión de ventas', icon: MessageSquare },
                  { name: 'Lista de precios', icon: DollarSign },
                  { name: 'FAQ', icon: HelpCircle },
                ].map((m) => (
                  <div key={m.name} className="p-2.5 rounded-lg border flex items-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.name}</span>
                    <Download className="w-3 h-3 text-primary ml-auto" />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Recent Sales ── */}
            {metrics.recentSales.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" /> Ventas recientes
                </h3>
                <div className="space-y-1.5">
                  {metrics.recentSales.map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-2.5 border rounded-lg text-xs">
                      <div>
                        <p className="font-medium">{sale.clientName}</p>
                        <p className="text-muted-foreground">{formatDate(sale.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCOP(sale.amountCOP || sale.grossAmount)}</p>
                        <Badge className={`text-[9px] ${sale.status === 'RELEASED' ? 'bg-green-500/10 text-green-600' : sale.status === 'HELD' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-purple-500/10 text-purple-600'}`}>
                          {sale.status === 'RELEASED' ? 'Liberada' : sale.status === 'HELD' ? 'Retenida' : 'Devuelta'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="p-4 border-t bg-card flex items-center justify-between gap-3 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">Cerrar</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const msg = `Necesito ayuda con: ${service.name} (${service.id})`;
              window.open(`https://wa.me/573001234567?text=${encodeURIComponent(msg)}`, '_blank');
            }}>
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Soporte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
