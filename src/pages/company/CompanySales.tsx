import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye, Search, ShoppingCart, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, formatCOP, formatDate, CURRENT_COMPANY_ID, companies } from "@/data/mockData";

export default function CompanySales() {
  const { sales, services, currentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);

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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "text-amber-600 bg-amber-50", label: "Retenida" },
      'RELEASED': { cls: "text-emerald-600 bg-emerald-50", label: "Liberada" },
      'REFUNDED': { cls: "text-red-600 bg-red-50", label: "Devuelta" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Ventas</h1>
          <p className="text-xs text-muted-foreground">{companySales.length} ventas totales · {formatCOP(totalGMV)} GMV</p>
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
        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {filtered.map(sale => {
            const service = services.find(s => s.id === sale.serviceId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            return (
              <div key={sale.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{sale.clientName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {vendor?.name} · {formatDate(sale.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold">{formatCOP(sale.amountCOP || sale.grossAmount)}</span>
                  {getStatusBadge(sale.status)}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedSale(sale)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Sin ventas</p>}
        </div>

        {/* Detail modal */}
        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Detalle de venta</DialogTitle></DialogHeader>
            {selectedSale && (() => {
              const service = services.find(s => s.id === selectedSale.serviceId);
              const vendor = vendors.find(v => v.id === selectedSale.vendorId);
              const fee = currentCompanyPlan === 'freemium' ? selectedSale.grossAmount * 0.15 : 0;
              const vendorComm = selectedSale.sellerCommissionAmount;
              const platformFee = selectedSale.mensualistaFeeAmount || fee;
              const net = selectedSale.grossAmount - vendorComm - platformFee;
              return (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{selectedSale.clientName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Servicio</span><span className="font-medium">{service?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vendedor</span><span className="font-medium">{vendor?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estado</span>{getStatusBadge(selectedSale.status)}</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Devolución</span><span className="text-xs">{service?.refundPolicy.refundWindowDays} días</span></div>
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Monto bruto</span><span>{formatCOP(selectedSale.grossAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Comisión vendedor</span><span className="text-red-500">-{formatCOP(vendorComm)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fee plataforma</span><span className="text-red-500">-{formatCOP(platformFee)}</span></div>
                    <div className="flex justify-between font-semibold border-t border-border pt-1.5"><span>Tu neto</span><span className="text-primary">{formatCOP(net)}</span></div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
