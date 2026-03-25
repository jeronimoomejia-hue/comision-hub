import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, RotateCcw, Clock, DollarSign, Plus, User, Mail,
  RefreshCw, Zap, Lock, Check, BookOpen, FileText, Download,
  Lightbulb, HelpCircle, AlertCircle, Target, Users, Package,
  Shield, MessageSquare, ChevronRight, Star, Play, Info, ExternalLink
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate, CURRENT_VENDOR_ID, services as allServices } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

const refundReasons = [
  { value: "arrepentimiento", label: "Cliente se arrepintió" },
  { value: "insatisfecho", label: "No le gustó el servicio" },
  { value: "error", label: "Error en compra" },
  { value: "otro", label: "Otro" }
];

type ServiceTab = 'info' | 'ventas' | 'devoluciones';

export default function VendorServiceDetail() {
  const { serviceId, companyId } = useParams<{ serviceId: string; companyId?: string }>();
  const navigate = useNavigate();
  const {
    services, sales, commissions, companies, trainingProgress,
    currentVendorId, addRefundRequest, addSale, refundRequests
  } = useDemo();

  const [activeTab, setActiveTab] = useState<ServiceTab>('info');
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleForm, setSaleForm] = useState({ clientName: "", clientEmail: "" });
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<typeof sales[0] | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const service = services.find(s => s.id === serviceId);
  const company = service ? companies.find(c => c.id === service.companyId) : null;
  const extended = service ? extendedServiceDetails[service.id] : null;

  if (!service || !company) {
    return (
      <VendorTabLayout backTo={companyId ? `/vendor/company/${companyId}` : "/vendor"} backLabel="Volver">
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Servicio no encontrado</p>
        </div>
      </VendorTabLayout>
    );
  }

  const coverImg = categoryCovers[service.category];
  const estimatedCommission = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
  const vendorTraining = trainingProgress.find(tp => tp.vendorId === vendorId && tp.serviceId === serviceId);
  const isTrainingComplete = vendorTraining?.status === 'declared_completed';
  const backPath = companyId ? `/vendor/company/${companyId}` : "/vendor";

  // Sales data
  const serviceSales = sales.filter(s => s.serviceId === serviceId && s.vendorId === vendorId);
  const activeSales = serviceSales.filter(s => s.status !== 'REFUNDED');
  const refundedSales = serviceSales.filter(s => s.status === 'REFUNDED');
  const totalCommissions = commissions
    .filter(c => { const s = sales.find(sl => sl.id === c.saleId); return s?.serviceId === serviceId && s?.vendorId === vendorId && c.status !== 'REFUNDED'; })
    .reduce((a, c) => a + c.amountCOP, 0);

  const availableCodes = service.activationCodes.filter(c => c.status === 'available').length;

  // Refund helpers
  const isEligibleForRefund = (sale: typeof sales[0]) => {
    if (sale.status === 'REFUNDED') return false;
    if (refundRequests.find(r => r.saleId === sale.id)) return false;
    const days = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days <= service.refundPolicy.refundWindowDays;
  };
  const getDaysRemaining = (sale: typeof sales[0]) => {
    const days = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, service.refundPolicy.refundWindowDays - days);
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availableCodes === 0) { toast.error("No hay códigos disponibles."); return; }
    setSaleLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const grossAmount = service.priceCOP;
    const sellerCommissionAmount = Math.round(grossAmount * service.vendorCommissionPct / 100);
    const mensualistaFeeAmount = Math.round(grossAmount * service.mensualistaPct / 100);
    const providerNetAmount = grossAmount - sellerCommissionAmount - mensualistaFeeAmount;
    addSale({
      serviceId: service.id, vendorId, companyId: service.companyId,
      clientName: saleForm.clientName, clientEmail: saleForm.clientEmail,
      grossAmount, sellerCommissionAmount, mensualistaFeeAmount, providerNetAmount,
      status: 'HELD', isSubscription: service.type === 'suscripción', subscriptionActive: service.type === 'suscripción',
      amountCOP: grossAmount, holdStartAt: new Date().toISOString(), holdEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentProvider: 'MercadoPago', mpPaymentId: `MP-${Date.now()}`
    });
    toast.success("¡Venta registrada!", { description: `Comisión de ${formatCOP(sellerCommissionAmount)} en retención 7 días.` });
    setSaleForm({ clientName: "", clientEmail: "" });
    setSaleLoading(false);
    setSaleDialogOpen(false);
  };

  const handleSubmitRefund = async () => {
    if (!selectedSale || !refundReason) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const reasonLabel = refundReasons.find(r => r.value === refundReason)?.label || refundReason;
    const fullReason = refundNotes ? `${reasonLabel}: ${refundNotes}` : reasonLabel;
    addRefundRequest({
      saleId: selectedSale.id, vendorId, companyId: service.companyId,
      serviceId: service.id, reason: fullReason,
      status: service.refundPolicy.autoRefund ? 'automático' : 'pendiente',
      decisionBy: service.refundPolicy.autoRefund ? 'sistema' : undefined,
      decidedAt: service.refundPolicy.autoRefund ? new Date().toISOString().split('T')[0] : undefined
    });
    toast.success(service.refundPolicy.autoRefund ? "Devolución automática aplicada" : "Solicitud enviada a la empresa");
    setIsSubmitting(false);
    setRefundDialogOpen(false);
    setSelectedSale(null);
  };

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "bg-amber-50 text-amber-600", label: "Retenida" },
      'RELEASED': { cls: "bg-emerald-50 text-emerald-600", label: "Liberada" },
      'REFUNDED': { cls: "bg-red-50 text-red-600", label: "Devuelta" },
    };
    return map[status] || { cls: "bg-muted text-muted-foreground", label: status };
  };

  const tabs: { id: ServiceTab; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Información', icon: Info },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'devoluciones', label: 'Devoluciones', icon: RotateCcw },
  ];

  return (
    <VendorTabLayout backTo={backPath} backLabel={company.name}>
      <div className="space-y-5">
        {/* Service Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={coverImg} alt={service.category} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground leading-tight">{service.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{company.name} · {service.category}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[9px]">
                {service.type === 'suscripción' ? <><RefreshCw className="w-2.5 h-2.5 mr-0.5" /> Recurrente</> : <><Zap className="w-2.5 h-2.5 mr-0.5" /> Puntual</>}
              </Badge>
              {isTrainingComplete ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px]"><Check className="w-2.5 h-2.5 mr-0.5" /> Activo</Badge>
              ) : (
                <Badge variant="outline" className="text-[9px] text-muted-foreground"><Lock className="w-2.5 h-2.5 mr-0.5" /> Sin activar</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Comisión</p>
            <p className="text-lg font-semibold text-primary">{formatCOP(estimatedCommission)}</p>
            <p className="text-[9px] text-muted-foreground">{service.vendorCommissionPct}% por venta</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mis ventas</p>
            <p className="text-lg font-semibold text-foreground">{activeSales.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ganado</p>
            <p className="text-lg font-semibold text-foreground">{formatCOP(totalCommissions)}</p>
          </div>
        </div>

        {/* Action buttons */}
        {!isTrainingComplete && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 border-amber-400 text-amber-700" onClick={() => navigate(`/vendor/trainings/${serviceId}`)}>
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Capacitarme primero
            </Button>
          </div>
        )}

        {/* Internal Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <InfoTab service={service} extended={extended} company={company} isTrainingComplete={isTrainingComplete} />
        )}

        {activeTab === 'ventas' && (
          <VentasTab 
            serviceSales={serviceSales} 
            getStatusConfig={getStatusConfig} 
            commissions={commissions}
            isEligibleForRefund={isEligibleForRefund}
            getDaysRemaining={getDaysRemaining}
            refundRequests={refundRequests}
            onRefundClick={(sale) => { setSelectedSale(sale); setRefundReason(""); setRefundNotes(""); setRefundDialogOpen(true); }}
            onNewSale={() => setSaleDialogOpen(true)}
            isTrainingComplete={isTrainingComplete}
          />
        )}

        {activeTab === 'devoluciones' && (
          <DevolucionesTab serviceSales={serviceSales} refundRequests={refundRequests} />
        )}
      </div>

      {/* Sale Dialog */}
      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar venta</DialogTitle>
            <DialogDescription>{service.name} — {formatCOP(service.priceCOP)}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSale} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del cliente</Label>
              <div className="relative">
                <Input className="pl-10" placeholder="Juan García" value={saleForm.clientName} onChange={(e) => setSaleForm({...saleForm, clientName: e.target.value})} required />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email del cliente</Label>
              <div className="relative">
                <Input className="pl-10" type="email" placeholder="cliente@email.com" value={saleForm.clientEmail} onChange={(e) => setSaleForm({...saleForm, clientEmail: e.target.value})} required />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Precio:</span><span className="font-medium">{formatCOP(service.priceCOP)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%):</span><span className="font-medium text-primary">{formatCOP(estimatedCommission)}</span></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaleDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saleLoading}>{saleLoading ? "Registrando..." : "Registrar venta"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar devolución</DialogTitle>
            <DialogDescription>{service.refundPolicy.autoRefund ? "Procesamiento automático." : "La empresa revisará tu solicitud."}</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente:</span><span className="font-medium">{selectedSale.clientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Monto:</span><span className="font-medium">{formatCOP(selectedSale.amountCOP)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Días restantes:</span><span className="font-medium">{getDaysRemaining(selectedSale)}d</span></div>
              </div>
              <div className="space-y-2">
                <Label>Motivo *</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                  <SelectContent>{refundReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea placeholder="Detalles adicionales..." value={refundNotes} onChange={(e) => setRefundNotes(e.target.value)} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSubmitRefund} disabled={!refundReason || isSubmitting}>{isSubmitting ? "Enviando..." : "Solicitar devolución"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}

/* =========== Sub-components =========== */

function InfoTab({ service, extended, company, isTrainingComplete }: { service: any; extended: any; company: any; isTrainingComplete: boolean }) {
  const navigate = useNavigate();
  const coverImg = categoryCovers[service.category];

  // Mock coupons for demo
  const activeCoupons = [
    { code: 'NUEVO20', discount: '20%', expires: '2026-04-30', description: 'Descuento para nuevos clientes' },
    { code: 'PROMO10', discount: '10%', expires: '2026-05-15', description: 'Promoción de temporada' },
  ];
  
  return (
    <div className="space-y-5">
      {/* Hero image */}
      {coverImg && (
        <div className="rounded-xl overflow-hidden aspect-[2.4/1]">
          <img src={coverImg} alt={service.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Review training (when active) */}
      {isTrainingComplete && (
        <button
          onClick={() => navigate(`/vendor/trainings/${service.id}`)}
          className="flex items-center justify-between w-full p-3 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">Revisar capacitación</p>
              <p className="text-[10px] text-muted-foreground">Vuelve a ver el material de venta</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )}

      {/* Description */}
      <div>
        <p className="text-sm text-foreground leading-relaxed">{extended?.shortDescription || service.description}</p>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{extended?.pitchThreeLines}</p>
      </div>

      {/* Visit service page */}
      {extended?.websiteUrl && (
        <a
          href={extended.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors cursor-pointer"
        >
          <div>
            <p className="text-xs font-medium text-foreground">Conocer más sobre este servicio</p>
            <p className="text-[10px] text-muted-foreground">{extended.websiteUrl}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>
      )}

      {/* Info cards grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Comisión</p>
          <p className="text-base font-semibold text-primary mt-0.5">{formatCOP(Math.round(service.priceCOP * service.vendorCommissionPct / 100))}</p>
          <p className="text-[10px] text-muted-foreground">{service.vendorCommissionPct}% por venta</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Precio</p>
          <p className="text-base font-semibold text-foreground mt-0.5">{formatCOP(service.priceCOP)}</p>
          <p className="text-[10px] text-muted-foreground">{service.type === 'suscripción' ? 'mensual' : 'pago único'}</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacitación</p>
          <p className="text-xs font-medium text-foreground mt-0.5">{service.trainingType === 'video' ? 'Video' : 'PDF'}</p>
          <p className={`text-[10px] font-medium mt-0.5 ${isTrainingComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isTrainingComplete ? 'Completada' : 'Pendiente'} · ~{extended?.trainingDurationMinutes || 15} min
          </p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Devoluciones</p>
          <p className="text-xs font-medium text-foreground mt-0.5">{service.refundPolicy.refundWindowDays} días</p>
          <p className="text-[10px] text-muted-foreground">{service.refundPolicy.autoRefund ? 'Automática' : 'Con aprobación'}</p>
        </div>
      </div>

      {/* Features */}
      {extended?.features && (
        <div className="p-3 rounded-xl border border-border bg-card space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Qué incluye</p>
          <div className="grid grid-cols-1 gap-1.5">
            {extended.features.slice(0, 6).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground">{f}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience & Problem/Result */}
      <div className="space-y-2">
        {[
          { label: "Audiencia ideal", text: extended?.targetAudience || 'Empresas en Colombia.' },
          { label: "Problema que resuelve", text: extended?.problemSolved || 'Procesos manuales.' },
          { label: "Resultado", text: extended?.promisedResult || 'Mayor productividad.' },
        ].map((item, i) => (
          <div key={i} className="p-3 rounded-xl border border-border bg-card">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
            <p className="text-xs text-foreground mt-0.5 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Pitch */}
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Cómo venderlo</p>
        <p className="text-sm font-medium text-foreground mt-1 italic">"{extended?.pitchOneLine || `${service.name} automatiza tu negocio.`}"</p>
      </div>

      {/* Objections */}
      {extended?.objections && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Objeciones comunes</p>
          {extended.objections.slice(0, 3).map((obj: any, i: number) => (
            <div key={i} className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xs font-medium text-foreground">{obj.objection}</p>
              <p className="text-xs text-muted-foreground mt-1">{obj.response}</p>
            </div>
          ))}
        </div>
      )}

      {/* Materials */}
      {service.materials.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Materiales</p>
          {service.materials.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
              <span className="text-xs text-foreground">{m.title}</span>
              <Button variant="ghost" size="sm" className="text-[10px] h-7 text-muted-foreground" onClick={() => toast.success(`Descargando: ${m.title}`)}>
                Descargar
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Active Coupons */}
      {activeCoupons.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ofertas activas</p>
          {activeCoupons.map((coupon, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-primary/15 bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{coupon.description}</p>
                  <p className="text-[10px] text-muted-foreground">Vence {new Date(coupon.expires).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <div className="text-right">
                <code className="text-xs font-mono font-semibold text-primary bg-card px-2 py-0.5 rounded border border-border">{coupon.code}</code>
                <p className="text-[10px] font-medium text-primary mt-0.5">{coupon.discount} OFF</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact */}
      {extended?.contactEmail && (
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Contacto del servicio</p>
          <p className="text-xs text-foreground mt-1">{extended.contactName}</p>
          <p className="text-[10px] text-muted-foreground">{extended.contactEmail}</p>
        </div>
      )}
    </div>
  );
}

function VentasTab({ serviceSales, getStatusConfig, commissions, isEligibleForRefund, getDaysRemaining, refundRequests, onRefundClick, onNewSale, isTrainingComplete }: {
  serviceSales: Array<any>;
  getStatusConfig: (status: string) => { cls: string; label: string };
  commissions: Array<any>;
  isEligibleForRefund: (sale: any) => boolean;
  getDaysRemaining: (sale: any) => number;
  refundRequests: Array<any>;
  onRefundClick: (sale: any) => void;
  onNewSale: () => void;
  isTrainingComplete: boolean;
}) {
  const activeSales = serviceSales.filter((s: any) => s.status !== 'REFUNDED');

  return (
    <div className="space-y-3">
      {isTrainingComplete && (
        <Button size="sm" className="w-full" onClick={onNewSale}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Registrar nueva venta
        </Button>
      )}

      <p className="text-xs text-muted-foreground">{activeSales.length} venta{activeSales.length !== 1 ? 's' : ''} activa{activeSales.length !== 1 ? 's' : ''}</p>

      {serviceSales.length > 0 ? (
        <div className="space-y-2">
          {serviceSales.map((sale: any) => {
            const eligible = isEligibleForRefund(sale);
            const existingRefund = refundRequests.find((r: any) => r.saleId === sale.id);
            const service = allServices.find((s: any) => s.id === sale.serviceId);

            return (
              <TransactionCard
                key={sale.id}
                id={sale.id}
                clientName={sale.clientName}
                clientEmail={sale.clientEmail}
                serviceName={service?.name}
                serviceCategory={service?.category}
                amount={sale.grossAmount}
                commission={sale.sellerCommissionAmount}
                platformFee={sale.mensualistaFeeAmount}
                netAmount={sale.providerNetAmount}
                status={sale.status}
                statusType="sale"
                date={sale.createdAt}
                holdEndDate={sale.holdEndAt}
                releasedDate={sale.releasedAt}
                activationCode={sale.activationCode}
                isSubscription={sale.isSubscription}
                paymentId={sale.mpPaymentId}
                refundDaysLeft={eligible ? getDaysRemaining(sale) : undefined}
                refundStatus={existingRefund?.status}
                onRefund={eligible && !existingRefund ? () => onRefundClick(sale) : undefined}
                role="vendor"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin ventas aún</p>
          <p className="text-xs text-muted-foreground">Registra tu primera venta de este servicio</p>
        </div>
      )}
    </div>
  );
}

function DevolucionesTab({ serviceSales, refundRequests }: { serviceSales: Array<any>; refundRequests: Array<any> }) {
  const serviceRefunds = refundRequests.filter((r: any) => serviceSales.some((s: any) => s.id === r.saleId));

  return (
    <div className="space-y-3">
      {serviceRefunds.length > 0 ? (
        <div className="space-y-2">
          {serviceRefunds.map((refund: any) => {
            const sale = serviceSales.find((s: any) => s.id === refund.saleId);
            const service = sale ? allServices.find((s: any) => s.id === sale.serviceId) : null;

            return (
              <TransactionCard
                key={refund.id}
                id={refund.id}
                clientName={sale?.clientName || 'Cliente'}
                clientEmail={sale?.clientEmail}
                serviceName={service?.name}
                serviceCategory={service?.category}
                amount={sale?.grossAmount || 0}
                commission={sale?.sellerCommissionAmount}
                status={refund.status}
                statusType="refund"
                date={refund.createdAt}
                refundReason={refund.reason}
                refundDecision={refund.decisionBy === 'sistema' ? 'Sistema (Auto)' : refund.decisionBy === 'empresa' ? 'Empresa' : undefined}
                role="vendor"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <RotateCcw className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin devoluciones</p>
          <p className="text-xs text-muted-foreground">No hay solicitudes de devolución para este servicio</p>
        </div>
      )}
    </div>
  );
}
