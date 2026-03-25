import { useState, useMemo } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import TransactionCard from "@/components/TransactionCard";
import { 
  DollarSign, CheckCircle2, Clock, Search,
  RotateCcw, ShieldAlert, CreditCard, TrendingUp, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, CURRENT_VENDOR_ID, formatCOP, formatDate, services as allServices, companies } from "@/data/mockData";
import type { Sale } from "@/data/mockData";
import { toast } from "sonner";

export default function VendorPayments() {
  const { sales, commissions, vendorPayments, refundRequests, addRefundRequest, currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  
  const [refundSale, setRefundSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<'all' | 'HELD' | 'RELEASED' | 'REFUNDED'>("all");

  const mySales = useMemo(() => 
    sales.filter(s => s.vendorId === currentVendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales, currentVendorId]
  );

  const vendorCommissions = commissions.filter(c => c.vendorId === currentVendorId);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const releasedThisMonth = vendorCommissions.filter(c => c.status === 'RELEASED' && c.createdAt.startsWith(thisMonth));
  const totalReleasedThisMonth = releasedThisMonth.reduce((acc, c) => acc + c.amountCOP, 0);
  
  const heldSales = mySales.filter(s => s.status === 'HELD');
  const releasedSales = mySales.filter(s => s.status === 'RELEASED');
  const refundedSales = mySales.filter(s => s.status === 'REFUNDED');
  const totalHeld = heldSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);
  const totalReleased = releasedSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);

  const filteredSales = mySales.filter(sale => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const matchesSearch = sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === "all" || sale.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const canRequestRefund = (sale: Sale) => {
    if (sale.status !== 'HELD') return false;
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service) return false;
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
    const message = `Hola, necesito ayuda con una venta:\n\n` +
      `Servicio: ${service?.name || 'N/A'}\n` +
      `Cliente: ${sale.clientName}\n` +
      `Monto: ${formatCOP(sale.grossAmount)}\n` +
      `Fecha: ${formatDate(sale.createdAt)}\n` +
      `Estado: ${sale.status}`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  const statusTabs = [
    { key: 'all' as const, label: 'Todas', count: mySales.length },
    { key: 'HELD' as const, label: 'Retenidas', count: heldSales.length },
    { key: 'RELEASED' as const, label: 'Liberadas', count: releasedSales.length },
    { key: 'REFUNDED' as const, label: 'Devueltas', count: refundedSales.length },
  ];

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Pagos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tus ventas, retenciones y comisiones</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Main KPI */}
          <div className="sm:col-span-1 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Liberado este mes</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCOP(totalReleasedThisMonth)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[11px] text-primary font-medium">{releasedThisMonth.length} transacciones</span>
            </div>
          </div>

          {/* Held */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">En retención</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCOP(totalHeld)}</p>
            <span className="text-[11px] text-muted-foreground">{heldSales.length} ventas pendientes</span>
          </div>

          {/* Released total */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total cobrado</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCOP(totalReleased)}</p>
            <span className="text-[11px] text-muted-foreground">{releasedSales.length} ventas cobradas</span>
          </div>
        </div>

        {/* How it works */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
          <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cada venta pasa por un <strong className="text-foreground">periodo de retención</strong> definido por la empresa (7, 14 o 30 días según el servicio). Al liberarse, tu comisión se transfiere automáticamente.
          </p>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-foreground text-background'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${activeTab === tab.key ? 'text-background/70' : 'text-muted-foreground/60'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-card border-border rounded-xl text-xs"
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
            <DollarSign className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Sin resultados</p>
            <p className="text-xs text-muted-foreground">No se encontraron ventas con esos filtros</p>
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
                  ['Servicio', allServices.find(s => s.id === refundSale.serviceId)?.name],
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
                  className="text-sm"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => { setRefundSale(null); setRefundReason(""); }}>
                  Cancelar
                </Button>
                <Button 
                  size="sm"
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
