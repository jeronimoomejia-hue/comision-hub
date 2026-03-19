import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Eye, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, companies, formatCOP, formatDate, getServiceById } from "@/data/mockData";

export default function AdminTransactions() {
  const { sales } = useDemo();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setLastUpdate(new Date()), 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const filtered = sales
    .filter(s => statusFilter === "all" || s.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
              <SelectItem value="RELEASED">Liberada</SelectItem>
              <SelectItem value="REFUNDED">Devuelta</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} transacciones · {lastUpdate.toLocaleTimeString()}</span>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {filtered.slice(0, 30).map(sale => {
            const service = getServiceById(sale.serviceId);
            const company = companies.find(c => c.id === sale.companyId);
            const vendor = vendors.find(v => v.id === sale.vendorId);
            return (
              <div key={sale.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{sale.clientName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {company?.name} · {vendor?.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold">{formatCOP(sale.amountCOP || sale.grossAmount)}</span>
                  {getStatusBadge(sale.status)}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(sale)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Transacción</DialogTitle></DialogHeader>
            {selected && (() => {
              const service = getServiceById(selected.serviceId);
              const company = companies.find(c => c.id === selected.companyId);
              const vendor = vendors.find(v => v.id === selected.vendorId);
              const amount = selected.amountCOP || selected.grossAmount || 0;
              const vendorComm = selected.sellerCommissionAmount || Math.round(amount * 0.20);
              const platformFee = selected.mensualistaFeeAmount || Math.round(amount * 0.08);
              const companyNet = amount - vendorComm - platformFee;
              return (
                <div className="space-y-2 text-sm">
                  <div className="text-center py-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{formatCOP(amount)}</p>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{selected.clientName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gig</span><span>{service?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Empresa</span><span>{company?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vendedor</span><span>{vendor?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estado</span>{getStatusBadge(selected.status)}</div>
                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Comisión vendedor</span><span>{formatCOP(vendorComm)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Fee plataforma</span><span>{formatCOP(platformFee)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Neto empresa</span><span>{formatCOP(companyNet)}</span></div>
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