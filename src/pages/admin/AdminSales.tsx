import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sales, services, companies, vendors, formatCOP } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";

export default function AdminSales() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  const filtered = sales.filter(s => {
    return (statusFilter === "all" || s.status === statusFilter) &&
           (companyFilter === "all" || s.companyId === companyFilter);
  });

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Ventas</h1>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="HELD">Retenida</SelectItem>
              <SelectItem value="COMPLETED">Liberada</SelectItem>
              <SelectItem value="REFUNDED">Devuelta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Empresa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground self-center ml-auto">{filtered.length} resultados</span>
        </div>

        <StatusGuide />

        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Sin ventas</p>}
          {filtered.slice(0, 40).map(sale => {
            const service = services.find(s => s.id === sale.serviceId);
            const company = companies.find(c => c.id === sale.companyId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            return (
              <TransactionCard
                key={sale.id}
                id={sale.id}
                clientName={sale.clientName}
                clientEmail={sale.clientEmail}
                serviceName={service?.name}
                serviceCategory={service?.category}
                companyName={company?.name}
                vendorName={vendor?.name}
                amount={sale.amountCOP}
                commission={sale.sellerCommissionAmount}
                platformFee={sale.mensualistaFeeAmount}
                netAmount={sale.providerNetAmount}
                status={sale.status}
                statusType="sale"
                date={sale.createdAt}
                holdEndDate={sale.holdEndAt}
                releasedDate={sale.releasedAt}
                isSubscription={sale.isSubscription}
                paymentId={sale.mpPaymentId}
                role="admin"
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
