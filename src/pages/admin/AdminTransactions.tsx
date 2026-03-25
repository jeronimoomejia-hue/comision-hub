import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, companies, formatCOP, getServiceById } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";

export default function AdminTransactions() {
  const { sales } = useDemo();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLive, setIsLive] = useState(true);

  const filtered = sales
    .filter(s => statusFilter === "all" || s.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Transacciones</h1>
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setIsLive(!isLive)}>
            {isLive ? <Zap className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
            {isLive ? 'En vivo' : 'Pausado'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="HELD">Retenida</SelectItem>
              <SelectItem value="COMPLETED">Liberada</SelectItem>
              <SelectItem value="REFUNDED">Devuelta</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} transacciones</span>
        </div>

        <StatusGuide />

        <div className="space-y-2">
          {filtered.slice(0, 30).map(sale => {
            const service = getServiceById(sale.serviceId);
            const company = companies.find(c => c.id === sale.companyId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            const vendorComm = sale.sellerCommissionAmount || Math.round((sale.amountCOP || sale.grossAmount) * 0.20);
            const platformFee = sale.mensualistaFeeAmount || Math.round((sale.amountCOP || sale.grossAmount) * 0.08);
            const companyNet = (sale.amountCOP || sale.grossAmount) - vendorComm - platformFee;
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
                amount={sale.amountCOP || sale.grossAmount}
                commission={vendorComm}
                platformFee={platformFee}
                netAmount={companyNet}
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
