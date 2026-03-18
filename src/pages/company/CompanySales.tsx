import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sales, services, vendors, formatCOP, formatDate, CURRENT_COMPANY_ID } from "@/data/mockData";

export default function CompanySales() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const filtered = companySales.filter(s => statusFilter === "all" || s.status === statusFilter);

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
    <DashboardLayout role="company" userName="Poliza.ai">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Ventas</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="HELD">Retenida</SelectItem>
              <SelectItem value="RELEASED">Liberada</SelectItem>
              <SelectItem value="REFUNDED">Devuelta</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                  <span className="text-sm font-semibold">{formatCOP(sale.amountCOP)}</span>
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

        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Detalle de venta</DialogTitle></DialogHeader>
            {selectedSale && (() => {
              const service = services.find(s => s.id === selectedSale.serviceId);
              const vendor = vendors.find(v => v.id === selectedSale.vendorId);
              const commission = service ? (selectedSale.amountCOP * service.vendorCommissionPct / 100) : 0;
              const fee = selectedSale.amountCOP * 0.08;
              const net = selectedSale.amountCOP - commission - fee;
              return (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{selectedSale.clientName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Servicio</span><span className="font-medium">{service?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vendedor</span><span className="font-medium">{vendor?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estado</span>{getStatusBadge(selectedSale.status)}</div>
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span>{formatCOP(selectedSale.amountCOP)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Comisión vendedor</span><span className="text-red-500">-{formatCOP(commission)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fee plataforma</span><span className="text-red-500">-{formatCOP(fee)}</span></div>
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