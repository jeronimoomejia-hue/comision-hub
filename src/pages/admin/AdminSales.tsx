import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sales, services, companies, vendors, formatCOP, formatDate } from "@/data/mockData";

export default function AdminSales() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const filtered = sales.filter(s => {
    return (statusFilter === "all" || s.status === statusFilter) &&
           (companyFilter === "all" || s.companyId === companyFilter);
  });

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
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Ventas</h1>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="HELD">Retenida</SelectItem>
              <SelectItem value="RELEASED">Liberada</SelectItem>
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

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {filtered.slice(0, 40).map(sale => {
            const service = services.find(s => s.id === sale.serviceId);
            const company = companies.find(c => c.id === sale.companyId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            return (
              <div key={sale.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{sale.clientName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {company?.name} · {vendor?.name}</p>
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
              const company = companies.find(c => c.id === selectedSale.companyId);
              const vendor = vendors.find(v => v.id === selectedSale.vendorId);
              return (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{selectedSale.clientName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Empresa</span><span>{company?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gig</span><span>{service?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vendedor</span><span>{vendor?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-semibold">{formatCOP(selectedSale.amountCOP)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estado</span>{getStatusBadge(selectedSale.status)}</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{formatDate(selectedSale.createdAt)}</span></div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}