import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, formatCOP, formatDate } from "@/data/mockData";

export default function AdminVendors() {
  const { sales, commissions } = useDemo();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStats = (vendorId: string) => {
    const vs = sales.filter(s => s.vendorId === vendorId);
    const vc = commissions.filter(c => c.vendorId === vendorId);
    return {
      totalSales: vs.length,
      totalGMV: vs.reduce((a, s) => a + (s.amountCOP || 0), 0),
      released: vc.filter(c => c.status === 'COMPLETED').reduce((a, c) => a + c.amountCOP, 0),
      held: vc.filter(c => c.status === 'HELD').reduce((a, c) => a + c.amountCOP, 0),
    };
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: "text-emerald-600 bg-emerald-50", label: "Activo" },
      paused: { cls: "text-amber-600 bg-amber-50", label: "Pausado" },
      blocked: { cls: "text-red-600 bg-red-50", label: "Bloqueado" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Vendedores</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="paused">Pausados</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {filtered.map(vendor => {
            const stats = getStats(vendor.id);
            return (
              <div key={vendor.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{vendor.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{vendor.name}</p>
                      {getStatusBadge(vendor.status)}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{stats.totalSales} ventas · {formatCOP(stats.totalGMV)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setSelectedVendor({ ...vendor, stats })}>
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Vendedor</DialogTitle></DialogHeader>
            {selectedVendor && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {selectedVendor.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedVendor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor.email} · {selectedVendor.country}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{selectedVendor.stats.totalSales}</p><p className="text-[10px] text-muted-foreground">Ventas</p></div>
                  <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{formatCOP(selectedVendor.stats.totalGMV)}</p><p className="text-[10px] text-muted-foreground">GMV</p></div>
                  <div className="p-2 rounded-lg bg-emerald-50"><p className="font-bold text-emerald-600">{formatCOP(selectedVendor.stats.released)}</p><p className="text-[10px] text-muted-foreground">Pagado</p></div>
                  <div className="p-2 rounded-lg bg-amber-50"><p className="font-bold text-amber-600">{formatCOP(selectedVendor.stats.held)}</p><p className="text-[10px] text-muted-foreground">Retenido</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}