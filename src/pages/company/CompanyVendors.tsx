import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Plus, Copy, Users, Search,
  Star, BookOpen, CheckCircle2, Clock,
  Crown, Shield, Lock, X,
  TrendingUp, Package, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  sales, services, vendors, commissions, commissionTiers,
  vendorCommissionAssignments, formatCOP, CURRENT_COMPANY_ID, companies
} from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

// Deterministic avatar photos from UI Faces
const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face",
];

function getAvatar(index: number) {
  return AVATAR_PHOTOS[index % AVATAR_PHOTOS.length];
}

const tierIcon = (order: number) => {
  if (order === 3) return <Crown className="w-2.5 h-2.5 text-purple-500" />;
  if (order === 2) return <Star className="w-2.5 h-2.5 text-amber-500" />;
  return <Shield className="w-2.5 h-2.5 text-muted-foreground" />;
};

const tierColor = (order: number) => {
  if (order === 3) return 'border-purple-300/40 bg-purple-500/5 text-purple-700';
  if (order === 2) return 'border-amber-300/40 bg-amber-500/5 text-amber-700';
  return 'border-border bg-muted/30 text-muted-foreground';
};

export default function CompanyVendors() {
  const { trainingProgress } = useDemo();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalTab, setModalTab] = useState<'ventas' | 'servicios' | 'capacitacion'>('ventas');
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
    const gmv = monthSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
    const vc = commissions.filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId));
    const totalCommission = vc.reduce((sum, c) => sum + c.amountCOP, 0);
    const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === vendorId && serviceIds.has(tp.serviceId));
    const completedTrainings = vendorTrainings.filter(tp => tp.status === 'declared_completed').length;
    const totalTrainings = vendorTrainings.length;
    const vendorServiceIds = new Set(vs.map(s => s.serviceId));

    // Get tier assignments for this vendor
    const assignments = vendorCommissionAssignments.filter(
      a => a.vendorId === vendorId && serviceIds.has(a.serviceId)
    );

    // Best tier (highest order)
    let bestTierOrder = 1;
    let bestTierName = 'Básico';
    assignments.forEach(a => {
      const tier = commissionTiers.find(t => t.id === a.tierId);
      if (tier && tier.tierOrder > bestTierOrder) {
        bestTierOrder = tier.tierOrder;
        bestTierName = tier.name;
      }
    });

    // Service-level breakdown with tier info
    const serviceBreakdown = Array.from(vendorServiceIds).map(sId => {
      const svc = companyServices.find(s => s.id === sId);
      const assignment = assignments.find(a => a.serviceId === sId);
      const tier = assignment ? commissionTiers.find(t => t.id === assignment.tierId) : null;
      const svcSales = vs.filter(s => s.serviceId === sId);
      const svcGmv = svcSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
      return {
        serviceId: sId,
        serviceName: svc?.name || '',
        tierName: tier?.name || 'Público',
        tierOrder: tier?.tierOrder || 1,
        isPrivate: tier ? !tier.isPublic : false,
        commissionPct: tier?.commissionPct || svc?.vendorCommissionPct || 0,
        salesCount: svcSales.length,
        gmv: svcGmv,
      };
    });

    // Training breakdown
    const trainingBreakdown = vendorTrainings.map(tp => {
      const svc = companyServices.find(s => s.id === tp.serviceId);
      return {
        serviceName: svc?.name || '',
        status: tp.status,
        progress: tp.status === 'declared_completed' ? 100 : tp.status === 'in_progress' ? 60 : 0,
      };
    });

    // All individual sales for modal
    const allSales = vs.map(s => {
      const svc = companyServices.find(sv => sv.id === s.serviceId);
      const assignment = assignments.find(a => a.serviceId === s.serviceId);
      const tier = assignment ? commissionTiers.find(t => t.id === assignment.tierId) : null;
      return {
        id: s.id,
        clientName: s.clientName,
        serviceName: svc?.name || '',
        amount: s.amountCOP || s.grossAmount,
        commission: s.sellerCommissionAmount,
        status: s.status,
        tierName: tier?.name || 'Público',
        tierOrder: tier?.tierOrder || 1,
        date: s.createdAt,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let status: 'top' | 'activo' | 'capacitandose' | 'inactivo' = 'inactivo';
    if (monthSales.length >= 3) status = 'top';
    else if (monthSales.length > 0) status = 'activo';
    else if (totalTrainings > 0) status = 'capacitandose';

    return {
      salesMonth: monthSales.length, totalSales: vs.length, gmv,
      commission: totalCommission, completedTrainings, totalTrainings,
      servicesCount: vendorServiceIds.size, status,
      bestTierOrder, bestTierName,
      serviceBreakdown, trainingBreakdown, allSales,
    };
  };

  const vendorsWithData = companyVendors.map((v, i) => ({
    ...v, avatarUrl: getAvatar(i), data: getVendorData(v.id)
  })).sort((a, b) => b.data.salesMonth - a.data.salesMonth);

  const filteredVendors = vendorsWithData.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  const saleStatusCls: Record<string, string> = {
    COMPLETED: 'text-emerald-600',
    HELD: 'text-amber-600',
    PENDING: 'text-blue-600',
    REFUNDED: 'text-red-500',
    CANCELLED: 'text-muted-foreground',
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
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">Mi Red</h1>
            <p className="text-[9px] text-muted-foreground">{companyVendors.length} vendedores · {activeVendors} activos este mes</p>
          </div>
          <Button size="sm" className="h-7 text-[9px] rounded-full px-3" onClick={() => setShowInvite(true)}>
            <Plus className="w-2.5 h-2.5 mr-1" /> Invitar
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="space-y-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input placeholder="Buscar vendedor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-7 bg-card border-border rounded-lg text-[10px]" />
          </div>
          <div className="flex gap-1">
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* Grid Cards */}
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredVendors.map((vendor) => {
              const d = vendor.data;
              const sc = statusConfig[d.status];

              return (
                <div
                  key={vendor.id}
                  onClick={() => { setModalTab("ventas"); setSelectedVendor(vendor); }}
                  className={`rounded-2xl border bg-card p-3 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group ${d.bestTierOrder === 3 ? 'border-purple-200/50' : d.bestTierOrder === 2 ? 'border-amber-200/50' : 'border-border'}`}
                >
                  {/* Avatar + Tier badge */}
                  <div className="flex flex-col items-center text-center mb-2.5">
                    <div className="relative mb-2">
                      <img
                        src={vendor.avatarUrl}
                        alt={vendor.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
                      />
                      {/* Tier indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card ${d.bestTierOrder === 3 ? 'bg-purple-500/10' : d.bestTierOrder === 2 ? 'bg-amber-500/10' : 'bg-muted'}`}>
                        {tierIcon(d.bestTierOrder)}
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground leading-tight truncate w-full">{vendor.name.split(' ')[0]}</p>
                    <p className="text-[8px] text-muted-foreground truncate w-full">{vendor.name.split(' ').slice(1).join(' ')}</p>
                  </div>

                  {/* Status + Tier */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Badge className={`text-[7px] border-0 px-1.5 py-0 ${sc.cls}`}>
                      {sc.label}
                    </Badge>
                    {d.bestTierOrder > 1 && (
                      <Badge className={`text-[7px] border px-1.5 py-0 ${tierColor(d.bestTierOrder)}`}>
                        {d.bestTierName}
                      </Badge>
                    )}
                  </div>

                  {/* Mini metrics */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-muted/40 p-1.5 text-center">
                      <p className="text-[11px] font-bold text-foreground">{d.salesMonth}</p>
                      <p className="text-[7px] text-muted-foreground">ventas</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-1.5 text-center">
                      <p className="text-[11px] font-bold text-primary">{formatCOP(d.gmv).replace(' COP', '')}</p>
                      <p className="text-[7px] text-muted-foreground">GMV</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-[10px] font-medium text-muted-foreground">{searchQuery ? 'Sin resultados' : 'Sin vendedores en tu red'}</p>
          </div>
        )}
      </div>

      {/* ====== VENDOR DETAIL MODAL ====== */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => { if (!open) setSelectedVendor(null); }}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-border">
          {selectedVendor && (() => {
            const d = selectedVendor.data;
            const sc = statusConfig[d.status];

            return (
              <>
                {/* Header */}
                <div className="p-4 pb-3 border-b border-border">
                  <div className="flex items-start gap-3">
                    <img
                      src={selectedVendor.avatarUrl}
                      alt={selectedVendor.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground truncate">{selectedVendor.name}</h3>
                        {tierIcon(d.bestTierOrder)}
                      </div>
                      <p className="text-[9px] text-muted-foreground">{selectedVendor.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className={`text-[7px] border-0 px-1.5 py-0 ${sc.cls}`}>{sc.label}</Badge>
                        {d.bestTierOrder > 1 && (
                          <Badge className={`text-[7px] border px-1.5 py-0 ${tierColor(d.bestTierOrder)}`}>
                            {d.bestTierName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3">
                    {[
                      { label: "Ventas/mes", value: String(d.salesMonth) },
                      { label: "GMV/mes", value: formatCOP(d.gmv).replace(' COP', '') },
                      { label: "Comision", value: formatCOP(d.commission).replace(' COP', '') },
                      { label: "Total", value: String(d.totalSales) },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl bg-muted/40 p-2 text-center">
                        <p className="text-[11px] font-bold text-foreground">{s.value}</p>
                        <p className="text-[7px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                  {[
                    { id: 'ventas' as const, label: 'Ventas', icon: TrendingUp, count: d.totalSales },
                    { id: 'servicios' as const, label: 'Servicios', icon: Package, count: d.servicesCount },
                    { id: 'capacitacion' as const, label: 'Capacitacion', icon: GraduationCap, count: d.totalTrainings },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setModalTab(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-medium transition-colors border-b-2 ${modalTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      <t.icon className="w-3 h-3" />
                      {t.label} ({t.count})
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-3 max-h-[280px] overflow-y-auto">
                  {modalTab === 'ventas' && (
                    <div className="space-y-1.5">
                      {d.allSales.length > 0 ? d.allSales.map((sale: any) => (
                        <div key={sale.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-[10px] font-medium text-foreground truncate">{sale.clientName}</p>
                              <Badge className={`text-[6px] border px-1 py-0 ${tierColor(sale.tierOrder)}`}>
                                {sale.tierName}
                              </Badge>
                            </div>
                            <p className="text-[8px] text-muted-foreground truncate">{sale.serviceName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] font-bold text-foreground">{formatCOP(sale.amount).replace(' COP', '')}</p>
                            <p className={`text-[7px] font-medium ${saleStatusCls[sale.status] || 'text-muted-foreground'}`}>
                              {sale.status === 'COMPLETED' ? 'Completada' : sale.status === 'HELD' ? 'Retenida' : sale.status === 'PENDING' ? 'Pendiente' : sale.status === 'REFUNDED' ? 'Devuelta' : 'Cancelada'}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-[9px] text-muted-foreground text-center py-4">Sin ventas registradas</p>
                      )}
                    </div>
                  )}

                  {modalTab === 'servicios' && (
                    <div className="space-y-1.5">
                      {d.serviceBreakdown.length > 0 ? d.serviceBreakdown.map((svc: any, i: number) => (
                        <div key={i} className={`p-2.5 rounded-xl border ${svc.isPrivate ? 'border-amber-200/50 bg-amber-500/5' : 'border-border bg-muted/20'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {svc.isPrivate && <Lock className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />}
                              <p className="text-[10px] font-medium text-foreground truncate">{svc.serviceName}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {tierIcon(svc.tierOrder)}
                              <Badge className={`text-[7px] border px-1.5 py-0 ${tierColor(svc.tierOrder)}`}>
                                {svc.tierName} · {svc.commissionPct}%
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
                            <span>{svc.salesCount} ventas</span>
                            <span>{formatCOP(svc.gmv).replace(' COP', '')} GMV</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-[9px] text-muted-foreground text-center py-4">Sin servicios asignados</p>
                      )}
                    </div>
                  )}

                  {modalTab === 'capacitacion' && (
                    <div className="space-y-1.5">
                      {d.trainingBreakdown.length > 0 ? d.trainingBreakdown.map((tr: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl border border-border bg-muted/20">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-medium text-foreground truncate">{tr.serviceName}</p>
                            <Badge className={`text-[7px] border-0 px-1.5 py-0 ${tr.status === 'declared_completed' ? 'bg-emerald-500/10 text-emerald-600' : tr.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
                              {tr.status === 'declared_completed' ? 'Completada' : tr.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                            </Badge>
                          </div>
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${tr.status === 'declared_completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${tr.progress}%` }}
                            />
                          </div>
                        </div>
                      )) : (
                        <p className="text-[9px] text-muted-foreground text-center py-4">Sin capacitaciones asignadas</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-foreground">Invitar vendedor</h3>
              <p className="text-[9px] text-muted-foreground">Comparte este enlace para que se unan a tu red</p>
            </div>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="h-7 text-[9px] font-mono rounded-lg" />
              <Button size="sm" variant="outline" className="h-7 text-[9px] gap-1 rounded-lg flex-shrink-0" onClick={copyInviteLink}>
                <Copy className="w-2.5 h-2.5" /> Copiar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
