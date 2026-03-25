import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  DollarSign, ShoppingCart, TrendingUp, Users, Crown, Zap, Building2, 
  Tag, MessageCircle, Globe, Code, ArrowRight, Lock, Settings, CheckCircle,
  Package, BookOpen, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { 
  companies, vendors, CURRENT_COMPANY_ID, formatCOP, CompanyPlan
} from "@/data/mockData";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType; price: string }> = {
  freemium: { label: "Freemium", icon: Zap, price: "Gratis" },
  premium: { label: "Premium", icon: Crown, price: "€100/mes" },
  enterprise: { label: "Enterprise", icon: Building2, price: "€300/mes" },
};

const allPlans: CompanyPlan[] = ['freemium', 'premium', 'enterprise'];

export default function CompanyDashboard() {
  const { sales, services, currentCompanyPlan, setCurrentCompanyPlan } = useDemo();
  
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const plan = currentCompanyPlan;
  const pc = planConfig[plan];
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  
  const thisMonth = new Date().toISOString().slice(0, 7);
  const salesThisMonth = companySales.filter(s => s.createdAt.startsWith(thisMonth));
  const gmvThisMonth = salesThisMonth.reduce((acc, s) => acc + (s.amountCOP || 0), 0);
  
  const heldSales = companySales.filter(s => s.status === 'HELD');
  const releasedSalesMonth = companySales.filter(s => s.status === 'RELEASED' && s.createdAt.startsWith(thisMonth));
  
  const uniqueVendors = new Set(companySales.map(s => s.vendorId)).size;
  const activeServicesCount = companyServices.filter(s => s.status === 'activo').length;

  const recentSales = companySales.slice(0, 5);

  const today = new Date();
  const weeklyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (5 - i) * 7);
    const weekEnd = new Date(d);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekSales = companySales.filter(s => {
      const sd = new Date(s.createdAt);
      return sd >= d && sd < weekEnd;
    });
    return { week: `S${i + 1}`, ventas: weekSales.length };
  });

  const featureMatrix = [
    { label: "Servicios", freemium: "Máx. 5", premium: "Ilimitados", enterprise: "Ilimitados" },
    { label: "Códigos de activación", freemium: "Manual", premium: "Manual", enterprise: "Automático + API" },
    { label: "Fee Mensualista", freemium: "15% por venta", premium: "Sin fee", enterprise: "Sin fee" },
    { label: "Cupones de descuento", freemium: false, premium: true, enterprise: true },
    { label: "Chat vendedor-empresa", freemium: false, premium: true, enterprise: true },
    { label: "Dominio personalizado", freemium: false, premium: false, enterprise: true },
    { label: "Marca blanca", freemium: false, premium: false, enterprise: true },
    { label: "Integraciones API", freemium: false, premium: false, enterprise: true },
  ];

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "text-amber-600 bg-amber-500/10", label: "Retenida" },
      'RELEASED': { cls: "text-emerald-600 bg-emerald-500/10", label: "Liberada" },
      'REFUNDED': { cls: "text-red-600 bg-red-500/10", label: "Devuelta" },
    };
    return map[status] || { cls: "text-muted-foreground bg-muted", label: status };
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6 max-w-4xl">
        {/* Plan switcher (demo) */}
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">Demo: Cambiar plan</p>
          <div className="flex gap-2">
            {allPlans.map(p => {
              const cfg = planConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => setCurrentCompanyPlan(p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    plan === p
                      ? 'bg-foreground text-background'
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

        {/* Main KPI + Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Revenue card */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-[10px] gap-1">
                <pc.icon className="w-3 h-3" />
                {pc.label} — {pc.price}
              </Badge>
              {plan === 'freemium' && (
                <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2 text-primary" onClick={() => setCurrentCompanyPlan('premium')}>
                  Mejorar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ventas este mes</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{formatCOP(gmvThisMonth)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[11px] text-primary font-medium">{salesThisMonth.length} ventas · {releasedSalesMonth.length} liberadas</span>
            </div>
            {plan === 'freemium' && (
              <p className="text-[10px] text-destructive font-medium mt-2">Fee: 15% + 3% + $1.000 COP pasarela</p>
            )}
            {plan !== 'freemium' && (
              <p className="text-[10px] text-primary font-medium mt-2">Sin fee Mensualista — solo costos de pasarela</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Ventas mes", value: salesThisMonth.length, icon: ShoppingCart },
              { label: "Retenidas", value: heldSales.length, icon: DollarSign },
              { label: "Servicios", value: plan === 'freemium' ? `${activeServicesCount}/5` : `${activeServicesCount}`, icon: Package },
              { label: "Vendedores", value: uniqueVendors, icon: Users },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-3.5 text-center">
                <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Ventas por semana</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" fontSize={10} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: "Servicios", desc: plan === 'freemium' ? 'Máximo 5' : 'Ilimitados', icon: Package, href: "/company/services", locked: false },
            { label: "Vendedores", desc: "Red privada", icon: Users, href: "/company/vendors", locked: false },
            { label: "Capacitaciones", desc: "Contenido", icon: BookOpen, href: "/company/trainings", locked: false },
            { label: "Ventas", desc: "Historial", icon: ShoppingCart, href: "/company/sales", locked: false },
            { label: "Cupones", desc: "Descuentos", icon: Tag, href: "/company/coupons", locked: plan === 'freemium' },
            { label: "Chat", desc: "Vendedores", icon: MessageCircle, href: "/company/chat", locked: plan === 'freemium' },
            { label: "Dominio", desc: "Marca blanca", icon: Globe, href: "/company/domain", locked: plan !== 'enterprise' },
            { label: "API", desc: "Integración", icon: Code, href: "/company/api", locked: plan !== 'enterprise' },
          ].map(action => (
            action.locked ? (
              <div key={action.label} className="rounded-xl border border-border bg-card p-3 text-center opacity-40 cursor-not-allowed">
                <Lock className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">{action.label}</p>
                <p className="text-[9px] text-muted-foreground">{action.label === 'Dominio' || action.label === 'API' ? 'Enterprise' : 'Premium+'}</p>
              </div>
            ) : (
              <Link key={action.label} to={action.href}>
                <div className="rounded-xl border border-border bg-card p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all">
                  <action.icon className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                  <p className="text-xs font-medium text-foreground">{action.label}</p>
                  <p className="text-[9px] text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            )
          ))}
        </div>

        {/* Feature matrix */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Funciones de tu plan</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {featureMatrix.map((feat, i) => {
              const value = feat[plan];
              const isAvailable = value !== false;
              return (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className={`text-xs ${isAvailable ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                    {feat.label}
                  </span>
                  {typeof value === 'boolean' ? (
                    value ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground/20" />
                  ) : (
                    <span className="text-[11px] font-medium text-primary">{value}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent sales */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ventas recientes</span>
            <Link to="/company/sales" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentSales.map(sale => {
              const service = services.find(s => s.id === sale.serviceId);
              const vendor = vendors.find(v => v.id === sale.vendorId);
              const sc = getStatusConfig(sale.status);
              return (
                <div key={sale.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{sale.clientName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {vendor?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{formatCOP(sale.amountCOP || 0)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
            {recentSales.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Sin ventas recientes</p>
            )}
          </div>
        </div>

        {/* Upgrade CTA */}
        {plan !== 'enterprise' && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              {plan === 'freemium' ? <Crown className="w-6 h-6 text-primary flex-shrink-0" /> : <Building2 className="w-6 h-6 text-primary flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {plan === 'freemium' ? 'Desbloquea Premium' : 'Escala a Enterprise'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {plan === 'freemium'
                    ? 'Servicios ilimitados, cupones, chat y sin fee del 15%'
                    : 'Dominio propio, marca blanca, integración API automática'}
                </p>
              </div>
              <Button size="sm" className="text-xs gap-1" onClick={() => setCurrentCompanyPlan(plan === 'freemium' ? 'premium' : 'enterprise')}>
                Mejorar <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
