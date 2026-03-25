import { useState, useMemo } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import TransactionCard from "@/components/TransactionCard";
import { 
  DollarSign, CheckCircle2, Clock, Search,
  ShieldAlert, CreditCard, TrendingUp, Send, XCircle, RotateCcw, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, CURRENT_VENDOR_ID, formatCOP, formatDate, services as allServices, companies, subscriptions } from "@/data/mockData";
import type { Sale } from "@/data/mockData";
import { toast } from "sonner";
import { Repeat, ChevronRight } from "lucide-react";
import { categoryCovers } from "@/data/coverImages";

const STATUS_TABS = [
  { key: 'all' as const,       label: 'Todas',           icon: Package },
  { key: 'PENDING' as const,   label: 'Pendientes',      icon: Send },
  { key: 'HELD' as const,      label: 'En retención',    icon: Clock },
  { key: 'COMPLETED' as const, label: 'Completadas',     icon: CheckCircle2 },
  { key: 'REFUNDED' as const,  label: 'Devueltas',       icon: RotateCcw },
  { key: 'CANCELLED' as const, label: 'Canceladas',      icon: XCircle },
];

export default function VendorPayments() {
  const { sales, commissions, refundRequests, addRefundRequest, currentVendorId } = useDemo();
  
  const [refundSale, setRefundSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'PENDING' | 'HELD' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'>("all");

  const mySales = useMemo(() => 
    sales.filter(s => s.vendorId === currentVendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales, currentVendorId]
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
  // Active subscriptions for this vendor
  const mySubscriptions = useMemo(() => 
    subscriptions.filter(s => s.vendorId === currentVendorId && s.status === 'active'),
    [currentVendorId]
  );
  const monthlyRecurring = mySubscriptions.reduce((acc, s) => acc + s.monthlyCommissionCOP, 0);


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
    const message = `Hola, necesito ayuda con un pedido:\n\nProducto: ${service?.name || 'N/A'}\nCliente: ${sale.clientName}\nMonto: ${formatCOP(sale.grossAmount)}\nFecha: ${formatDate(sale.createdAt)}\nEstado: ${sale.status}`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  const activeTabData = STATUS_TABS.find(t => t.key === activeTab);

  return (
    <VendorTabLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Mis pedidos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Historial y estado de tus ventas</p>
        </div>

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
            <p className="text-[10px] text-muted-foreground mt-0.5">Retenido · {heldSales.length}</p>
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

        {/* Active Subscriptions */}
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
                return (
                  <div key={sub.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/50">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}


        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">¿Cómo funciona?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { icon: Send, label: 'Pendiente', desc: 'Link enviado, esperando pago', color: 'text-blue-600' },
              { icon: Clock, label: 'En retención', desc: 'Pagado. El cliente puede pedir devolución durante este periodo', color: 'text-amber-600' },
              { icon: CheckCircle2, label: 'Completada', desc: 'Dinero liberado a tu cuenta', color: 'text-emerald-600' },
              { icon: RotateCcw, label: 'Devuelta', desc: 'Reembolso al cliente', color: 'text-red-500' },
              { icon: XCircle, label: 'Cancelada', desc: 'Link expirado o rechazado', color: 'text-gray-500' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 p-2 rounded-xl bg-card border border-border/50">
                <item.icon className={`w-3.5 h-3.5 ${item.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="text-[11px] font-medium text-foreground">{item.label}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
                <span className={`text-[10px] ${activeTab === tab.key ? 'text-background/60' : 'text-muted-foreground/50'}`}>
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

              return (
                <TransactionCard
                  key={sale.id}
                  id={sale.id}
                  clientName={sale.clientName}
                  clientEmail={sale.clientEmail}
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
                  role="vendor"
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {activeTabData && <activeTabData.icon className="w-10 h-10 text-muted-foreground/15 mb-3" />}
            <p className="text-sm font-medium text-foreground mb-1">Sin pedidos</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? 'No se encontraron pedidos con esa búsqueda' : 'No tienes pedidos en esta categoría'}
            </p>
          </div>
        )}
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
    </VendorTabLayout>
  );
}
