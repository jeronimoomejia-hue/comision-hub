import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, DollarSign, CheckCircle, Clock, TrendingUp, RotateCcw, ShoppingCart, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";
import { companies, vendors, CURRENT_COMPANY_ID, formatCOP, services as allServices } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";

type PageView = 'ventas' | 'pagos';

export default function CompanyPayments() {
  const { sales, services, companyPayments, refundRequests } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);

  const [view, setView] = useState<PageView>('ventas');
  const [searchQuery, setSearchQuery] = useState("");
  const [salesTab, setSalesTab] = useState<'all' | 'HELD' | 'COMPLETED' | 'REFUNDED'>('all');
  const [paymentsTab, setPaymentsTab] = useState<'all' | 'enviado'>('all');

  // Sales data
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const heldCount = companySales.filter(s => s.status === 'HELD').length;
  const releasedCount = companySales.filter(s => s.status === 'COMPLETED').length;
  const refundedCount = companySales.filter(s => s.status === 'REFUNDED').length;
  const totalGMV = companySales.reduce((s, sale) => s + (sale.amountCOP || sale.grossAmount), 0);
  const totalNet = companySales.filter(s => s.status !== 'REFUNDED').reduce((s, sale) => s + sale.providerNetAmount, 0);

  const filteredSales = companySales.filter(s => {
    const matchesStatus = salesTab === "all" || s.status === salesTab;
    const service = services.find(sv => sv.id === s.serviceId);
    const vendor = vendors.find(v => v.id === s.vendorId);
    const matchesSearch = !searchQuery ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Payments data — only completed transfers
  const myPayments = companyPayments.filter(p => p.companyId === CURRENT_COMPANY_ID)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  const completedPayments = myPayments.filter(p => p.status === 'enviado');
  const totalReceived = completedPayments.reduce((s, p) => s + p.amountCOP, 0);

  const filteredPayments = paymentsTab === 'all' ? completedPayments : completedPayments;

  const salesStatusTabs = [
    { key: 'all' as const, label: 'Todas', count: companySales.length },
    { key: 'HELD' as const, label: 'Tiempo de devolución', count: heldCount },
    { key: 'COMPLETED' as const, label: 'Liberadas', count: releasedCount },
    { key: 'REFUNDED' as const, label: 'Devueltas', count: refundedCount },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        {/* View toggle */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {view === 'ventas' ? 'Ventas' : 'Pagos recibidos'}
          </h1>
          <div className="flex-1" />
          {view === 'ventas' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setView('pagos')}
            >
              <CreditCard className="w-3.5 h-3.5" /> Ver pagos
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setView('ventas')}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a ventas
            </Button>
          )}
        </div>

        {view === 'ventas' && (
          <>
            {/* Sales KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">GMV total</span>
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground">{formatCOP(totalGMV)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Neto empresa</span>
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-lg font-bold text-primary">{formatCOP(totalNet)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Tiempo de devolución</span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-lg font-bold text-foreground">{heldCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Devueltas</span>
                  <RotateCcw className="w-3.5 h-3.5 text-destructive" />
                </div>
                <p className="text-lg font-bold text-foreground">{refundedCount}</p>
              </div>
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {salesStatusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSalesTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    salesTab === tab.key
                      ? 'bg-foreground text-background'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] ${salesTab === tab.key ? 'text-background/70' : 'text-muted-foreground/60'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Buscar cliente, producto o vendedor..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-card border-border rounded-xl text-xs" />
            </div>

            <StatusGuide />

            {/* Sales list */}
            <div className="space-y-2.5">
              {filteredSales.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Sin resultados</p>
                  <p className="text-xs text-muted-foreground">No se encontraron ventas</p>
                </div>
              )}
              {filteredSales.map(sale => {
                const service = services.find(s => s.id === sale.serviceId);
                const vendor = vendors.find(v => v.id === sale.vendorId);
                return (
                  <TransactionCard
                    key={sale.id}
                    id={sale.id}
                    clientName={sale.clientName}
                    clientEmail={sale.clientEmail}
                    clientPhone={sale.clientPhone}
                    serviceName={service?.name}
                    serviceCategory={service?.category}
                    vendorName={vendor?.name}
                    amount={sale.amountCOP || sale.grossAmount}
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
                    role="company"
                  />
                );
              })}
            </div>
          </>
        )}

        {view === 'pagos' && (
          <>
            {/* Payments KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Total recibido</span>
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCOP(totalReceived)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{completedPayments.length} transferencias completadas</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Última transferencia</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {completedPayments[0] ? formatCOP(completedPayments[0].amountCOP) : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {completedPayments[0] ? new Date(completedPayments[0].scheduledDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin transferencias'}
                </p>
              </div>
            </div>

            <StatusGuide />

            {/* Payments list — only completed */}
            <div className="space-y-2.5">
              {completedPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <DollarSign className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Sin transferencias</p>
                  <p className="text-xs text-muted-foreground">Aún no se han realizado pagos</p>
                </div>
              ) : completedPayments.map(payment => {
                const service = allServices.find(s => s.id === payment.serviceId);
                const vendor = vendors.find(v => v.id === payment.vendorId);
                return (
                  <TransactionCard
                    key={payment.id}
                    id={payment.id}
                    clientName={payment.clientName}
                    serviceName={service?.name}
                    serviceCategory={service?.category}
                    vendorName={vendor?.name}
                    amount={payment.amountCOP}
                    commission={payment.vendorCommission}
                    platformFee={payment.mensualistaFee}
                    netAmount={payment.amountCOP}
                    status={payment.status}
                    statusType="payment"
                    date={payment.scheduledDate}
                    role="company"
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function CreditCard(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
