import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";
import { 
  DollarSign, CheckCircle2, Clock, Search,
  ShieldAlert, CreditCard, Send, XCircle, RotateCcw, Package,
  ArrowLeft, Banknote, MessageCircle, ChevronDown, ChevronRight,
  FileText, Building2, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, CURRENT_VENDOR_ID, formatCOP, formatDate, services as allServices, companies, subscriptions } from "@/data/mockData";
import type { Sale, VendorPayment } from "@/data/mockData";
import { toast } from "sonner";
import { Repeat } from "lucide-react";
import { categoryCovers } from "@/data/coverImages";
import { cn } from "@/lib/utils";

type ViewMode = 'sales' | 'payments';

const STATUS_TABS = [
  { key: 'all' as const,       label: 'Todas',           icon: Package },
  { key: 'PENDING' as const,   label: 'Pendientes',      icon: Send },
  { key: 'HELD' as const,      label: 'Tiempo de devolución',    icon: Clock },
  { key: 'COMPLETED' as const, label: 'Completadas',     icon: CheckCircle2 },
  { key: 'REFUNDED' as const,  label: 'Devueltas',       icon: RotateCcw },
  { key: 'CANCELLED' as const, label: 'Canceladas',      icon: XCircle },
];

export default function VendorPayments() {
  const { sales, commissions, refundRequests, addRefundRequest, currentVendorId, vendorPayments } = useDemo();
  
  const [viewMode, setViewMode] = useState<ViewMode>('sales');
  const [refundSale, setRefundSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'PENDING' | 'HELD' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'>("all");
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const mySales = useMemo(() => 
    sales.filter(s => s.vendorId === currentVendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales, currentVendorId]
  );

  const myPayments = useMemo(() =>
    vendorPayments.filter(p => p.vendorId === currentVendorId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [vendorPayments, currentVendorId]
  );

  // KPIs
  const pendingSales = mySales.filter(s => s.status === 'PENDING');
  const heldSales = mySales.filter(s => s.status === 'HELD');
  const completedSales = mySales.filter(s => s.status === 'COMPLETED');
  const refundedSales = mySales.filter(s => s.status === 'REFUNDED');
  const cancelledSales = mySales.filter(s => s.status === 'CANCELLED');

  const totalCompleted = completedSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);
  const totalHeld = heldSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);
  const totalPending = pendingSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);

  // Active subscriptions
  const mySubscriptions = useMemo(() => 
    subscriptions.filter(s => s.vendorId === currentVendorId && s.status === 'active'),
    [currentVendorId]
  );
  const monthlyRecurring = mySubscriptions.reduce((acc, s) => acc + s.monthlyCommissionCOP, 0);

  // Payment KPIs
  const totalPaid = myPayments.filter(p => p.status === 'enviado').reduce((acc, p) => acc + p.amountCOP, 0);
  const totalScheduled = myPayments.filter(p => p.status === 'programado').reduce((acc, p) => acc + p.amountCOP, 0);

  const filteredSales = mySales.filter(sale => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const matchesSearch = !searchQuery || 
      sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === "all" || sale.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const canRequestRefund = (sale: Sale) => {
    if (sale.status !== 'HELD') return false;
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service || service.refundPolicy.refundWindowDays === 0) return false;
    const existingRefund = refundRequests.find(r => r.saleId === sale.id);
    if (existingRefund) return false;
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= service.refundPolicy.refundWindowDays;
  };

  const getRefundDaysLeft = (sale: Sale) => {
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service) return 0;
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, service.refundPolicy.refundWindowDays - diffDays);
  };

  const handleRefundRequest = () => {
    if (!refundSale || !refundReason.trim()) return;
    const service = allServices.find(s => s.id === refundSale.serviceId);
    if (!service) return;
    
    addRefundRequest({
      saleId: refundSale.id,
      vendorId: currentVendorId,
      companyId: refundSale.companyId,
      serviceId: refundSale.serviceId,
      reason: refundReason,
      status: service.refundPolicy.autoRefund ? 'automático' : 'pendiente',
      decisionBy: service.refundPolicy.autoRefund ? 'sistema' : undefined,
      decidedAt: service.refundPolicy.autoRefund ? new Date().toISOString().split('T')[0] : undefined,
    });

    toast.success(
      service.refundPolicy.autoRefund
        ? "Devolución procesada automáticamente"
        : "Solicitud de devolución enviada a la empresa"
    );
    setRefundSale(null);
    setRefundReason("");
  };

  const handleSupport = (sale: Sale) => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const message = `Hola, necesito ayuda con una venta:\n\nProducto: ${service?.name || 'N/A'}\nCliente: ${sale.clientName}\nMonto: ${formatCOP(sale.grossAmount)}\nFecha: ${formatDate(sale.createdAt)}\nEstado: ${sale.status}`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Find payment receipt for a sale
  const findPaymentForSale = (saleId: string) => {
    return myPayments.find(p => p.saleId === saleId && p.status === 'enviado');
  };

  const activeTabData = STATUS_TABS.find(t => t.key === activeTab);

  return (
    <VendorTabLayout>
      <div className="space-y-5">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {viewMode === 'sales' ? 'Mis ventas' : 'Mis pagos'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {viewMode === 'sales' ? 'Historial y estado de tus ventas' : 'Transferencias a tu cuenta bancaria'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-4 gap-1.5 text-[11px] font-medium"
            onClick={() => setViewMode(viewMode === 'sales' ? 'payments' : 'sales')}
          >
            {viewMode === 'sales' ? (
              <><Banknote className="w-3.5 h-3.5" /> Ver pagos</>
            ) : (
              <><ArrowLeft className="w-3.5 h-3.5" /> Ver ventas</>
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'sales' ? (
            <motion.div
              key="sales-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCOP(totalCompleted)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Cobrado · {completedSales.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCOP(totalHeld)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">En devolución · {heldSales.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCOP(totalPending)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pendiente · {pendingSales.length}</p>
                </div>
              </div>

              {/* Active Subscriptions - Interactive */}
              {mySubscriptions.length > 0 && (
                <div className="rounded-2xl border border-primary/15 bg-primary/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Repeat className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Suscripciones activas</p>
                        <p className="text-[10px] text-muted-foreground">Ingresos recurrentes mensuales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatCOP(monthlyRecurring)}</p>
                      <p className="text-[10px] text-muted-foreground">/mes</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {mySubscriptions.map(sub => {
                      const service = allServices.find(s => s.id === sub.serviceId);
                      const company = service ? companies.find(c => c.id === service.companyId) : null;
                      const coverImg = service?.category ? categoryCovers[service.category] : null;
                      const isExpanded = expandedSubId === sub.id;
                      // Find original sale for this subscription
                      const originalSale = mySales.find(s => s.id === sub.saleId);

                      return (
                        <div key={sub.id} className="rounded-xl bg-card border border-border/50 overflow-hidden">
                          <div
                            className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {coverImg ? (
                                <img src={coverImg} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{sub.clientName}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{service?.name}{company ? ` · ${company.name}` : ''}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-semibold text-primary">{formatCOP(sub.monthlyCommissionCOP)}</p>
                              <p className="text-[9px] text-muted-foreground">{sub.daysActive}d activa</p>
                            </div>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground/30 transition-transform", isExpanded && "rotate-180")} />
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 space-y-2.5 border-t border-border/30 pt-2.5">
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div><span className="text-muted-foreground">Inicio:</span> <span className="font-medium text-foreground">{formatDate(sub.startDate)}</span></div>
                                    <div><span className="text-muted-foreground">Próximo cobro:</span> <span className="font-medium text-foreground">{formatDate(sub.nextPaymentDate)}</span></div>
                                    <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{sub.clientEmail}</span></div>
                                    <div><span className="text-muted-foreground">Estado:</span> <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 ml-1">Activa</Badge></div>
                                  </div>
                                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    {originalSale?.clientPhone && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-7 text-[10px] rounded-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-500/20 dark:hover:bg-emerald-500/5"
                                        onClick={() => window.open(`https://wa.me/57${originalSale.clientPhone?.replace(/\s/g, '')}`, '_blank')}
                                      >
                                        <MessageCircle className="w-3 h-3 mr-1" /> Contactar cliente
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 h-7 text-[10px] rounded-full"
                                      onClick={() => { handleSupport(originalSale || mySales[0]); }}
                                    >
                                      Soporte
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Guide */}
              <StatusGuide />

              {/* Status tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                {STATUS_TABS.map(tab => {
                  const count = tab.key === 'all' ? mySales.length 
                    : tab.key === 'PENDING' ? pendingSales.length 
                    : tab.key === 'HELD' ? heldSales.length
                    : tab.key === 'COMPLETED' ? completedSales.length
                    : tab.key === 'REFUNDED' ? refundedSales.length
                    : cancelledSales.length;
                  if (tab.key !== 'all' && count === 0) return null;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === tab.key
                          ? 'bg-foreground text-background shadow-sm'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                      <span className={cn("text-[10px]", activeTab === tab.key ? 'text-background/60' : 'text-muted-foreground/50')}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-card border-border rounded-2xl text-xs"
                />
              </div>

              {/* Transaction list */}
              {filteredSales.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredSales.map(sale => {
                    const service = allServices.find(s => s.id === sale.serviceId);
                    const company = companies.find(c => c.id === sale.companyId);
                    const eligible = canRequestRefund(sale);
                    const daysLeft = getRefundDaysLeft(sale);
                    const existingRefund = refundRequests.find(r => r.saleId === sale.id);
                    const payment = findPaymentForSale(sale.id);

                    return (
                      <TransactionCard
                        key={sale.id}
                        id={sale.id}
                        clientName={sale.clientName}
                        clientEmail={sale.clientEmail}
                        clientPhone={sale.clientPhone}
                        serviceName={service?.name}
                        serviceCategory={service?.category}
                        serviceId={service?.id}
                        companyName={company?.name}
                        amount={sale.grossAmount}
                        commission={sale.sellerCommissionAmount}
                        platformFee={sale.mensualistaFeeAmount}
                        netAmount={sale.providerNetAmount}
                        status={sale.status}
                        date={sale.createdAt}
                        holdEndDate={sale.holdEndAt}
                        releasedDate={sale.releasedAt}
                        activationCode={sale.activationCode}
                        refundDaysLeft={eligible ? daysLeft : undefined}
                        refundStatus={existingRefund?.status}
                        isSubscription={service?.type === 'suscripción'}
                        paymentId={sale.mpPaymentId}
                        onRefund={eligible ? () => setRefundSale(sale) : undefined}
                        onSupport={() => handleSupport(sale)}
                        onViewReceipt={payment ? () => setReceiptSale(sale) : undefined}
                        role="vendor"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  {activeTabData && <activeTabData.icon className="w-10 h-10 text-muted-foreground/15 mb-3" />}
                  <p className="text-sm font-medium text-foreground mb-1">Sin ventas</p>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery ? 'No se encontraron ventas con esa búsqueda' : 'No tienes ventas en esta categoría'}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* ═══ PAYMENTS VIEW ═══ */
            <motion.div
              key="payments-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Payment KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCOP(totalPaid)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Total transferido</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCOP(totalScheduled)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Programado</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-muted/20 p-3.5">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Las transferencias se hacen automáticamente a tu cuenta bancaria cuando se libera el dinero de cada venta. No necesitas solicitar retiros.
                </p>
              </div>

              {/* Payment list */}
              <div className="space-y-2">
                {myPayments.map(payment => {
                  const service = allServices.find(s => s.id === payment.serviceId);
                  const company = service ? companies.find(c => c.id === service.companyId) : null;
                  const coverImg = service?.category ? categoryCovers[service.category] : null;
                  const isExpanded = expandedPaymentId === payment.id;

                  const statusColor = payment.status === 'enviado' ? 'text-emerald-600' 
                    : payment.status === 'programado' ? 'text-blue-600' : 'text-red-500';
                  const statusLabel = payment.status === 'enviado' ? 'Transferido'
                    : payment.status === 'programado' ? 'Programado' : 'Falló';
                  const statusBg = payment.status === 'enviado' ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : payment.status === 'programado' ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-red-50 dark:bg-red-500/10';

                  return (
                    <div
                      key={payment.id}
                      className={cn(
                        "rounded-2xl border bg-card overflow-hidden transition-all cursor-pointer",
                        isExpanded ? "border-border shadow-md" : "border-border/60 hover:border-border hover:shadow-sm",
                        payment.status === 'falló' && "opacity-70"
                      )}
                      onClick={() => setExpandedPaymentId(isExpanded ? null : payment.id)}
                    >
                      <div className="flex items-center gap-3.5 p-4">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted">
                            {coverImg ? (
                              <img src={coverImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Banknote className="w-4 h-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center", statusBg)}>
                            {payment.status === 'enviado' ? <CheckCircle2 className="w-2 h-2 text-emerald-600" /> :
                             payment.status === 'programado' ? <Clock className="w-2 h-2 text-blue-600" /> :
                             <XCircle className="w-2 h-2 text-red-500" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{payment.clientName || 'Transferencia'}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{service?.name}{company ? ` · ${company.name}` : ''}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <p className="text-sm font-bold text-foreground">{formatCOP(payment.amountCOP)}</p>
                          <span className={cn("text-[10px] font-medium", statusColor)}>{statusLabel}</span>
                        </div>

                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground/30 transition-transform", isExpanded && "rotate-180")} />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
                              {/* Breakdown */}
                              <div className="rounded-xl bg-muted/30 p-3.5 space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Extracto</p>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Venta bruta</span>
                                    <span className="font-medium">{formatCOP(payment.grossAmount)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Tu comisión</span>
                                    <span className="font-semibold text-primary">+{formatCOP(payment.amountCOP)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Fee plataforma</span>
                                    <span className="text-muted-foreground">-{formatCOP(payment.mensualistaFee)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-semibold border-t border-border/50 pt-1.5 mt-1.5">
                                    <span>Neto empresa</span>
                                    <span>{formatCOP(payment.providerNet)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Transfer details */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <CreditCard className="w-3 h-3" />
                                  <span>{payment.status === 'enviado' ? `Transferido el ${formatDate(payment.processedAt!)}` : `Programado: ${formatDate(payment.scheduledDate)}`}</span>
                                </div>
                                {payment.referenceId && (
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" />
                                    <span className="font-mono">{payment.referenceId}</span>
                                  </div>
                                )}
                              </div>

                              {payment.failureReason && (
                                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10">
                                  <p className="text-xs text-red-600">{payment.failureReason}</p>
                                </div>
                              )}

                              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                {payment.referenceId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs rounded-xl"
                                    onClick={() => { navigator.clipboard.writeText(payment.referenceId!); toast.success("Referencia copiada"); }}
                                  >
                                    <Copy className="w-3 h-3 mr-1.5" /> Copiar referencia
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {myPayments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Banknote className="w-10 h-10 text-muted-foreground/15 mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">Sin transferencias</p>
                    <p className="text-xs text-muted-foreground">Tus pagos aparecerán aquí cuando se liberen ventas</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Refund Modal */}
      <Dialog open={!!refundSale} onOpenChange={() => { setRefundSale(null); setRefundReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Solicitar devolución
            </DialogTitle>
            <DialogDescription className="text-xs">
              {refundSale && (() => {
                const service = allServices.find(s => s.id === refundSale.serviceId);
                return service?.refundPolicy.autoRefund 
                  ? "Devolución automática. Se procesará al instante."
                  : "La empresa revisará tu solicitud.";
              })()}
            </DialogDescription>
          </DialogHeader>
          
          {refundSale && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/30 p-3.5 space-y-2 text-sm">
                {[
                  ['Producto', allServices.find(s => s.id === refundSale.serviceId)?.name],
                  ['Cliente', refundSale.clientName],
                  ['Monto', formatCOP(refundSale.grossAmount)],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs border-t border-border/50 pt-2 mt-2">
                  <span className="text-muted-foreground">Comisión que pierdes</span>
                  <span className="text-destructive font-medium">-{formatCOP(refundSale.sellerCommissionAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Motivo</label>
                <Textarea
                  placeholder="Explica por qué solicitas la devolución..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="text-sm rounded-xl"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setRefundSale(null); setRefundReason(""); }}>
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  className="rounded-xl"
                  onClick={handleRefundRequest}
                  disabled={!refundReason.trim()}
                  variant="destructive"
                >
                  Confirmar devolución
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Receipt Modal */}
      <Dialog open={!!receiptSale} onOpenChange={() => setReceiptSale(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-primary" />
              Comprobante de pago
            </DialogTitle>
          </DialogHeader>
          {receiptSale && (() => {
            const payment = findPaymentForSale(receiptSale.id);
            const service = allServices.find(s => s.id === receiptSale.serviceId);
            const company = companies.find(c => c.id === receiptSale.companyId);
            if (!payment) return null;
            return (
              <div className="space-y-4">
                <div className="rounded-xl bg-muted/30 p-4 space-y-2.5">
                  {[
                    ['Producto', service?.name],
                    ['Empresa', company?.name],
                    ['Cliente', receiptSale.clientName],
                    ['Fecha venta', formatDate(receiptSale.createdAt)],
                    ['Fecha transferencia', payment.processedAt ? formatDate(payment.processedAt) : 'Pendiente'],
                    ['Referencia', payment.referenceId || 'N/A'],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/50 pt-2 mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Venta bruta</span>
                      <span className="font-medium">{formatCOP(payment.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tu comisión</span>
                      <span className="font-bold text-primary">+{formatCOP(payment.amountCOP)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fee plataforma</span>
                      <span>-{formatCOP(payment.mensualistaFee)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl h-9 text-xs"
                  onClick={() => { navigator.clipboard.writeText(payment.referenceId || payment.id); toast.success("Referencia copiada"); }}
                >
                  <Copy className="w-3 h-3 mr-1.5" /> Copiar referencia
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}
