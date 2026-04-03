import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, DollarSign, CheckCircle, Clock, TrendingUp, RotateCcw, ShoppingCart, ChevronRight, ArrowLeft, Download, BarChart3, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";
import { companies, vendors, CURRENT_COMPANY_ID, formatCOP, services as allServices, formatDate } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

type PageView = 'ventas' | 'pagos';

export default function CompanyPayments() {
  const { sales, services, companyPayments, refundRequests } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);

  const [view, setView] = useState<PageView>('ventas');
  const [searchQuery, setSearchQuery] = useState("");
  const [salesTab, setSalesTab] = useState<'all' | 'HELD' | 'COMPLETED' | 'REFUNDED'>('all');
  const [showDetails, setShowDetails] = useState(false);

  const now = new Date();
  const thisMonthKey = now.toISOString().slice(0, 7);
  const thisMonthLabel = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = lastMonth.toISOString().slice(0, 7);

  // Sales data
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const salesThisMonth = companySales.filter(s => s.createdAt.startsWith(thisMonthKey));
  const salesLastMonth = companySales.filter(s => s.createdAt.startsWith(lastMonthKey));
  const heldCount = companySales.filter(s => s.status === 'HELD').length;
  const releasedCount = companySales.filter(s => s.status === 'COMPLETED').length;
  const refundedCount = companySales.filter(s => s.status === 'REFUNDED').length;
  const totalGMV = companySales.reduce((s, sale) => s + (sale.amountCOP || sale.grossAmount), 0);
  const totalNet = companySales.filter(s => s.status !== 'REFUNDED').reduce((s, sale) => s + sale.providerNetAmount, 0);
  const gmvThisMonth = salesThisMonth.reduce((s, sale) => s + (sale.amountCOP || sale.grossAmount), 0);
  const netThisMonth = salesThisMonth.filter(s => s.status !== 'REFUNDED').reduce((s, sale) => s + sale.providerNetAmount, 0);
  const commissionsThisMonth = salesThisMonth.reduce((s, sale) => s + sale.sellerCommissionAmount, 0);
  const avgTicket = salesThisMonth.length > 0 ? Math.round(gmvThisMonth / salesThisMonth.length) : 0;

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
  const myPayments = companyPayments.filter(p => p.companyId === CURRENT_COMPANY_ID && p.status === 'enviado')
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  const totalReceived = myPayments.reduce((s, p) => s + p.amountCOP, 0);
  const receivedThisMonth = myPayments.filter(p => p.processedAt?.startsWith(thisMonthKey)).reduce((s, p) => s + p.amountCOP, 0);

  const salesStatusTabs = [
    { key: 'all' as const, label: 'Todas', count: companySales.length },
    { key: 'HELD' as const, label: 'En devolución', count: heldCount },
    { key: 'COMPLETED' as const, label: 'Liberadas', count: releasedCount },
    { key: 'REFUNDED' as const, label: 'Devueltas', count: refundedCount },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
       <div className="space-y-5">
        <TutorialOverlay pageId="company-payments" steps={companyPaymentsTutorial} />
        {/* View toggle */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {view === 'ventas' ? 'Ventas' : 'Pagos recibidos'}
          </h1>
          <div className="flex-1" />
          <div className="flex gap-2">
            {view === 'ventas' && (
              <Link to="/company/services">
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 rounded-full h-8 text-muted-foreground">
                  <ShoppingCart className="w-3.5 h-3.5" /> Ver ventas por servicio
                </Button>
              </Link>
            )}
            {view === 'ventas' ? (
              <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full h-8" onClick={() => setView('pagos')}>
                <CreditCardIcon className="w-3.5 h-3.5" /> Ver pagos
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full h-8" onClick={() => setView('ventas')}>
                <ArrowLeft className="w-3.5 h-3.5" /> Volver a ventas
              </Button>
            )}
          </div>
        </div>

        {view === 'ventas' && (
          <>
            {/* Sales KPIs with time periods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">GMV este mes</span>
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-base font-bold text-foreground">{formatCOP(gmvThisMonth)}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">{thisMonthLabel} · {salesThisMonth.length} ventas</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Neto empresa</span>
                  <TrendingUp className="w-3 h-3 text-primary" />
                </div>
                <p className="text-base font-bold text-primary">{formatCOP(netThisMonth)}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">Despues de comisiones y fees</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">En devolución</span>
                  <Clock className="w-3 h-3 text-amber-500" />
                </div>
                <p className="text-base font-bold text-foreground">{heldCount}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">Ventas en periodo</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Ticket promedio</span>
                  <BarChart3 className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-base font-bold text-foreground">{formatCOP(avgTicket)}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">Este mes</p>
              </div>
            </div>

            {/* Extended metrics */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-[10px] font-medium hover:bg-muted transition-colors"
            >
              <BarChart3 className="w-3 h-3" /> Mas metricas
              <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "GMV total", value: formatCOP(totalGMV) },
                      { label: "Neto total", value: formatCOP(totalNet) },
                      { label: "Comisiones pagadas", value: formatCOP(commissionsThisMonth), sub: thisMonthLabel },
                      { label: "Devoluciones", value: String(refundedCount) },
                    ].map((m, i) => (
                      <div key={i} className="rounded-lg border border-border bg-card p-2.5 text-center">
                        <p className="text-[11px] font-bold text-foreground">{m.value}</p>
                        <p className="text-[8px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {salesStatusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSalesTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap ${
                    salesTab === tab.key
                      ? 'bg-foreground text-background'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[9px] ${salesTab === tab.key ? 'text-background/70' : 'text-muted-foreground/60'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input placeholder="Buscar cliente, producto o vendedor..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 bg-card border-border rounded-xl text-[10px]" />
            </div>

            <StatusGuide />

            {/* Sales list — no client contact info for company */}
            <div className="space-y-2">
              {filteredSales.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs font-medium text-foreground mb-0.5">Sin resultados</p>
                  <p className="text-[10px] text-muted-foreground">No se encontraron ventas</p>
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
            {/* Payments KPIs — only transferred */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Total recibido</span>
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{formatCOP(totalReceived)}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{myPayments.length} transferencias</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Este mes</span>
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{formatCOP(receivedThisMonth)}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{thisMonthLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Última transferencia</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-foreground">
                  {myPayments[0] ? formatCOP(myPayments[0].amountCOP) : '--'}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {myPayments[0] ? formatDate(myPayments[0].scheduledDate) : 'Sin transferencias'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Solo se muestran pagos ya transferidos. Las transferencias son automáticas cuando finaliza el periodo de devolución de cada venta.
              </p>
            </div>

            {/* Payments list — only completed */}
            <div className="space-y-2">
              {myPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs font-medium text-foreground mb-0.5">Sin transferencias</p>
                  <p className="text-[10px] text-muted-foreground">Los pagos aparecerán aquí cuando se transfieran</p>
                </div>
              ) : myPayments.map(payment => {
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

function CreditCardIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
