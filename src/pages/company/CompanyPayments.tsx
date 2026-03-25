import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { companies, vendors, CURRENT_COMPANY_ID, formatCOP, services as allServices } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import { DollarSign, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function CompanyPayments() {
  const { companyPayments } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  
  const myPayments = companyPayments.filter(p => p.companyId === CURRENT_COMPANY_ID);
  const [activeTab, setActiveTab] = useState<string>('all');

  const sent = myPayments.filter(p => p.status === 'enviado');
  const scheduled = myPayments.filter(p => p.status === 'programado');
  const failed = myPayments.filter(p => p.status === 'falló');
  const totalReceived = sent.reduce((s, p) => s + p.amountCOP, 0);

  const statusTabs = [
    { key: 'all', label: 'Todos', count: myPayments.length },
    { key: 'enviado', label: 'Recibidos', count: sent.length },
    { key: 'programado', label: 'Programados', count: scheduled.length },
    { key: 'falló', label: 'Fallidos', count: failed.length },
  ];

  const filtered = activeTab === 'all' ? myPayments : myPayments.filter(p => p.status === activeTab);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pagos recibidos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Transferencias automáticas a tu cuenta bancaria</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total recibido</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCOP(totalReceived)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[11px] text-primary font-medium">{sent.length} transferencias</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Programados</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{scheduled.length}</p>
            <span className="text-[11px] text-muted-foreground">Próximas transferencias</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Completados</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{sent.length}</p>
            <span className="text-[11px] text-muted-foreground">Transferidos exitosamente</span>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Payments list */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Sin transferencias</p>
              <p className="text-xs text-muted-foreground">No hay pagos en esta categoría</p>
            </div>
          ) : filtered.slice(0, 30).map(payment => {
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
                failureReason={payment.failureReason}
                role="company"
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
