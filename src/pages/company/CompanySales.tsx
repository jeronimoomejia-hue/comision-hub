import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, formatCOP, formatDate, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";

export default function CompanySales() {
  const { sales, services, currentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const filtered = companySales.filter(s => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const service = services.find(sv => sv.id === s.serviceId);
    const vendor = vendors.find(v => v.id === s.vendorId);
    const matchesSearch = !searchQuery || 
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const heldCount = companySales.filter(s => s.status === 'HELD').length;
  const releasedCount = companySales.filter(s => s.status === 'RELEASED').length;
  const refundedCount = companySales.filter(s => s.status === 'REFUNDED').length;
  const totalGMV = companySales.reduce((s, sale) => s + (sale.amountCOP || sale.grossAmount), 0);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Ventas</h1>
          <p className="text-xs text-muted-foreground">{companySales.length} ventas · {formatCOP(totalGMV)} GMV</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold">{heldCount}</p>
            <p className="text-[10px] text-muted-foreground">En retención</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold">{releasedCount}</p>
            <p className="text-[10px] text-muted-foreground">Liberadas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <RotateCcw className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold">{refundedCount}</p>
            <p className="text-[10px] text-muted-foreground">Devueltas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar cliente, servicio o vendedor..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-8 text-xs" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="HELD">Retenida</SelectItem>
              <SelectItem value="RELEASED">Liberada</SelectItem>
              <SelectItem value="REFUNDED">Devuelta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sales list */}
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Sin ventas</p>}
          {filtered.map(sale => {
            const service = services.find(s => s.id === sale.serviceId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            const fee = currentCompanyPlan === 'freemium' ? sale.grossAmount * 0.15 : 0;
            const vendorComm = sale.sellerCommissionAmount;
            const platformFee = sale.mensualistaFeeAmount || fee;
            const net = sale.grossAmount - vendorComm - platformFee;
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
