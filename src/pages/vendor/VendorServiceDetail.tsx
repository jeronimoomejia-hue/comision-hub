import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, RotateCcw, Clock, DollarSign, Plus, User, Mail, Phone, Tag,
  RefreshCw, Zap, Lock, Check, BookOpen, FileText, Download,
  Lightbulb, HelpCircle, AlertCircle, Target, Users, Package,
  Shield, MessageSquare, ChevronRight, ChevronDown, Star, Play, Info, ExternalLink, Crown
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate, CURRENT_VENDOR_ID, services as allServices } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";
import { extendedServiceDetails } from "@/data/extendedServiceData";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { categoryCovers } from "@/data/coverImages";

const refundReasons = [
  { value: "arrepentimiento", label: "Cliente se arrepintió" },
  { value: "insatisfecho", label: "No le gustó el producto" },
  { value: "error", label: "Error en compra" },
  { value: "otro", label: "Otro" }
];

type ServiceTab = 'info' | 'ventas';

export default function VendorServiceDetail() {
  const { serviceId, companyId } = useParams<{ serviceId: string; companyId?: string }>();
  const navigate = useNavigate();
  const {
    services, sales, commissions, companies, trainingProgress,
    currentVendorId, addRefundRequest, addSale, refundRequests, getVendorTier
  } = useDemo();

  const [activeTab, setActiveTab] = useState<ServiceTab>('info');
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleForm, setSaleForm] = useState({ clientName: "", clientEmail: "", clientPhone: "" });
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
          <p className="text-sm font-medium text-foreground">Producto no encontrado</p>
        </div>
      </VendorTabLayout>
    );
  }

  const coverImg = categoryCovers[service.category];
  const vendorTier = getVendorTier(vendorId, serviceId!);
  const effectiveCommissionPct = vendorTier?.commissionPct ?? service.vendorCommissionPct;
  const estimatedCommission = Math.round(service.priceCOP * effectiveCommissionPct / 100);
  const vendorTraining = trainingProgress.find(tp => tp.vendorId === vendorId && tp.serviceId === serviceId);
  const isTrainingComplete = vendorTraining?.status === 'declared_completed';
  const backPath = companyId ? `/vendor/company/${companyId}` : "/vendor";
  const isRecurring = service.type === 'suscripción';

  const serviceSales = sales.filter(s => s.serviceId === serviceId && s.vendorId === vendorId);
  const activeSales = serviceSales.filter(s => s.status !== 'REFUNDED');
  const totalCommissions = commissions
    .filter(c => { const s = sales.find(sl => sl.id === c.saleId); return s?.serviceId === serviceId && s?.vendorId === vendorId && c.status !== 'REFUNDED'; })
    .reduce((a, c) => a + c.amountCOP, 0);

  const availableCodes = service.activationCodes.filter(c => c.status === 'available').length;

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
    const sellerCommissionAmount = Math.round(grossAmount * effectiveCommissionPct / 100);
    const mensualistaFeeAmount = Math.round(grossAmount * service.mensualistaPct / 100);
    const providerNetAmount = grossAmount - sellerCommissionAmount - mensualistaFeeAmount;
    addSale({
      serviceId: service.id, vendorId, companyId: service.companyId,
      clientName: saleForm.clientName, clientEmail: saleForm.clientEmail, clientPhone: saleForm.clientPhone || undefined,
      grossAmount, sellerCommissionAmount, mensualistaFeeAmount, providerNetAmount,
      status: 'HELD', isSubscription: isRecurring, subscriptionActive: isRecurring,
      amountCOP: grossAmount, holdStartAt: new Date().toISOString(), holdEndAt: new Date(Date.now() + service.refundPolicy.refundWindowDays * 24 * 60 * 60 * 1000).toISOString(),
      paymentProvider: 'MercadoPago', mpPaymentId: `MP-${Date.now()}`
    });
    toast.success("Venta registrada", { description: `Comisión de ${formatCOP(sellerCommissionAmount)} en retención ${service.refundPolicy.refundWindowDays} días.` });
    setSaleForm({ clientName: "", clientEmail: "", clientPhone: "" });
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

  const tabs: { id: ServiceTab; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Información', icon: Info },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  ];

  return (
    <VendorTabLayout backTo={backPath} backLabel={company.name}>
      <div className="space-y-5">
        {/* Service Header */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex gap-0">
            <div className="relative w-24 sm:w-32 flex-shrink-0">
              <img src={coverImg} alt={service.category} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-4 min-w-0">
              <h1 className="text-lg font-semibold text-foreground leading-tight">{service.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{company.name}</p>
              <div className="flex items-center gap-2 mt-2">
                {isRecurring ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    <RefreshCw className="w-2.5 h-2.5" /> Mensual
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <Zap className="w-2.5 h-2.5" /> Pago único
                  </span>
                )}
                {isTrainingComplete ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px]"><Check className="w-2.5 h-2.5 mr-0.5" /> Activo</Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] text-muted-foreground"><Lock className="w-2.5 h-2.5 mr-0.5" /> Sin activar</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-bold text-primary">{formatCOP(estimatedCommission)}</span>
                <span className="text-[10px] text-muted-foreground line-through">{formatCOP(service.priceCOP)}</span>
                <span className="text-[10px] text-muted-foreground">{isRecurring ? '/mes' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mis ventas</p>
            <p className="text-lg font-semibold text-foreground">{activeSales.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ganado</p>
            <p className="text-lg font-semibold text-foreground">{formatCOP(totalCommissions)}</p>
          </div>
        </div>

        {/* Inactive service banner */}
        {!isTrainingComplete && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-foreground">Servicio desactivado</p>
            </div>
            <p className="text-xs text-muted-foreground">Completa la capacitación para activar este producto y empezar a vender</p>
            <Button
              className="w-full h-10 text-xs font-semibold rounded-xl"
              onClick={() => navigate(`/vendor/trainings/${serviceId}`)}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Capacitarse
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
          <InfoTab service={service} extended={extended} company={company} isTrainingComplete={isTrainingComplete} onRegisterSale={() => setSaleDialogOpen(true)} />
        )}

        {activeTab === 'ventas' && (
          <VentasTab 
            serviceSales={serviceSales} 
            commissions={commissions}
            isEligibleForRefund={isEligibleForRefund}
            getDaysRemaining={getDaysRemaining}
            refundRequests={refundRequests}
            onRefundClick={(sale) => { setSelectedSale(sale); setRefundReason(""); setRefundNotes(""); setRefundDialogOpen(true); }}
            onNewSale={() => setSaleDialogOpen(true)}
            isTrainingComplete={isTrainingComplete}
          />
        )}
      </div>

      {/* Sale Dialog */}
      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Registrar venta</DialogTitle>
            <DialogDescription className="text-xs">{service.name} — {formatCOP(service.priceCOP)}{isRecurring ? '/mes' : ''}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSale} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombre del cliente</Label>
              <div className="relative">
                <Input className="pl-9 h-9 text-sm" placeholder="Juan García" value={saleForm.clientName} onChange={(e) => setSaleForm({...saleForm, clientName: e.target.value})} required />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email del cliente</Label>
              <div className="relative">
                <Input className="pl-9 h-9 text-sm" type="email" placeholder="cliente@email.com" value={saleForm.clientEmail} onChange={(e) => setSaleForm({...saleForm, clientEmail: e.target.value})} required />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Teléfono <span className="text-muted-foreground">(opcional)</span></Label>
              <div className="relative">
                <Input className="pl-9 h-9 text-sm" placeholder="+57 300 123 4567" value={saleForm.clientPhone} onChange={(e) => setSaleForm({...saleForm, clientPhone: e.target.value})} />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Precio</span><span className="font-medium">{formatCOP(service.priceCOP)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%)</span><span className="font-medium text-primary">{formatCOP(estimatedCommission)}</span></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setSaleDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={saleLoading}>{saleLoading ? "Registrando..." : "Registrar venta"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Solicitar devolución</DialogTitle>
            <DialogDescription className="text-xs">{service.refundPolicy.autoRefund ? "Procesamiento automático." : "La empresa revisará tu solicitud."}</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-xl text-xs space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{selectedSale.clientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-medium">{formatCOP(selectedSale.amountCOP)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Días restantes</span><span className="font-medium">{getDaysRemaining(selectedSale)}d</span></div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Motivo</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                  <SelectContent>{refundReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notas <span className="text-muted-foreground">(opcional)</span></Label>
                <Textarea placeholder="Detalles adicionales..." value={refundNotes} onChange={(e) => setRefundNotes(e.target.value)} rows={2} className="text-sm" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRefundDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmitRefund} disabled={!refundReason || isSubmitting}>{isSubmitting ? "Enviando..." : "Solicitar devolución"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}

/* =========== Sub-components =========== */

type InfoSection = 'resumen' | 'incluye' | 'audiencia' | 'ventas_tips' | 'materiales' | 'cupones';

function InfoTab({ service, extended, company, isTrainingComplete, onRegisterSale }: { service: any; extended: any; company: any; isTrainingComplete: boolean; onRegisterSale: () => void }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<InfoSection>('resumen');

  const activeCoupons = [
    { code: 'NUEVO20', discount: '20%', expires: '2026-04-30', description: 'Descuento para nuevos clientes' },
    { code: 'PROMO10', discount: '10%', expires: '2026-05-15', description: 'Promoción de temporada' },
  ];

  const estimatedCommission = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
  const mensualistaFee = Math.round(service.priceCOP * service.mensualistaPct / 100);
  const providerNet = service.priceCOP - estimatedCommission - mensualistaFee;
  const isRecurring = service.type === 'suscripción';

  const sections: { id: InfoSection; label: string; icon: React.ElementType }[] = [
    { id: 'resumen', label: 'Resumen', icon: Info },
    { id: 'incluye', label: 'Incluye', icon: Package },
    { id: 'audiencia', label: 'Audiencia', icon: Users },
    { id: 'ventas_tips', label: 'Venta', icon: Lightbulb },
    { id: 'materiales', label: 'Materiales', icon: Download },
    { id: 'cupones', label: 'Cupones', icon: Tag },
  ];

  return (
    <div className="space-y-3">
      {/* Internal sub-menu */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium whitespace-nowrap rounded-lg transition-colors ${
              activeSection === sec.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <sec.icon className="w-3 h-3" />
            {sec.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="animate-in fade-in duration-200">
        {activeSection === 'resumen' && (
          <div className="space-y-3">
            {/* Review training link */}
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
                    <p className="text-xs font-medium text-foreground">Revisar entrenamiento</p>
                    <p className="text-[10px] text-muted-foreground">Vuelve a ver el material</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            )}

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-foreground leading-relaxed">{extended?.shortDescription || service.description}</p>
              {extended?.pitchThreeLines && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{extended.pitchThreeLines}</p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Desglose de la venta</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Precio del producto</span>
                  <span className="font-medium text-foreground">{formatCOP(service.priceCOP)}{isRecurring ? '/mes' : ''}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%)</span>
                  <span className="font-semibold text-primary">{formatCOP(estimatedCommission)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fee plataforma ({service.mensualistaPct}%)</span>
                  <span className="text-muted-foreground">{formatCOP(mensualistaFee)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Neto empresa</span>
                  <span className="text-muted-foreground">{formatCOP(providerNet)}</span>
                </div>
              </div>
              {isRecurring && (
                <p className="text-[10px] text-blue-600 bg-blue-500/5 px-2 py-1 rounded-lg">
                  Cobro recurrente mensual. Recibes comisión cada mes mientras el cliente mantenga su suscripción.
                </p>
              )}
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrenamiento</p>
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

            {extended?.websiteUrl && (
              <a href={extended.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors cursor-pointer">
                <div>
                  <p className="text-xs font-medium text-foreground">Conocer más</p>
                  <p className="text-[10px] text-muted-foreground">{extended.websiteUrl}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            )}
          </div>
        )}

        {activeSection === 'incluye' && (
          <div className="space-y-2">
            {(extended?.features || [
              'Acceso completo a la plataforma',
              'Soporte técnico',
              'Actualizaciones automáticas',
              'Panel de administración',
            ]).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card">
                <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground">{f}</p>
              </div>
            ))}
            {extended?.notIncluded && extended.notIncluded.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">No incluye</p>
                <div className="flex flex-wrap gap-1.5">
                  {extended.notIncluded.map((item: string, i: number) => (
                    <span key={i} className="text-[10px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'audiencia' && (
          <div className="space-y-2">
            {[
              { label: "Audiencia ideal", text: extended?.targetAudience || 'Empresas en Colombia.', icon: Users, color: 'text-blue-600' },
              { label: "Problema que resuelve", text: extended?.problemSolved || 'Procesos manuales.', icon: AlertCircle, color: 'text-destructive' },
              { label: "Resultado", text: extended?.promisedResult || 'Mayor productividad.', icon: Target, color: 'text-emerald-600' },
              { label: "Cliente ideal", text: extended?.idealClient || 'Empresas medianas y pequeñas.', icon: Star, color: 'text-amber-600' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
            {extended?.useCases && (
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Casos de uso</p>
                <ul className="space-y-1">
                  {extended.useCases.map((uc: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeSection === 'ventas_tips' && (
          <div className="space-y-3">
            {/* Pitch */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pitch en una frase</p>
              <p className="text-sm font-medium text-foreground mt-1 italic">"{extended?.pitchOneLine || `${service.name} automatiza tu negocio.`}"</p>
            </div>

            {extended?.pitchThreeLines && (
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Guión corto</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{extended.pitchThreeLines}</p>
              </div>
            )}

            {/* Objections */}
            {extended?.objections && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Objeciones comunes</p>
                {extended.objections.slice(0, 4).map((obj: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-border bg-card">
                    <p className="text-xs font-medium text-foreground">{obj.objection}</p>
                    <p className="text-xs text-muted-foreground mt-1">{obj.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'materiales' && (
          <div className="space-y-2">
            {service.materials.length > 0 ? (
              service.materials.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-foreground">{m.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] h-7 text-muted-foreground" onClick={() => toast.success(`Descargando: ${m.title}`)}>
                    <Download className="w-3 h-3 mr-1" /> Descargar
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 rounded-xl border border-border bg-card">
                <Download className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin materiales disponibles</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'cupones' && (
          <div className="space-y-2">
            {activeCoupons.length > 0 ? (
              activeCoupons.map((coupon, i) => (
                <div key={i} className="p-3 rounded-xl border border-primary/15 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="w-3.5 h-3.5 text-primary" />
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
                  {isTrainingComplete && (
                    <Button size="sm" variant="outline" className="w-full mt-2.5 h-8 text-[11px]" onClick={onRegisterSale}>
                      <ShoppingCart className="w-3 h-3 mr-1.5" /> Vender con este cupón
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 rounded-xl border border-border bg-card">
                <Tag className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin cupones activos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed register sale button */}
      {isTrainingComplete && (
        <div className="sticky bottom-0 pt-3 pb-1 bg-gradient-to-t from-background via-background to-transparent -mx-1 px-1">
          <Button className="w-full h-11 text-xs font-semibold rounded-xl" onClick={onRegisterSale}>
            <ShoppingCart className="w-4 h-4 mr-2" /> Registrar venta
          </Button>
        </div>
      )}
    </div>
  );
}

function VentasTab({ serviceSales, commissions, isEligibleForRefund, getDaysRemaining, refundRequests, onRefundClick, onNewSale, isTrainingComplete }: {
  serviceSales: Array<any>;
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

      <StatusGuide />

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
                clientPhone={sale.clientPhone}
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
                onSupport={() => toast.success("Soporte contactado", { description: `Ticket abierto para la venta ${sale.id.slice(-6)}` })}
                role="vendor"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin ventas aún</p>
          <p className="text-xs text-muted-foreground">Registra tu primera venta de este producto</p>
        </div>
      )}
    </div>
  );
}
