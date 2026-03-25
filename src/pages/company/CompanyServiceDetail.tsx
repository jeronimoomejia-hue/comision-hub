import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart, RotateCcw, Clock, DollarSign, Package, Key,
  RefreshCw, Zap, Lock, Check, FileText, Download, Edit3, Save, X,
  Lightbulb, HelpCircle, AlertCircle, Target, Users, Shield,
  MessageSquare, Play, Info, Upload, BarChart3, CheckCircle2, Calendar,
  ArrowLeft, Pause, Eye, TrendingUp, AlertTriangle, BookOpen, Tag,
  ChevronRight, Copy, UserCheck, Award, Star
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate, CURRENT_COMPANY_ID, companies, vendors, type Sale } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import { categoryCovers } from "@/data/coverImages";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

type ServiceTab = 'resumen' | 'ventas' | 'vendedores' | 'capacitacion' | 'cupones' | 'codigos' | 'config';

export default function CompanyServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const {
    services, sales, commissions, refundRequests, trainingProgress, subscriptions,
    updateService, addActivationCodes, updateRefundRequest, currentCompanyPlan
  } = useDemo();

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const service = services.find(s => s.id === serviceId);
  const extended = service ? extendedServiceDetails[service.id] : null;

  const [activeTab, setActiveTab] = useState<ServiceTab>('resumen');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [showAddCodes, setShowAddCodes] = useState(false);
  const [newCodes, setNewCodes] = useState("");

  if (!service) {
    return (
      <DashboardLayout role="company" userName={company?.name}>
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Servicio no encontrado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/company/services')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver a servicios
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const coverImg = categoryCovers[service.category];
  const serviceSales = sales.filter(s => s.serviceId === serviceId && s.companyId === CURRENT_COMPANY_ID);
  const codes = service.activationCodes;
  const codesAvailable = codes.filter(c => c.status === 'available').length;
  const codesDelivered = codes.filter(c => c.status === 'delivered').length;

  // Active subscriptions for recurring services
  const activeSubscriptions = service.type === 'suscripción'
    ? serviceSales.filter(s => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length
    : 0;

  // Vendors for this service
  const serviceVendorIds = new Set(serviceSales.map(s => s.vendorId));
  const serviceTrainingVendorIds = new Set(trainingProgress.filter(tp => tp.serviceId === serviceId).map(tp => tp.vendorId));
  const allVendorIds = new Set([...serviceVendorIds, ...serviceTrainingVendorIds]);

  const handleStartEdit = () => {
    setEditData({
      name: service.name, description: service.description,
      priceCOP: service.priceCOP, vendorCommissionPct: service.vendorCommissionPct,
      requiresTraining: service.requiresTraining, trainingType: service.trainingType,
      refundPolicy: { ...service.refundPolicy },
      status: service.status,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateService(service.id, editData);
    setIsEditing(false);
    toast.success("Cambios guardados");
  };

  const handleAddCodes = () => {
    const codeLines = newCodes.split('\n').map(c => c.trim()).filter(Boolean);
    if (codeLines.length === 0) { toast.error("Ingresa al menos un código"); return; }
    addActivationCodes(service.id, codeLines);
    toast.success(`${codeLines.length} códigos agregados`);
    setShowAddCodes(false);
    setNewCodes("");
  };

  const tabs: { id: ServiceTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'resumen', label: 'Resumen', icon: Info },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, badge: serviceSales.length },
    { id: 'vendedores', label: 'Vendedores', icon: Users, badge: allVendorIds.size },
    { id: 'capacitacion', label: 'Capacitación', icon: BookOpen },
    { id: 'cupones', label: 'Cupones', icon: Tag },
    { id: 'codigos', label: 'Códigos', icon: Key, badge: codesAvailable },
    { id: 'config', label: 'Config', icon: Shield },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        {/* Back */}
        <button onClick={() => navigate('/company/services')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Mis Servicios
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={coverImg} alt={service.category} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground leading-tight">{service.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{service.category}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[9px]">
                {service.type === 'suscripción' ? <><RefreshCw className="w-2.5 h-2.5 mr-0.5" /> Recurrente</> : <><Zap className="w-2.5 h-2.5 mr-0.5" /> Puntual</>}
              </Badge>
              <Badge className={`text-[9px] border-0 ${service.status === 'activo' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {service.status === 'activo' ? <><Check className="w-2.5 h-2.5 mr-0.5" /> Activo</> : <><Pause className="w-2.5 h-2.5 mr-0.5" /> Pausado</>}
              </Badge>
              {service.type === 'suscripción' && activeSubscriptions > 0 && (
                <Badge className="text-[9px] border-0 bg-blue-500/10 text-blue-600">
                  <RefreshCw className="w-2.5 h-2.5 mr-0.5" /> {activeSubscriptions} suscripciones activas
                </Badge>
              )}
            </div>
          </div>
          {!isEditing ? (
            <Button size="sm" variant="outline" className="h-8 text-xs flex-shrink-0" onClick={handleStartEdit}>
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Editar
            </Button>
          ) : (
            <div className="flex gap-1.5 flex-shrink-0">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setIsEditing(false); setEditData({}); }}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
                <Save className="w-3.5 h-3.5 mr-1" /> Guardar
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[9px] font-semibold">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'resumen' && (
          <ResumenTab service={service} extended={extended} sales={serviceSales} activeSubscriptions={activeSubscriptions} vendorCount={allVendorIds.size} isEditing={isEditing} editData={editData} setEditData={setEditData} />
        )}
        {activeTab === 'ventas' && (
          <VentasTab service={service} serviceSales={serviceSales} commissions={commissions} refundRequests={refundRequests} updateRefundRequest={updateRefundRequest} />
        )}
        {activeTab === 'vendedores' && (
          <VendedoresTab service={service} serviceSales={serviceSales} trainingProgress={trainingProgress} allVendorIds={allVendorIds} />
        )}
        {activeTab === 'capacitacion' && (
          <CapacitacionTab service={service} trainingProgress={trainingProgress} isEditing={isEditing} editData={editData} setEditData={setEditData} />
        )}
        {activeTab === 'cupones' && (
          <CuponesTab service={service} currentPlan={currentCompanyPlan} />
        )}
        {activeTab === 'codigos' && (
          <CodigosTab service={service} codesAvailable={codesAvailable} codesDelivered={codesDelivered} onAddCodes={() => setShowAddCodes(true)} currentPlan={currentCompanyPlan} />
        )}
        {activeTab === 'config' && (
          <ConfigTab service={service} isEditing={isEditing} editData={editData} setEditData={setEditData} />
        )}
      </div>

      {/* Add Codes Dialog */}
      <Dialog open={showAddCodes} onOpenChange={setShowAddCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Agregar códigos de activación</DialogTitle>
            <DialogDescription className="text-xs">{service.name} — {codesAvailable} disponibles</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs">Códigos (uno por línea)</Label>
            <Textarea className="text-sm font-mono" rows={8} placeholder={"CODIGO-001\nCODIGO-002\n..."} value={newCodes} onChange={e => setNewCodes(e.target.value)} />
            <p className="text-[10px] text-muted-foreground">{newCodes.split('\n').filter(c => c.trim()).length} códigos</p>
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs" onClick={handleAddCodes}>
              <Upload className="w-3.5 h-3.5 mr-1" /> Agregar códigos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

/* =========== RESUMEN TAB =========== */
function ResumenTab({ service, extended, sales, activeSubscriptions, vendorCount, isEditing, editData, setEditData }: any) {
  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);
    const salesThisMonth = sales.filter((s: any) => s.createdAt.startsWith(thisMonth));
    const salesLastMonth = sales.filter((s: any) => s.createdAt.startsWith(lastMonth));
    const gmv = salesThisMonth.reduce((a: number, s: any) => a + (s.amountCOP || s.grossAmount), 0);
    const held = sales.filter((s: any) => s.status === 'HELD').length;
    const released = sales.filter((s: any) => s.status === 'RELEASED').length;
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

  const kpis = [
    { icon: DollarSign, label: 'GMV este mes', value: formatCOP(metrics.gmv), accent: true },
    { icon: ShoppingCart, label: 'Ventas/mes', value: String(metrics.thisMonth) },
    ...(service.type === 'suscripción' ? [{ icon: RefreshCw, label: 'Suscripciones activas', value: String(activeSubscriptions) }] : []),
    { icon: Users, label: 'Vendedores', value: String(vendorCount) },
    { icon: CheckCircle2, label: 'Liberadas', value: String(metrics.released) },
    { icon: Calendar, label: 'En retención', value: String(metrics.held) },
  ];

  return (
    <div className="space-y-5">
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
              <p className="text-[10px] text-muted-foreground">{formatCOP(estimatedCommission)}/venta</p>
            </div>
            <div className="p-3 rounded-xl border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Neto empresa</p>
              <p className="text-xl font-bold mt-1">{formatCOP(companyNet)}</p>
              <p className="text-[10px] text-muted-foreground">Fee plat. {service.mensualistaPct}%</p>
            </div>
          </div>
        )}
      </section>

      {/* Description */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Descripción</h3>
        {isEditing ? (
          <Textarea className="text-sm" rows={3} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{extended?.shortDescription || service.description}</p>
        )}
      </section>

      {/* Problem / Result / Audience */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border bg-muted/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-destructive"><AlertCircle className="w-4 h-4" /><span className="text-[10px] font-semibold uppercase tracking-wider">Problema</span></div>
          <p className="text-xs text-muted-foreground leading-relaxed">{extended?.problemSolved || 'Procesos manuales lentos.'}</p>
        </div>
        <div className="p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-600"><Target className="w-4 h-4" /><span className="text-[10px] font-semibold uppercase tracking-wider">Resultado</span></div>
          <p className="text-xs text-muted-foreground leading-relaxed">{extended?.promisedResult || 'Ahorro de tiempo y productividad.'}</p>
        </div>
        <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-600"><Users className="w-4 h-4" /><span className="text-[10px] font-semibold uppercase tracking-wider">Audiencia</span></div>
          <p className="text-xs text-muted-foreground leading-relaxed">{extended?.targetAudience || 'Empresas en Colombia.'}</p>
        </div>
      </div>

      {/* Pitch */}
      <section className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> Cómo se vende</h3>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Pitch en una frase</p>
            <p className="text-sm font-medium italic">"{extended?.pitchOneLine || `${service.name} automatiza tu trabajo.`}"</p>
          </div>
          <div className="border-t border-primary/10 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Guión corto</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{extended?.pitchThreeLines || 'Guión de ventas del servicio.'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========== VENTAS TAB =========== */
function VentasTab({ service, serviceSales, commissions, refundRequests, updateRefundRequest }: any) {
  const [filter, setFilter] = useState('todos');
  const filters = ['todos', 'HELD', 'RELEASED', 'REFUNDED'];
  const filterLabels: Record<string, string> = { todos: 'Todos', HELD: 'Retenidas', RELEASED: 'Liberadas', REFUNDED: 'Devueltas' };
  const filtered = filter === 'todos' ? serviceSales : serviceSales.filter((s: any) => s.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {filterLabels[f]} ({f === 'todos' ? serviceSales.length : serviceSales.filter((s: any) => s.status === f).length})
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} venta{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((sale: any) => {
            const vendor = vendors.find(v => v.id === sale.vendorId);
            const existingRefund = refundRequests.find((r: any) => r.saleId === sale.id);
            return (
              <TransactionCard key={sale.id} id={sale.id}
                clientName={sale.clientName} clientEmail={sale.clientEmail}
                serviceName={service.name} serviceCategory={service.category}
                vendorName={vendor?.name || sale.vendorId}
                amount={sale.grossAmount} commission={sale.sellerCommissionAmount}
                platformFee={sale.mensualistaFeeAmount} netAmount={sale.providerNetAmount}
                status={sale.status} statusType="sale" date={sale.createdAt}
                holdEndDate={sale.holdEndAt} releasedDate={sale.releasedAt}
                activationCode={sale.activationCode} isSubscription={sale.isSubscription}
                paymentId={sale.mpPaymentId} refundStatus={existingRefund?.status}
                onSupport={() => toast.success("Soporte contactado")} role="company"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin ventas</p>
          <p className="text-xs text-muted-foreground">No hay ventas con este filtro</p>
        </div>
      )}

      {/* Pending refunds */}
      {refundRequests.filter((r: any) => r.serviceId === service.id && r.status === 'pendiente').length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" /> Devoluciones pendientes
          </h3>
          {refundRequests.filter((r: any) => r.serviceId === service.id && r.status === 'pendiente').map((refund: any) => {
            const sale = serviceSales.find((s: any) => s.id === refund.saleId);
            return (
              <div key={refund.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{sale?.clientName || 'Cliente'}</p>
                    <p className="text-[10px] text-muted-foreground">{refund.reason}</p>
                  </div>
                  <p className="text-xs font-semibold">{formatCOP(sale?.grossAmount || 0)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-[10px] flex-1" onClick={() => { updateRefundRequest(refund.id, { status: 'aprobado', decisionBy: 'empresa', decidedAt: new Date().toISOString().split('T')[0] }); toast.success("Devolución aprobada"); }}>
                    <Check className="w-3 h-3 mr-1" /> Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" onClick={() => { updateRefundRequest(refund.id, { status: 'rechazado', decisionBy: 'empresa', decidedAt: new Date().toISOString().split('T')[0] }); toast.success("Devolución rechazada"); }}>
                    <X className="w-3 h-3 mr-1" /> Rechazar
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

/* =========== VENDEDORES TAB =========== */
function VendedoresTab({ service, serviceSales, trainingProgress, allVendorIds }: any) {
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const vendorData = Array.from(allVendorIds as Set<string>).map(vendorId => {
    const vendor = vendors.find(v => v.id === vendorId);
    const vSales = serviceSales.filter((s: any) => s.vendorId === vendorId);
    const monthSales = vSales.filter((s: any) => new Date(s.createdAt) >= monthAgo);
    const training = trainingProgress.find((tp: any) => tp.vendorId === vendorId && tp.serviceId === service.id);
    const gmv = monthSales.reduce((sum: number, s: any) => sum + (s.amountCOP || s.grossAmount), 0);
    const activeSubs = vSales.filter((s: any) => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length;
    const trainingStatus = training?.status === 'declared_completed' ? 'completada'
      : training?.status === 'in_progress' ? 'en progreso' : 'pendiente';

    return {
      id: vendorId, name: vendor?.name || vendorId, email: vendor?.email || '',
      salesMonth: monthSales.length, totalSales: vSales.length, gmv, activeSubs, trainingStatus,
    };
  }).sort((a, b) => b.salesMonth - a.salesMonth);

  const statusColors: Record<string, string> = {
    completada: 'bg-emerald-500/10 text-emerald-600',
    'en progreso': 'bg-amber-500/10 text-amber-600',
    pendiente: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{vendorData.length} vendedor{vendorData.length !== 1 ? 'es' : ''} vinculados a este servicio</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{vendorData.filter(v => v.trainingStatus === 'completada').length}</p>
          <p className="text-[10px] text-muted-foreground">Capacitados</p>
        </div>
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{vendorData.filter(v => v.salesMonth > 0).length}</p>
          <p className="text-[10px] text-muted-foreground">Con ventas/mes</p>
        </div>
        <div className="p-3 rounded-xl border text-center bg-primary/5 border-primary/20">
          <p className="text-2xl font-bold text-primary">{formatCOP(vendorData.reduce((s, v) => s + v.gmv, 0))}</p>
          <p className="text-[10px] text-muted-foreground">GMV total/mes</p>
        </div>
      </div>

      {vendorData.length > 0 ? (
        <div className="space-y-2">
          {vendorData.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  i === 0 && v.salesMonth > 0 ? 'bg-amber-500/10' : 'bg-primary/10'
                }`}>
                  {i === 0 && v.salesMonth > 0 ? (
                    <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{v.name.split(' ').map((n: string) => n[0]).join('')}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">{v.email}</p>
                </div>
                <Badge className={`text-[9px] border-0 ${statusColors[v.trainingStatus]}`}>
                  {v.trainingStatus === 'completada' ? <><UserCheck className="w-2.5 h-2.5 mr-0.5" /> Capacitado</> :
                   v.trainingStatus === 'en progreso' ? <><BookOpen className="w-2.5 h-2.5 mr-0.5" /> En progreso</> :
                   <><Clock className="w-2.5 h-2.5 mr-0.5" /> Pendiente</>}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-sm font-bold">{v.salesMonth}</p>
                  <p className="text-[9px] text-muted-foreground">Ventas/mes</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{v.totalSales}</p>
                  <p className="text-[9px] text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">{formatCOP(v.gmv)}</p>
                  <p className="text-[9px] text-muted-foreground">GMV/mes</p>
                </div>
                {service.type === 'suscripción' && (
                  <div className="text-center">
                    <p className="text-sm font-bold">{v.activeSubs}</p>
                    <p className="text-[9px] text-muted-foreground">Suscripciones</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin vendedores</p>
          <p className="text-xs text-muted-foreground">Ningún vendedor ha interactuado con este servicio</p>
        </div>
      )}
    </div>
  );
}

/* =========== CAPACITACION TAB =========== */
function CapacitacionTab({ service, trainingProgress, isEditing, editData, setEditData }: any) {
  const serviceTrainings = trainingProgress.filter((tp: any) => tp.serviceId === service.id);
  const completed = serviceTrainings.filter((tp: any) => tp.status === 'declared_completed').length;
  const inProgress = serviceTrainings.filter((tp: any) => tp.status === 'in_progress').length;
  const total = serviceTrainings.length;

  return (
    <div className="space-y-5">
      {/* Training config */}
      <section className="p-4 rounded-xl border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Configuración de capacitación
        </h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={editData.requiresTraining ?? service.requiresTraining} onCheckedChange={v => setEditData({ ...editData, requiresTraining: v })} />
              <Label className="text-xs">Requiere capacitación para vender</Label>
            </div>
            {(editData.requiresTraining ?? service.requiresTraining) && (
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Select value={editData.trainingType || service.trainingType || 'pdf'} onValueChange={v => setEditData({ ...editData, trainingType: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF / Documento</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {service.trainingType === 'video' ? <Play className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
              <div>
                <p className="text-sm font-medium">{service.requiresTraining ? `Capacitación en ${service.trainingType?.toUpperCase() || 'PDF'}` : 'Sin capacitación requerida'}</p>
                <p className="text-xs text-muted-foreground">Los vendedores deben completarla antes de vender</p>
              </div>
            </div>
            {service.requiresTraining && <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">Activa</Badge>}
          </div>
        )}
      </section>

      {/* Progress overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border text-center bg-emerald-500/5 border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-[10px] text-muted-foreground">Completaron</p>
        </div>
        <div className="p-3 rounded-xl border text-center bg-amber-500/5 border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{inProgress}</p>
          <p className="text-[10px] text-muted-foreground">En progreso</p>
        </div>
        <div className="p-3 rounded-xl border text-center">
          <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground">Participaron</p>
        </div>
      </div>

      {/* Vendor progress list */}
      {total > 0 ? (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold">Progreso por vendedor</h3>
          {serviceTrainings.map((tp: any) => {
            const vendor = vendors.find(v => v.id === tp.vendorId);
            const statusConfig: Record<string, { label: string; cls: string }> = {
              declared_completed: { label: 'Completada', cls: 'bg-emerald-500/10 text-emerald-600' },
              in_progress: { label: 'En progreso', cls: 'bg-amber-500/10 text-amber-600' },
              not_started: { label: 'No iniciada', cls: 'bg-muted text-muted-foreground' },
            };
            const sc = statusConfig[tp.status] || statusConfig.not_started;
            return (
              <div key={tp.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{(vendor?.name || '?')[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{vendor?.name || tp.vendorId}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tp.completedAt ? `Completó ${formatDate(tp.completedAt)}` : tp.lastAccessedAt ? `Último acceso ${formatDate(tp.lastAccessedAt)}` : 'Sin acceso'}
                    </p>
                  </div>
                </div>
                <Badge className={`text-[9px] border-0 ${sc.cls}`}>{sc.label}</Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin actividad</p>
          <p className="text-xs text-muted-foreground">Ningún vendedor ha iniciado la capacitación</p>
        </div>
      )}

      {/* Materials */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Download className="w-4 h-4" /> Materiales de venta</h3>
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
    </div>
  );
}

/* =========== CUPONES TAB =========== */
function CuponesTab({ service, currentPlan }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'NUEVO20', discount: 20, type: 'porcentaje' as const, expires: '2026-04-30', uses: 12, maxUses: 50, active: true },
    { id: '2', code: 'PROMO10', discount: 10, type: 'porcentaje' as const, expires: '2026-05-15', uses: 5, maxUses: 100, active: true },
    { id: '3', code: 'LAUNCH50K', discount: 50000, type: 'fijo' as const, expires: '2026-03-31', uses: 3, maxUses: 10, active: false },
  ]);

  if (currentPlan === 'freemium') {
    return (
      <div className="text-center py-12 rounded-xl border border-border bg-card">
        <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Cupones no disponibles</p>
        <p className="text-xs text-muted-foreground">Mejora a Premium o Enterprise para crear cupones por servicio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{coupons.filter(c => c.active).length} cupones activos para este servicio</p>
        <Button size="sm" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
          <Tag className="w-3.5 h-3.5 mr-1" /> Crear cupón
        </Button>
      </div>

      {coupons.length > 0 ? (
        <div className="space-y-2">
          {coupons.map(coupon => (
            <div key={coupon.id} className={`p-4 rounded-xl border ${coupon.active ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-primary bg-card px-2.5 py-1 rounded-lg border border-border">{coupon.code}</code>
                  <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Código copiado"); }}>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
                <Badge className={`text-[9px] border-0 ${coupon.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                  {coupon.active ? 'Activo' : 'Expirado'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-sm font-bold">{coupon.type === 'porcentaje' ? `${coupon.discount}%` : formatCOP(coupon.discount)}</p>
                  <p className="text-[9px] text-muted-foreground">Descuento</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{coupon.uses}/{coupon.maxUses}</p>
                  <p className="text-[9px] text-muted-foreground">Usos</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{new Date(coupon.expires).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-[9px] text-muted-foreground">Vence</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin cupones</p>
          <p className="text-xs text-muted-foreground">Crea tu primer cupón para este servicio</p>
        </div>
      )}
    </div>
  );
}

/* =========== CODIGOS TAB =========== */
function CodigosTab({ service, codesAvailable, codesDelivered, onAddCodes, currentPlan }: any) {
  const codes = service.activationCodes;
  const codesPct = codes.length > 0 ? (codesAvailable / codes.length) * 100 : 0;

  return (
    <div className="space-y-5">
      {currentPlan === 'enterprise' && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Enterprise:</span> Los códigos se sincronizan automáticamente vía API.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{codes.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="p-3 rounded-xl border text-center bg-primary/5 border-primary/20">
          <p className="text-2xl font-bold text-primary">{codesAvailable}</p>
          <p className="text-[10px] text-muted-foreground">Disponibles</p>
        </div>
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{codesDelivered}</p>
          <p className="text-[10px] text-muted-foreground">Entregados</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Stock disponible</span>
          <span className={codesAvailable < 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{codesAvailable} códigos</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${codesAvailable === 0 ? 'bg-destructive' : codesAvailable < 5 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${codesPct}%` }} />
        </div>
      </div>

      {codesAvailable < 5 && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${codesAvailable === 0 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'}`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {codesAvailable === 0 ? 'Sin códigos. Las ventas no se completarán.' : `Quedan solo ${codesAvailable} códigos.`}
        </div>
      )}

      <Button size="sm" className="w-full" onClick={onAddCodes}>
        <Upload className="w-3.5 h-3.5 mr-1.5" /> Agregar códigos
      </Button>

      {codesDelivered > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Últimos entregados</h3>
          <div className="space-y-1">
            {codes.filter((c: any) => c.status === 'delivered').slice(0, 10).map((code: any) => (
              <div key={code.id} className="flex items-center justify-between p-2 rounded-lg border text-xs">
                <code className="font-mono text-muted-foreground">{code.code}</code>
                <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-0">Entregado</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* =========== CONFIG TAB =========== */
function ConfigTab({ service, isEditing, editData, setEditData }: any) {
  return (
    <div className="space-y-5">
      {!isEditing && (
        <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">Usa el botón <span className="font-medium text-foreground">Editar</span> en la parte superior para modificar.</p>
        </div>
      )}

      {/* Status */}
      <section className="p-4 rounded-xl border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4" /> Estado del servicio</h3>
        {isEditing ? (
          <div className="flex items-center gap-3">
            <Switch checked={(editData.status || service.status) === 'activo'} onCheckedChange={v => setEditData({ ...editData, status: v ? 'activo' : 'pausado' })} />
            <Label className="text-xs">{(editData.status || service.status) === 'activo' ? 'Activo — visible para vendedores' : 'Pausado — oculto'}</Label>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${service.status === 'activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <p className="text-sm">{service.status === 'activo' ? 'Activo — visible para vendedores' : 'Pausado — oculto para vendedores'}</p>
          </div>
        )}
      </section>

      {/* Refund */}
      <section className="p-4 rounded-xl border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Política de devoluciones</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Ventana de devolución</Label>
                <Select value={String(editData.refundPolicy?.refundWindowDays || service.refundPolicy.refundWindowDays)}
                  onValueChange={v => setEditData({ ...editData, refundPolicy: { ...(editData.refundPolicy || service.refundPolicy), refundWindowDays: Number(v) as 7 | 14 | 30 } })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 días</SelectItem>
                    <SelectItem value="14">14 días</SelectItem>
                    <SelectItem value="30">30 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Switch checked={editData.refundPolicy?.autoRefund ?? service.refundPolicy.autoRefund}
                  onCheckedChange={v => setEditData({ ...editData, refundPolicy: { ...(editData.refundPolicy || service.refundPolicy), autoRefund: v } })} />
                <Label className="text-xs">Automática</Label>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">La ventana de devolución también define los días de retención de comisiones.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border bg-muted/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ventana</p>
              <p className="text-base font-semibold mt-0.5">{service.refundPolicy.refundWindowDays} días</p>
              <p className="text-[10px] text-muted-foreground">retención de comisiones</p>
            </div>
            <div className="p-3 rounded-xl border bg-muted/30">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Tipo</p>
              <p className="text-base font-semibold mt-0.5">{service.refundPolicy.autoRefund ? 'Automática' : 'Manual'}</p>
              <p className="text-[10px] text-muted-foreground">{service.refundPolicy.autoRefund ? 'Sin revisión' : 'Requiere aprobación'}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
