import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTutorial from "@/components/PageTutorial";
import { StatCard } from "@/components/dashboard/DashboardComponents";
import { 
  DollarSign, ShoppingCart, Package, TrendingUp,
  BookOpen, Plus, Clock, CheckCircle,
  Star, Zap, Users, ArrowRight, Target, Repeat,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, services as allServices, companies, CURRENT_VENDOR_ID, formatCOP, formatDate } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { sales, commissions, trainingProgress, subscriptions, pinnedServices } = useDemo();
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  
  const vendorSales = sales.filter(s => s.vendorId === CURRENT_VENDOR_ID);
  const vendorCommissions = commissions.filter(c => c.vendorId === CURRENT_VENDOR_ID);
  const vendorTrainings = trainingProgress.filter(t => t.vendorId === CURRENT_VENDOR_ID);
  
  const thisMonth = new Date().toISOString().slice(0, 7);
  const commissionsThisMonth = vendorCommissions.filter(c => c.createdAt.startsWith(thisMonth) && c.status !== 'REFUNDED');
  const totalCommissionsThisMonth = commissionsThisMonth.reduce((acc, c) => acc + c.amountCOP, 0);
  const heldCommissions = vendorCommissions.filter(c => c.status === 'HELD').reduce((acc, c) => acc + c.amountCOP, 0);
  const releasedCommissions = vendorCommissions.filter(c => c.status === 'RELEASED').reduce((acc, c) => acc + c.amountCOP, 0);
  
  const completedTrainings = vendorTrainings.filter(t => t.status === 'declared_completed');
  const inProgressTrainings = vendorTrainings.filter(t => t.status === 'in_progress');

  const activeServices = allServices.filter(s => s.status === 'activo');
  const vendorActiveCount = activeServices.filter(service => {
    const training = vendorTrainings.find(t => t.serviceId === service.id);
    return !service.requiresTraining || training?.status === 'declared_completed';
  }).length;

  const salesThisMonth = vendorSales.filter(s => s.createdAt.startsWith(thisMonth));
  const totalSalesCount = vendorSales.length;
  const successfulSales = vendorSales.filter(s => s.status !== 'REFUNDED').length;
  const successRate = totalSalesCount > 0 ? Math.round((successfulSales / totalSalesCount) * 100) : 0;
  const activeSubscriptions = subscriptions.filter(s => s.vendorId === CURRENT_VENDOR_ID && s.status === 'active').length;
  const avgCommission = vendorCommissions.length > 0
    ? vendorCommissions.filter(c => c.status !== 'REFUNDED').reduce((a, c) => a + c.amountCOP, 0) / vendorCommissions.filter(c => c.status !== 'REFUNDED').length
    : 0;

  const lastSale = vendorSales[0];
  const lastSaleService = lastSale ? allServices.find(s => s.id === lastSale.serviceId) : null;

  // Recent sales (last 4)
  const recentSales = vendorSales.slice(0, 4).map(sale => {
    const svc = allServices.find(s => s.id === sale.serviceId);
    return { ...sale, serviceName: svc?.name || '' };
  });

  // Weekly commissions chart
  const today = new Date();
  const weeklyCommissions = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekComms = vendorCommissions.filter(c => {
      const d = new Date(c.createdAt);
      return d >= weekStart && d < weekEnd && c.status !== 'REFUNDED';
    });
    return {
      week: `S${i + 1}`,
      comisiones: weekComms.reduce((a, c) => a + c.amountCOP, 0)
    };
  });

  // Recommended services
  const vendorServiceIds = new Set(vendorTrainings.map(t => t.serviceId));
  const recommendedServices = activeServices
    .filter(s => !vendorServiceIds.has(s.id) && s.requiresTraining)
    .sort((a, b) => (b.activeSubscriptions || 0) - (a.activeSubscriptions || 0))
    .slice(0, 4);

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "bg-[#FEF3E2] text-[#F59E0B]", label: "Retenida" },
      'RELEASED': { cls: "bg-[#E8FAF3] text-[#00B87A]", label: "Liberada" },
      'REFUNDED': { cls: "bg-[#FDE8EC] text-[#E5294A]", label: "Devuelta" },
    };
    return map[status] || { cls: "bg-muted text-muted-foreground", label: status };
  };

  const pills = [
    { label: "Ventas", path: "/vendor/sales", icon: ShoppingCart },
    { label: "Comisiones", path: "/vendor/payments", icon: DollarSign },
    { label: "Servicios", path: "/vendor/services", icon: Package },
    { label: "Capacitaciones", path: "/vendor/trainings", icon: BookOpen },
  ];

  return (
    <DashboardLayout role="vendor" userName={vendor?.name}>
      <div className="space-y-4 sm:space-y-6">
        <PageTutorial
          pageId="vendor-dashboard"
          title="¡Bienvenido a tu Dashboard!"
          description="Aquí ves un resumen de tu actividad, servicios activos y comisiones."
          steps={[
            "Revisa tus comisiones del mes en la parte superior",
            "Consulta tu actividad reciente y KPIs",
            "Accede rápidamente a vender un servicio"
          ]}
        />

        {/* ── HERO: Balance principal ── */}
        <div className="rounded-2xl bg-[#F4F0FA] p-4 sm:p-6 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Hola, {vendor?.name.split(' ')[0]} 👋</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Comisiones del mes</p>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight mt-1" style={{ color: 'hsl(var(--primary))' }}>
                {formatCOP(totalCommissionsThisMonth)}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F59E0B]" />
                  {formatCOP(heldCommissions)} retenidas
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#00B87A]" />
                  {formatCOP(releasedCommissions)} liberadas
                </span>
              </div>
            </div>
            <Link to="/vendor/services">
              <Button size="icon" className="rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ── PILLS de navegación ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {pills.map(pill => (
            <Link
              key={pill.path}
              to={pill.path}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card border border-border text-xs sm:text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all whitespace-nowrap flex-shrink-0"
            >
              <pill.icon className="w-3.5 h-3.5" />
              {pill.label}
            </Link>
          ))}
        </div>

        {/* ── GRÁFICA: Comisiones semanales ── */}
        <div className="card-premium p-3 sm:p-5">
          <h3 className="font-semibold text-xs sm:text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Comisiones por semana
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyCommissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} 
                formatter={(value: number) => [formatCOP(value), 'Comisión']} 
              />
              <Bar dataKey="comisiones" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── ACTIVIDAD RECIENTE ── */}
        <div className="card-premium p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-xs sm:text-sm">Actividad reciente</h3>
            <Link to="/vendor/sales" className="text-[10px] sm:text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentSales.length > 0 ? recentSales.map(sale => {
              const sc = getStatusConfig(sale.status);
              return (
                <div key={sale.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{sale.clientName.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{sale.clientName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{sale.serviceName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold">{formatCOP(sale.amountCOP || sale.grossAmount)}</span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Sin ventas recientes</p>
            )}
          </div>
        </div>

        {/* ── KPIs 2x2 compactos ── */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StatCard
            title="Ventas del mes"
            value={salesThisMonth.length}
            icon={ShoppingCart}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Tasa de éxito"
            value={`${successRate}%`}
            icon={Target}
            variant={successRate >= 80 ? 'success' : 'warning'}
          />
          <StatCard
            title="Suscripciones"
            value={activeSubscriptions}
            icon={Repeat}
          />
          <StatCard
            title="Comisión prom."
            value={formatCOP(avgCommission)}
            icon={TrendingUp}
          />
        </div>

        {/* ── SERVICIOS RECOMENDADOS ── */}
        {recommendedServices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F59E0B]" />
                Recomendados para ti
              </h2>
              <Link to="/vendor/services" className="text-[10px] sm:text-xs text-primary hover:underline">Ver todos</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {recommendedServices.map(service => {
                const company = companies.find(c => c.id === service.companyId);
                return (
                  <div 
                    key={service.id}
                    className="card-premium p-3 hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => navigate('/vendor/services')}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1.5 py-0">{service.category}</Badge>
                    </div>
                    <h4 className="font-semibold text-[11px] sm:text-sm group-hover:text-primary transition-colors truncate">{service.name}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{company?.name}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/50">
                      <span className="text-[9px] sm:text-xs text-muted-foreground">{formatCOP(service.priceCOP)}</span>
                      <span className="text-[9px] sm:text-xs font-semibold text-[#00B87A]">{service.vendorCommissionPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CAPACITACIONES compacto ── */}
        <div className="card-premium p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Capacitaciones
            </h3>
            <Link to="/vendor/trainings" className="text-[10px] sm:text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00B87A]" />
              <span className="text-muted-foreground text-[10px] sm:text-xs">{completedTrainings.length} completadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#5B6FE0]" />
              <span className="text-muted-foreground text-[10px] sm:text-xs">{inProgressTrainings.length} en progreso</span>
            </div>
          </div>
          {inProgressTrainings.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              {inProgressTrainings.slice(0, 2).map(t => {
                const svc = allServices.find(s => s.id === t.serviceId);
                return (
                  <Link key={t.id} to={`/vendor/trainings/${t.id}`} className="flex items-center justify-between py-1.5 text-xs hover:text-primary transition-colors">
                    <span className="truncate text-[11px] sm:text-sm">{svc?.name}</span>
                    <Badge className="bg-[#EEF0FC] text-[#5B6FE0] text-[9px] sm:text-xs">En progreso</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
