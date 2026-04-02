import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, ShoppingCart, Package, GraduationCap, TrendingUp,
  Crown, Star, Shield, Users, Eye, EyeOff, CheckCircle2, Clock,
  BookOpen, DollarSign, ChevronRight, Copy
} from "lucide-react";
import {
  sales, services, vendors, commissions, commissionTiers,
  vendorCommissionAssignments, formatCOP, formatDate, CURRENT_COMPANY_ID, companies
} from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
];

const tierIcon = (order: number) => {
  if (order === 3) return <Crown className="w-3 h-3 text-purple-500" />;
  if (order === 2) return <Star className="w-3 h-3 text-amber-500" />;
  return <Shield className="w-3 h-3 text-muted-foreground" />;
};

const tierColor = (order: number) => {
  if (order === 3) return 'border-purple-300/40 bg-purple-500/5 text-purple-700';
  if (order === 2) return 'border-amber-300/40 bg-amber-500/5 text-amber-700';
  return 'border-border bg-muted/30 text-muted-foreground';
};

const saleStatusCls: Record<string, string> = {
  COMPLETED: 'text-emerald-600',
  HELD: 'text-amber-600',
  PENDING: 'text-blue-600',
  REFUNDED: 'text-red-500',
  CANCELLED: 'text-muted-foreground',
};

