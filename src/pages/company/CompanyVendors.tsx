import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Plus, Copy, Users, TrendingUp, DollarSign, ShoppingCart, Search,
  Star, Award, BookOpen, CheckCircle2, Clock, UserCheck, ChevronRight,
  ArrowUpRight, BarChart3, RefreshCw, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sales, services, vendors, commissions, trainingProgress as allTraining, formatCOP, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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
  
  // Also include vendors who have training progress for company services
  const serviceIds = new Set(companyServices.map(s => s.id));
  trainingProgress.filter(tp => serviceIds.has(tp.serviceId)).forEach(tp => vendorIds.add(tp.vendorId));
  
  const companyVendors = vendors.filter(v => vendorIds.has(v.id));
  const inviteLink = `https://app.mensualista.com/join/${company?.id || 'demo'}`;
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const getVendorData = (vendorId: string) => {
    const vs = companySales.filter(s => s.vendorId === vendorId);
    const monthSales = vs.filter(s => new Date(s.createdAt) >= monthAgo);
    const gmv = monthSales.reduce((sum, s) => sum + s.amountCOP, 0);
    const totalGmv = vs.reduce((sum, s) => sum + s.amountCOP, 0);
    const vc = commissions.filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId));
    const totalCommission = vc.reduce((sum, c) => sum + c.amountCOP, 0);
    const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === vendorId && serviceIds.has(tp.serviceId));
    const completedTrainings = vendorTrainings.filter(tp => tp.status === 'declared_completed').length;
    const inProgressTrainings = vendorTrainings.filter(tp => tp.status === 'in_progress').length;
    const activeSubs = vs.filter(s => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length;
    
    // Services this vendor sells
    const vendorServiceIds = new Set(vs.map(s => s.serviceId));
    const servicesCount = vendorServiceIds.size;

    // Status
    let status: 'top' | 'activo' | 'capacitandose' | 'inactivo' = 'inactivo';
    if (monthSales.length >= 3) status = 'top';
    else if (monthSales.length > 0) status = 'activo';
    else if (inProgressTrainings > 0 || completedTrainings > 0) status = 'capacitandose';

    return {
      salesMonth: monthSales.length, totalSales: vs.length, gmv, totalGmv,
      commission: totalCommission, completedTrainings, inProgressTrainings,
      totalTrainings: vendorTrainings.length, activeSubs, servicesCount, status,
    };
  };

  const vendorsWithData = companyVendors.map(v => ({
    ...v, data: getVendorData(v.id),
  })).sort((a, b) => b.data.salesMonth - a.data.salesMonth);

  const filteredVendors = vendorsWithData.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'todos') return true;
    if (filter === 'activos') return v.data.status === 'top' || v.data.status === 'activo';
    if (filter === 'capacitandose') return v.data.status === 'capacitandose';
    if (filter === 'inactivos') return v.data.status === 'inactivo';
    return true;
  });

  // Global stats
  const totalGmvMonth = vendorsWithData.reduce((s, v) => s + v.data.gmv, 0);
  const totalSalesMonth = vendorsWithData.reduce((s, v) => s + v.data.salesMonth, 0);
  const activeVendors = vendorsWithData.filter(v => v.data.salesMonth > 0).length;

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    top: { label: 'Top Seller', cls: 'bg-amber-500/10 text-amber-600', icon: Star },
    activo: { label: 'Activo', cls: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
    capacitandose: { label: 'Capacitándose', cls: 'bg-blue-500/10 text-blue-600', icon: BookOpen },
    inactivo: { label: 'Inactivo', cls: 'bg-muted text-muted-foreground', icon: Clock },
  };

  const filters = [
    { id: 'todos', label: 'Todos', count: vendorsWithData.length },
    { id: 'activos', label: 'Activos', count: vendorsWithData.filter(v => v.data.status === 'top' || v.data.status === 'activo').length },
    { id: 'capacitandose', label: 'Capacitándose', count: vendorsWithData.filter(v => v.data.status === 'capacitandose').length },
    { id: 'inactivos', label: 'Inactivos', count: vendorsWithData.filter(v => v.data.status === 'inactivo').length },
  ];

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Enlace copiado");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">Red de Vendedores</h1>
            <p className="text-[11px] sm:text-sm text-muted-foreground">
              {companyVendors.length} vendedores · {activeVendors} activos este mes
            </p>
          </div>
          <Button size="sm" className="h-9 text-xs" onClick={() => setShowInvite(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Invitar vendedor
          </Button>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border text-center bg-primary/5 border-primary/20">
            <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{formatCOP(totalGmvMonth)}</p>
            <p className="text-[10px] text-muted-foreground">GMV red / mes</p>
          </div>
          <div className="p-3 rounded-xl border text-center">
            <ShoppingCart className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{totalSalesMonth}</p>
            <p className="text-[10px] text-muted-foreground">Ventas / mes</p>
          </div>
          <div className="p-3 rounded-xl border text-center">
            <UserCheck className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{activeVendors}</p>
            <p className="text-[10px] text-muted-foreground">Vendiendo</p>
          </div>
          <div className="p-3 rounded-xl border text-center">
            <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{companyVendors.length}</p>
            <p className="text-[10px] text-muted-foreground">Total red</p>
          </div>
        </div>

        {/* Invite banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Users className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Crece tu red de vendedores</p>
            <p className="text-[11px] text-muted-foreground">Comparte el enlace para que nuevos vendedores se unan a tu marca.</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs gap-1 flex-shrink-0" onClick={copyInviteLink}>
            <Copy className="w-3 h-3" /> Copiar enlace
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar vendedor..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 sm:h-11 bg-card border-border rounded-xl text-xs sm:text-sm" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* Vendors List */}
        {filteredVendors.length > 0 ? (
          <div className="space-y-3">
            {filteredVendors.map((vendor, i) => {
              const d = vendor.data;
              const sc = statusConfig[d.status];
              const isTop = i === 0 && d.salesMonth > 0;

              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`rounded-xl border bg-card p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                    isTop ? 'border-amber-300/50 bg-amber-50/30' : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isTop ? 'bg-amber-500/10' : 'bg-primary/10'
                    }`}>
                      {isTop ? (
                        <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{vendor.name.split(' ').map(n => n[0]).join('')}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{vendor.name}</p>
                        <Badge className={`text-[9px] border-0 ${sc.cls}`}>
                          <sc.icon className="w-2.5 h-2.5 mr-0.5" />
                          {sc.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{vendor.email}</p>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-base font-bold text-foreground">{d.salesMonth}</p>
                          <p className="text-[9px] text-muted-foreground">Ventas / mes</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-primary">{formatCOP(d.gmv)}</p>
                          <p className="text-[9px] text-muted-foreground">GMV / mes</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{d.servicesCount}</p>
                          <p className="text-[9px] text-muted-foreground">Servicios</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{d.completedTrainings}/{companyServices.length}</p>
                          <p className="text-[9px] text-muted-foreground">Capacitaciones</p>
                        </div>
                      </div>

                      {/* Progress bar: training completion */}
                      {companyServices.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-muted-foreground">Progreso de capacitación</span>
                            <span className="text-[9px] font-medium text-muted-foreground">
                              {Math.round((d.completedTrainings / companyServices.length) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all"
                              style={{ width: `${(d.completedTrainings / companyServices.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-1 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">{searchQuery ? 'Sin resultados' : 'Sin vendedores'}</p>
            <p className="text-xs text-muted-foreground">{searchQuery ? 'Prueba otra búsqueda' : 'Invita al primer vendedor para empezar'}</p>
          </div>
        )}
      </div>

      {/* Vendor Detail Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Detalle del vendedor</DialogTitle>
            <DialogDescription className="text-xs">{selectedVendor?.email}</DialogDescription>
          </DialogHeader>
          {selectedVendor && (() => {
            const d = selectedVendor.data;
            const sc = statusConfig[d.status];
            return (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{selectedVendor.name.split(' ').map((n: string) => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{selectedVendor.name}</p>
                    <Badge className={`text-[9px] border-0 ${sc.cls}`}><sc.icon className="w-2.5 h-2.5 mr-0.5" />{sc.label}</Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: ShoppingCart, label: "Ventas / mes", value: String(d.salesMonth) },
                    { icon: DollarSign, label: "GMV / mes", value: formatCOP(d.gmv) },
                    { icon: TrendingUp, label: "Comisión total", value: formatCOP(d.commission) },
                    { icon: Package, label: "Total ventas", value: String(d.totalSales) },
                    { icon: BookOpen, label: "Capacitaciones", value: `${d.completedTrainings} completadas` },
                    { icon: RefreshCw, label: "Suscripciones", value: String(d.activeSubs) },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Service breakdown */}
                <section>
                  <h3 className="text-xs font-semibold mb-2">Servicios vendidos</h3>
                  <div className="space-y-1">
                    {companyServices.map(svc => {
                      const svcSales = companySales.filter(s => s.vendorId === selectedVendor.id && s.serviceId === svc.id);
                      const training = trainingProgress.find(tp => tp.vendorId === selectedVendor.id && tp.serviceId === svc.id);
                      const isCompleted = training?.status === 'declared_completed';
                      if (svcSales.length === 0 && !training) return null;
                      return (
                        <div key={svc.id} className="flex items-center justify-between p-2.5 rounded-lg border text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="truncate text-foreground">{svc.name}</span>
                          </div>
                          <span className="text-muted-foreground flex-shrink-0">{svcSales.length} ventas</span>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                </section>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Invitar vendedor</DialogTitle>
            <DialogDescription className="text-xs">Comparte el enlace o envía una invitación por email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Enlace de invitación</Label>
              <div className="flex gap-2 mt-1">
                <Input value={inviteLink} readOnly className="h-8 text-xs font-mono" />
                <Button size="sm" variant="outline" className="h-8" onClick={copyInviteLink}><Copy className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">O invita por email</Label>
              <Input placeholder="vendedor@email.com" className="h-8 text-sm mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs" onClick={() => { setShowInvite(false); toast.success("Invitación enviada"); }}>
              Enviar invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
