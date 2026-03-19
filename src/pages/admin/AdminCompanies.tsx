import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { companies, formatCOP } from "@/data/mockData";

export default function AdminCompanies() {
  const { sales, services } = useDemo();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const filtered = companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStats = (companyId: string) => {
    const cs = sales.filter(s => s.companyId === companyId);
    const svc = services.filter(s => s.companyId === companyId);
    return {
      totalSales: cs.length,
      totalGMV: cs.reduce((a, s) => a + (s.amountCOP || 0), 0),
      activeServices: svc.filter(s => s.status === 'activo').length,
      uniqueVendors: new Set(cs.map(s => s.vendorId)).size,
    };
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: "text-emerald-600 bg-emerald-50", label: "Activa" },
      paused: { cls: "text-amber-600 bg-amber-50", label: "Pausada" },
      blocked: { cls: "text-red-600 bg-red-50", label: "Bloqueada" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Empresas</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {filtered.map(company => {
            const stats = getStats(company.id);
            return (
              <div key={company.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{company.name}</p>
                    {getStatusBadge(company.status)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{company.industry} · {stats.activeServices} servicios · {stats.totalSales} ventas</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold">{formatCOP(stats.totalGMV)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected({ ...company, stats })}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">{selected?.name}</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{selected.industry} · {selected.country}</p>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{selected.stats.totalSales}</p><p className="text-[10px] text-muted-foreground">Ventas</p></div>
                  <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{formatCOP(selected.stats.totalGMV)}</p><p className="text-[10px] text-muted-foreground">GMV</p></div>
                  <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{selected.stats.activeServices}</p><p className="text-[10px] text-muted-foreground">Gigs</p></div>
                  <div className="p-2 rounded-lg bg-muted/50"><p className="font-bold">{selected.stats.uniqueVendors}</p><p className="text-[10px] text-muted-foreground">Vendedores</p></div>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>{selected.contactEmail}</p>
                  <p>{selected.contactPhone}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}