export default function CompanyVendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { trainingProgress, updateVendorCommissionAssignment } = useDemo();
  const [activeTab, setActiveTab] = useState<'ventas' | 'servicios' | 'capacitacion'>('servicios');

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const vendor = vendors.find(v => v.id === vendorId);
  const vendorIndex = vendors.findIndex(v => v.id === vendorId);
  const avatarUrl = AVATAR_PHOTOS[vendorIndex % AVATAR_PHOTOS.length];

  if (!vendor) {
    return (
      <DashboardLayout role="company" userName={company?.name}>
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Vendedor no encontrado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/company/vendors')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const serviceIds = new Set(companyServices.map(s => s.id));
  const vendorSales = companySales.filter(s => s.vendorId === vendorId);
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthSales = vendorSales.filter(s => new Date(s.createdAt) >= monthAgo);

  const gmv = monthSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
  const totalCommission = commissions
    .filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId))
    .reduce((sum, c) => sum + c.amountCOP, 0);

  const assignments = vendorCommissionAssignments.filter(a => a.vendorId === vendorId && serviceIds.has(a.serviceId));
  const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === vendorId && serviceIds.has(tp.serviceId));

  // Service breakdown
  const vendorServiceIds = new Set([
    ...vendorSales.map(s => s.serviceId),
    ...vendorTrainings.map(tp => tp.serviceId)
  ]);
  
  const serviceBreakdown = Array.from(vendorServiceIds).map(sId => {
    const svc = companyServices.find(s => s.id === sId);
    const assignment = assignments.find(a => a.serviceId === sId);
    const tier = assignment ? commissionTiers.find(t => t.id === assignment.tierId) : null;
    const svcSales = vendorSales.filter(s => s.serviceId === sId);
    const svcGmv = svcSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
    const training = vendorTrainings.find(tp => tp.serviceId === sId);
    const serviceTiers = commissionTiers.filter(t => t.serviceId === sId).sort((a, b) => a.tierOrder - b.tierOrder);
    return {
      serviceId: sId,
      service: svc,
      tier,
      tierName: tier?.name || 'Público',
      tierOrder: tier?.tierOrder || 1,
      isPrivate: tier ? !tier.isPublic : false,
      commissionPct: tier?.commissionPct || svc?.vendorCommissionPct || 0,
      salesCount: svcSales.length,
      gmv: svcGmv,
      trainingStatus: training?.status || 'not_started',
      availableTiers: serviceTiers,
      currentTierId: assignment?.tierId || '',
    };
  });

  // Best tier
  let bestTierOrder = 1;
  assignments.forEach(a => {
    const tier = commissionTiers.find(t => t.id === a.tierId);
    if (tier && tier.tierOrder > bestTierOrder) bestTierOrder = tier.tierOrder;
  });

  const handleTierChange = (serviceId: string, newTierId: string) => {
    if (updateVendorCommissionAssignment) {
      updateVendorCommissionAssignment(vendorId!, serviceId, newTierId);
      toast.success("Nivel de comisión actualizado");
    }
  };

  const allSales = vendorSales
    .map(s => {
      const svc = companyServices.find(sv => sv.id === s.serviceId);
      const assignment = assignments.find(a => a.serviceId === s.serviceId);
      const tier = assignment ? commissionTiers.find(t => t.id === assignment.tierId) : null;
      return {
        ...s,
        serviceName: svc?.name || '',
        tierName: tier?.name || 'Público',
        tierOrder: tier?.tierOrder || 1,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const tabs = [
    { id: 'servicios' as const, label: 'Servicios', icon: Package, count: serviceBreakdown.length },
    { id: 'ventas' as const, label: 'Ventas', icon: TrendingUp, count: vendorSales.length },
    { id: 'capacitacion' as const, label: 'Entrenamiento', icon: GraduationCap, count: vendorTrainings.length },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        <button onClick={() => navigate('/company/vendors')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Mi Red
        </button>

        {/* Vendor Header */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <img
              src={avatarUrl}
              alt={vendor.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{vendor.name}</h1>
                {tierIcon(bestTierOrder)}
              </div>
              <p className="text-[10px] text-muted-foreground">{vendor.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={`text-[9px] border px-2 ${tierColor(bestTierOrder)}`}>
                  {bestTierOrder === 3 ? 'Elite' : bestTierOrder === 2 ? 'Premium' : 'Básico'}
                </Badge>
                <Badge className={`text-[9px] border-0 ${monthSales.length >= 3 ? 'bg-amber-500/10 text-amber-600' : monthSales.length > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                  {monthSales.length >= 3 ? 'Top' : monthSales.length > 0 ? 'Activo' : 'Sin ventas'}
                </Badge>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Ventas/mes', value: String(monthSales.length) },
              { label: 'GMV/mes', value: formatCOP(gmv).replace(' COP', '') },
              { label: 'Comisión total', value: formatCOP(totalCommission).replace(' COP', '') },
              { label: 'Total histórico', value: String(vendorSales.length) },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'servicios' && (
          <div className="space-y-3">
            {serviceBreakdown.length > 0 ? serviceBreakdown.map(sb => (
              <div key={sb.serviceId} className={`rounded-xl border p-4 ${sb.isPrivate ? 'border-amber-300/40 bg-amber-500/[0.02]' : 'border-border bg-card'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {tierIcon(sb.tierOrder)}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{sb.service?.name || sb.serviceId}</p>
                      <p className="text-[10px] text-muted-foreground">{sb.service?.category}</p>
                    </div>
                  </div>
                  {sb.isPrivate && (
                    <Badge className="text-[8px] bg-amber-500/10 text-amber-600 border-0">
                      <EyeOff className="w-2 h-2 mr-0.5" /> Privado
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-xs font-bold">{sb.commissionPct}%</p>
                    <p className="text-[8px] text-muted-foreground">Comisión</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-xs font-bold">{sb.salesCount}</p>
                    <p className="text-[8px] text-muted-foreground">Ventas</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-xs font-bold">{formatCOP(sb.gmv).replace(' COP', '')}</p>
                    <p className="text-[8px] text-muted-foreground">GMV</p>
                  </div>
                </div>

                {/* Training status */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${sb.trainingStatus === 'declared_completed' ? 'bg-emerald-500' : sb.trainingStatus === 'in_progress' ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
                  <span className="text-[10px] text-muted-foreground">
                    {sb.trainingStatus === 'declared_completed' ? 'Capacitado' : sb.trainingStatus === 'in_progress' ? 'En progreso' : 'Sin capacitar'}
                  </span>
                </div>

                {/* Change tier */}
                {sb.availableTiers.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Nivel:</span>
                    <Select value={sb.currentTierId} onValueChange={(v) => handleTierChange(sb.serviceId, v)}>
                      <SelectTrigger className="h-7 text-[10px] w-32">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {sb.availableTiers.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="flex items-center gap-1">
                              {tierIcon(t.tierOrder)}
                              {t.name} ({t.commissionPct}%)
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-10">
                <Package className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin servicios asignados</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="space-y-2">
            {allSales.length > 0 ? allSales.map(sale => (
              <div key={sale.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-foreground truncate">{sale.clientName}</p>
                    {sale.tierOrder > 1 && (
                      <span className={`inline-flex items-center gap-0.5 text-[8px] px-1 rounded ${tierColor(sale.tierOrder)}`}>
                        {tierIcon(sale.tierOrder)} {sale.tierName}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{sale.serviceName} · {formatDate(sale.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{formatCOP(sale.amountCOP || sale.grossAmount)}</p>
                  <p className={`text-[9px] font-medium ${saleStatusCls[sale.status] || ''}`}>{sale.status}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin ventas registradas</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'capacitacion' && (
          <div className="space-y-3">
            {vendorTrainings.length > 0 ? vendorTrainings.map(tp => {
              const svc = companyServices.find(s => s.id === tp.serviceId);
              const isDone = tp.status === 'declared_completed';
              const inProg = tp.status === 'in_progress';
              return (
                <div key={tp.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{svc?.name || tp.serviceId}</p>
                    <Badge className={`text-[9px] border-0 ${isDone ? 'bg-emerald-500/10 text-emerald-600' : inProg ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                      {isDone ? 'Completada' : inProg ? 'En progreso' : 'No iniciada'}
                    </Badge>
                  </div>
                  <Progress value={isDone ? 100 : inProg ? 60 : 0} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {isDone && tp.completedAt ? `Completada el ${formatDate(tp.completedAt)}` : inProg ? `Último acceso: ${formatDate(tp.lastAccessedAt)}` : 'Pendiente'}
                  </p>
                </div>
              );
            }) : (
              <div className="text-center py-10">
                <GraduationCap className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin entrenamientos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
