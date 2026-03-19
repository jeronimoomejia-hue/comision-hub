import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTutorial from "@/components/PageTutorial";
import { StatCard } from "@/components/dashboard/DashboardComponents";
import { 
  DollarSign, ShoppingCart, Package, TrendingUp,
  BookOpen, Plus, Clock, CheckCircle,
  Zap, Users, Target, Repeat,
  BarChart3, Crown, Building2, Tag, MessageCircle, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, services as allServices, companies, CURRENT_VENDOR_ID, CURRENT_COMPANY_ID, formatCOP, CompanyPlan } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType }> = {
  freemium: { label: "Freemium", icon: Zap },
  premium: { label: "Premium", icon: Crown },
  enterprise: { label: "Enterprise", icon: Building2 },
};

const allPlans: CompanyPlan[] = ['freemium', 'premium', 'enterprise'];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { sales, commissions, trainingProgress, subscriptions, currentCompanyPlan, setCurrentCompanyPlan, currentCompanyId } = useDemo();
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  
  const company = companies.find(c => c.id === currentCompanyId);
  const companyPlan = currentCompanyPlan;
  const pc = planConfig[companyPlan];
  
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

  const salesThisMonth = vendorSales.filter(s => s.createdAt.startsWith(thisMonth));
  const successfulSales = vendorSales.filter(s => s.status !== 'REFUNDED').length;
  const successRate = vendorSales.length > 0 ? Math.round((successfulSales / vendorSales.length) * 100) : 0;
  const activeSubscriptions = subscriptions.filter(s => s.vendorId === CURRENT_VENDOR_ID && s.status === 'active').length;
  const avgCommission = vendorCommissions.filter(c => c.status !== 'REFUNDED').length > 0
    ? vendorCommissions.filter(c => c.status !== 'REFUNDED').reduce((a, c) => a + c.amountCOP, 0) / vendorCommissions.filter(c => c.status !== 'REFUNDED').length
    : 0;

  const recentSales = vendorSales.slice(0, 4).map(sale => {
    const svc = allServices.find(s => s.id === sale.serviceId);
    return { ...sale, serviceName: svc?.name || '' };
  });

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
    return { week: `S${i + 1}`, comisiones: weekComms.reduce((a, c) => a + c.amountCOP, 0) };
  });

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "bg-amber-50 text-amber-600", label: "Retenida" },
      'RELEASED': { cls: "bg-emerald-50 text-emerald-600", label: "Liberada" },
      'REFUNDED': { cls: "bg-red-50 text-red-600", label: "Devuelta" },
    };
    return map[status] || { cls: "bg-muted text-muted-foreground", label: status };
  };

  return (
    <DashboardLayout role="vendor" userName={vendor?.name}>
      <div className="space-y-4 sm:space-y-6">
        <PageTutorial
          pageId="vendor-dashboard"
          title="¡Bienvenido a tu panel de vendedor!"
          description={`Panel de ventas de ${company?.name || 'la empresa'}`}
          steps={[
            "Revisa tus comisiones del mes en la parte superior",
            "Accede a los gigs de tu empresa para vender",
            "Consulta tu actividad y capacitaciones pendientes"
          ]}
        />

        {/* DEMO Plan Switcher */}
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">🔀 Demo: Plan de la empresa</p>
          <div className="flex gap-2">
            {allPlans.map(p => {
              const cfg = planConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => setCurrentCompanyPlan(p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    companyPlan === p
                      ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                      : 'bg-card border border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* HERO */}
        <div className="rounded-2xl bg-primary/5 p-4 sm:p-6 relative overflow-hidden border border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs sm:text-sm font-medium text-foreground">{company?.name}</p>
                <Badge variant="outline" className="text-[9px] gap-1">
                  <pc.icon className="w-3 h-3" />
                  {pc.label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Hola, {vendor?.name.split(' ')[0]} 👋</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Comisiones del mes</p>
              <p className="text-2xl sm:text-4xl font-bold tracking-tight mt-1" style={{ color: 'hsl(var(--primary))' }}>
                {formatCOP(totalCommissionsThisMonth)}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {formatCOP(heldCommissions)} retenidas
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {formatCOP(releasedCommissions)} liberadas
                </span>
              </div>
            </div>
            <Link to="/vendor/gigs">
              <Button size="icon" className="rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick nav pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {[
            { label: "Ventas", path: "/vendor/sales", icon: ShoppingCart },
            { label: "Pagos", path: "/vendor/payments", icon: DollarSign },
            { label: "Gigs", path: "/vendor/gigs", icon: Package },
            { label: "Capacitaciones", path: "/vendor/trainings", icon: BookOpen },
            ...(companyPlan !== 'freemium' ? [{ label: "Chat", path: "/vendor/support", icon: MessageCircle }] : []),
          ].map(pill => (
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

        {/* Chart */}
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

        {/* Recent activity */}
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

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StatCard title="Ventas del mes" value={salesThisMonth.length} icon={ShoppingCart} trend={{ value: 12, isPositive: true }} />
          <StatCard title="Tasa de éxito" value={`${successRate}%`} icon={Target} variant={successRate >= 80 ? 'success' : 'warning'} />
          <StatCard title="Suscripciones" value={activeSubscriptions} icon={Repeat} />
          <StatCard title="Comisión prom." value={formatCOP(avgCommission)} icon={TrendingUp} />
        </div>

        {/* Plan-dependent features */}
        {companyPlan !== 'freemium' ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="card-premium p-3 text-center">
              <Tag className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">Cupones disponibles</p>
              <p className="text-[10px] text-muted-foreground">Usa cupones al registrar ventas</p>
            </div>
            <Link to="/vendor/support">
              <div className="card-premium p-3 text-center hover:border-primary/30 transition-colors">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Chat con {company?.name}</p>
                <p className="text-[10px] text-muted-foreground">Resuelve dudas directo</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="card-premium p-3 text-center opacity-40 cursor-not-allowed">
              <Lock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Cupones</p>
              <p className="text-[10px] text-muted-foreground">No disponible en este plan</p>
            </div>
            <div className="card-premium p-3 text-center opacity-40 cursor-not-allowed">
              <Lock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Chat</p>
              <p className="text-[10px] text-muted-foreground">No disponible en este plan</p>
            </div>
          </div>
        )}

        {companyPlan === 'enterprise' && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Panel Enterprise
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Códigos de activación automáticos · Plataforma con marca blanca de {company?.name}
            </p>
          </div>
        )}

        {/* Trainings */}
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
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground text-[10px] sm:text-xs">{completedTrainings.length} completadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
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
                    <Badge variant="secondary" className="text-[9px] sm:text-xs">En progreso</Badge>
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
