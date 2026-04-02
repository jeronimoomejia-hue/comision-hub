import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Plus, Copy, Users, Search,
  Star, BookOpen, CheckCircle2, Clock, ChevronRight,
  Package, Crown, Shield, Link2, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sales, services, vendors, commissions, trainingProgress as allTraining, formatCOP, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

export default function CompanyVendors() {
  const { currentCompanyPlan, trainingProgress } = useDemo();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'todos' | 'activos' | 'capacitandose' | 'inactivos'>('todos');

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const vendorIds = new Set(companySales.map(s => s.vendorId));
  const serviceIds = new Set(companyServices.map(s => s.id));
  trainingProgress.filter(tp => serviceIds.has(tp.serviceId)).forEach(tp => vendorIds.add(tp.vendorId));
  const companyVendors = vendors.filter(v => vendorIds.has(v.id));
  const inviteLink = `https://app.mensualista.com/join/${company?.id || 'demo'}`;
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const getVendorData = (vendorId: string) => {
    const vs = companySales.filter(s => s.vendorId === vendorId);
    const monthSales = vs.filter(s => new Date(s.createdAt) >= monthAgo);
    const gmv = monthSales.reduce((sum, s) => sum + s.amountCOP, 0);
    const vc = commissions.filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId));
    const totalCommission = vc.reduce((sum, c) => sum + c.amountCOP, 0);
    const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === vendorId && serviceIds.has(tp.serviceId));
    const completedTrainings = vendorTrainings.filter(tp => tp.status === 'declared_completed').length;
    const inProgressTrainings = vendorTrainings.filter(tp => tp.status === 'in_progress').length;
    const vendorServiceIds = new Set(vs.map(s => s.serviceId));

    // Commission per service with public/private differentiation
    const serviceCommissions = Array.from(vendorServiceIds).map(sId => {
      const svc = companyServices.find(s => s.id === sId);
      const basePct = svc?.vendorCommissionPct || 0;
      // If this vendor has higher than base commission, it's a private link
      const vendorSalesForService = vs.filter(s => s.serviceId === sId);
      const actualPct = vendorSalesForService.length > 0
        ? Math.round((vendorSalesForService[0].sellerCommissionAmount / vendorSalesForService[0].grossAmount) * 100)
        : basePct;
      const isPrivate = actualPct > basePct;
      return { serviceName: svc?.name || '', pct: actualPct, basePct, isPrivate };
    });

    let status: 'top' | 'activo' | 'capacitandose' | 'inactivo' = 'inactivo';
    if (monthSales.length >= 3) status = 'top';
    else if (monthSales.length > 0) status = 'activo';
    else if (inProgressTrainings > 0 || completedTrainings > 0) status = 'capacitandose';

    return {
      salesMonth: monthSales.length, totalSales: vs.length, gmv,
      commission: totalCommission, completedTrainings,
      servicesCount: vendorServiceIds.size, status, serviceCommissions,
    };
  };

  const vendorsWithData = companyVendors.map(v => ({ ...v, data: getVendorData(v.id) }))
    .sort((a, b) => b.data.salesMonth - a.data.salesMonth);

  const filteredVendors = vendorsWithData.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'todos') return true;
    if (filter === 'activos') return v.data.status === 'top' || v.data.status === 'activo';
    if (filter === 'capacitandose') return v.data.status === 'capacitandose';
    if (filter === 'inactivos') return v.data.status === 'inactivo';
    return true;
  });

  const activeVendors = vendorsWithData.filter(v => v.data.salesMonth > 0).length;

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    top: { label: 'Top', cls: 'bg-amber-500/10 text-amber-600', icon: Star },
    activo: { label: 'Activo', cls: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
    capacitandose: { label: 'Entrenando', cls: 'bg-blue-500/10 text-blue-600', icon: BookOpen },
    inactivo: { label: 'Inactivo', cls: 'bg-muted text-muted-foreground', icon: Clock },
  };

  const filters = [
    { id: 'todos', label: 'Todos', count: vendorsWithData.length },
    { id: 'activos', label: 'Activos', count: vendorsWithData.filter(v => v.data.status === 'top' || v.data.status === 'activo').length },
    { id: 'capacitandose', label: 'Entrenando', count: vendorsWithData.filter(v => v.data.status === 'capacitandose').length },
    { id: 'inactivos', label: 'Inactivos', count: vendorsWithData.filter(v => v.data.status === 'inactivo').length },
  ];

  const copyInviteLink = () => { navigator.clipboard.writeText(inviteLink); toast.success("Enlace copiado"); };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-foreground">Mi Red</h1>
            <p className="text-[9px] text-muted-foreground">{companyVendors.length} vendedores · {activeVendors} activos</p>
          </div>
          <Button size="sm" className="h-7 text-[9px] rounded-full px-3" onClick={() => setShowInvite(true)}>
            <Plus className="w-2.5 h-2.5 mr-1" /> Invitar
          </Button>
        </div>

        {/* Invite banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5">
          <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-[9px] text-muted-foreground flex-1">Comparte el enlace para que nuevos vendedores se unan</p>
          <Button size="sm" variant="outline" className="text-[8px] h-6 gap-1 flex-shrink-0 rounded-full px-2" onClick={copyInviteLink}>
            <Copy className="w-2 h-2" /> Copiar
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="space-y-1.5">
          <div className="relative max-w-xl">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input placeholder="Buscar vendedor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-7 bg-card border-border rounded-lg text-[10px]" />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* Vendors List */}
        {filteredVendors.length > 0 ? (
          <div className="space-y-1.5">
            {filteredVendors.map((vendor, i) => {
              const d = vendor.data;
              const sc = statusConfig[d.status];
              const isTop = i === 0 && d.salesMonth > 0;
              const hasPrivate = d.serviceCommissions.some(s => s.isPrivate);

              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`rounded-lg border bg-card p-2.5 cursor-pointer hover:shadow-sm hover:border-primary/20 transition-all ${isTop ? 'border-amber-300/30' : 'border-border'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isTop ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                      {isTop ? <Star className="w-3 h-3 text-amber-500" fill="currentColor" /> : <span className="text-[8px] font-bold text-primary">{vendor.name.split(' ').map((n: string) => n[0]).join('')}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] font-semibold text-foreground truncate">{vendor.name}</p>
                        <Badge className={`text-[7px] border-0 px-1 py-0 ${sc.cls}`}>
                          <sc.icon className="w-1.5 h-1.5 mr-0.5" />{sc.label}
                        </Badge>
                        {hasPrivate && (
                          <Badge variant="outline" className="text-[7px] px-1 py-0 border-amber-300/50 text-amber-600 gap-0.5">
                            <Lock className="w-1.5 h-1.5" /> Privado
                          </Badge>
                        )}
                      </div>
                      <p className="text-[8px] text-muted-foreground truncate">{vendor.email}</p>
                    </div>

                    {/* Mini metrics */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-foreground">{d.salesMonth}</p>
                        <p className="text-[7px] text-muted-foreground">ventas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-primary">{formatCOP(d.gmv)}</p>
                        <p className="text-[7px] text-muted-foreground">GMV</p>
                      </div>
                    </div>

                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/30 flex-shrink-0" />
                  </div>

                  {/* Commission per service row — smaller, with public/private labels */}
                  {d.serviceCommissions.length > 0 && (
                    <div className="flex gap-1 mt-1.5 ml-9 overflow-x-auto">
                      {d.serviceCommissions.map((sc, j) => (
                        <Badge key={j} variant="outline" className={`text-[7px] px-1 py-0 font-normal whitespace-nowrap ${sc.isPrivate ? 'border-amber-300/40 bg-amber-500/5' : ''}`}>
                          {sc.isPrivate && <Lock className="w-1.5 h-1.5 mr-0.5 text-amber-500" />}
                          {sc.serviceName.slice(0, 12)}{sc.serviceName.length > 12 ? '..' : ''}: <span className={`font-semibold ml-0.5 ${sc.isPrivate ? 'text-amber-600' : 'text-primary'}`}>{sc.pct}%</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-[10px] font-medium">{searchQuery ? 'Sin resultados' : 'Sin vendedores'}</p>
          </div>
        )}
      </div>

      {/* Vendor Detail Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xs">{selectedVendor?.name}</DialogTitle>
            <DialogDescription className="text-[9px]">{selectedVendor?.email}</DialogDescription>
          </DialogHeader>
          {selectedVendor && (() => {
            const d = selectedVendor.data;
            const sc = statusConfig[d.status];
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{selectedVendor.name.split(' ').map((n: string) => n[0]).join('')}</span>
                  </div>
                  <Badge className={`text-[7px] border-0 ${sc.cls}`}><sc.icon className="w-2 h-2 mr-0.5" />{sc.label}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Ventas/mes", value: String(d.salesMonth) },
                    { label: "GMV/mes", value: formatCOP(d.gmv) },
                    { label: "Comision", value: formatCOP(d.commission) },
                    { label: "Productos", value: String(d.servicesCount) },
                    { label: "Entrenam.", value: `${d.completedTrainings}` },
                    { label: "Total ventas", value: String(d.totalSales) },
                  ].map((s, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-1.5 text-center">
                      <p className="text-[10px] font-bold text-foreground">{s.value}</p>
                      <p className="text-[7px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {d.serviceCommissions.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold text-foreground mb-1">Comisiones por producto</p>
                    <div className="space-y-1">
                      {d.serviceCommissions.map((sc: { serviceName: string; pct: number; basePct: number; isPrivate: boolean }, j: number) => (
                        <div key={j} className={`flex items-center justify-between p-1.5 rounded-lg border text-[9px] ${sc.isPrivate ? 'border-amber-300/30 bg-amber-500/5' : 'border-border'}`}>
                          <div className="flex items-center gap-1 truncate">
                            {sc.isPrivate && <Lock className="w-2 h-2 text-amber-500 flex-shrink-0" />}
                            <span className="text-foreground truncate">{sc.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`font-semibold ${sc.isPrivate ? 'text-amber-600' : 'text-primary'}`}>{sc.pct}%</span>
                            {sc.isPrivate && (
                              <Badge variant="outline" className="text-[6px] px-1 py-0 border-amber-300/40 text-amber-500">Privado</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xs">Invitar vendedor</DialogTitle>
            <DialogDescription className="text-[9px]">Comparte este enlace</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="h-7 text-[9px] font-mono" />
              <Button size="sm" variant="outline" className="h-7 text-[9px] gap-1" onClick={copyInviteLink}>
                <Copy className="w-2.5 h-2.5" /> Copiar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
