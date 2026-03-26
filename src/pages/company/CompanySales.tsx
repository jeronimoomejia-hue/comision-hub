import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Clock, CheckCircle, RotateCcw, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, formatCOP, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";

export default function CompanySales() {
  const { sales, services, currentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'HELD' | 'COMPLETED' | 'REFUNDED'>("all");

  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const heldCount = companySales.filter(s => s.status === 'HELD').length;
  const releasedCount = companySales.filter(s => s.status === 'COMPLETED').length;
  const refundedCount = companySales.filter(s => s.status === 'REFUNDED').length;
  const totalGMV = companySales.reduce((s, sale) => s + (sale.amountCOP || sale.grossAmount), 0);
  const totalNet = companySales
    .filter(s => s.status !== 'REFUNDED')
    .reduce((s, sale) => s + sale.providerNetAmount, 0);

  const filtered = companySales.filter(s => {
    const matchesStatus = activeTab === "all" || s.status === activeTab;
    const service = services.find(sv => sv.id === s.serviceId);
    const vendor = vendors.find(v => v.id === s.vendorId);
    const matchesSearch = !searchQuery || 
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusTabs = [
    { key: 'all' as const, label: 'Todas', count: companySales.length },
    { key: 'HELD' as const, label: 'Retenidas', count: heldCount },
    { key: 'COMPLETED' as const, label: 'Liberadas', count: releasedCount },
    { key: 'REFUNDED' as const, label: 'Devueltas', count: refundedCount },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Historial de ventas de tu red de vendedores</p>
        </div>

        {/* KPIs */}
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
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Retenidas</span>
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
          <Input placeholder="Buscar cliente, producto o vendedor..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-card border-border rounded-xl text-xs" />
        </div>

        {/* Sales list */}
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Sin resultados</p>
              <p className="text-xs text-muted-foreground">No se encontraron ventas</p>
            </div>
          )}
          <StatusGuide />
          {filtered.map(sale => {
            const service = services.find(s => s.id === sale.serviceId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            const vendorComm = sale.sellerCommissionAmount;
            const platformFee = sale.mensualistaFeeAmount;
            const net = sale.providerNetAmount;
            return (
              <TransactionCard
                key={sale.id}
                id={sale.id}
                clientName={sale.clientName}
                clientEmail={sale.clientEmail}
                serviceName={service?.name}
                serviceCategory={service?.category}
                vendorName={vendor?.name}
                amount={sale.amountCOP || sale.grossAmount}
                commission={vendorComm}
                platformFee={platformFee}
                netAmount={net}
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
      </div>
    </DashboardLayout>
  );
}
