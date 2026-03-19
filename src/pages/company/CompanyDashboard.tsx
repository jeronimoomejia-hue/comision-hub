import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  DollarSign, ShoppingCart, TrendingUp, Users, Crown, Zap, Building2, Tag, MessageCircle, Globe, Code, ArrowRight, Lock, Settings, BarChart3, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { 
  companies, vendors, CURRENT_COMPANY_ID, formatCOP, CompanyPlan
} from "@/data/mockData";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const planConfig: Record<CompanyPlan, { label: string; color: string; bgColor: string; icon: React.ElementType; price: string }> = {
  freemium: { label: "Freemium", color: "bg-muted text-muted-foreground", bgColor: "bg-muted/30", icon: Zap, price: "Gratis" },
  premium: { label: "Premium", color: "bg-primary text-primary-foreground", bgColor: "bg-primary/5", icon: Crown, price: "€100/mes" },
  enterprise: { label: "Enterprise", color: "bg-foreground text-background", bgColor: "bg-foreground/5", icon: Building2, price: "€300/mes" },
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

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "text-amber-600 bg-amber-50", label: "Retenida" },
      'RELEASED': { cls: "text-emerald-600 bg-emerald-50", label: "Liberada" },
      'REFUNDED': { cls: "text-red-600 bg-red-50", label: "Devuelta" },
    };
    return map[status] || { cls: "text-muted-foreground bg-muted", label: status };
  };

  // Feature matrix per plan
  const featureMatrix = [
    { label: "Gigs", freemium: "Máx. 5", premium: "Ilimitados", enterprise: "Ilimitados" },
    { label: "Códigos de activación", freemium: "Manual", premium: "Manual", enterprise: "Automático + API" },
    { label: "Fee Mensualista", freemium: "15% por venta", premium: "Sin fee", enterprise: "Sin fee" },
    { label: "Cupones de descuento", freemium: false, premium: true, enterprise: true },
    { label: "Chat vendedor-empresa", freemium: false, premium: true, enterprise: true },
    { label: "Dominio personalizado", freemium: false, premium: false, enterprise: true },
    { label: "Marca blanca", freemium: false, premium: false, enterprise: true },
    { label: "Integraciones API", freemium: false, premium: false, enterprise: true },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        {/* ── DEMO Plan Switcher ── */}
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3">
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">🔀 Demo: Cambiar plan</p>
          <div className="flex gap-2">
            {allPlans.map(p => {
              const cfg = planConfig[p];
              return (
                <button
                  key={p}
                  onClick={() => setCurrentCompanyPlan(p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    plan === p
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

        {/* ── Plan Badge + Balance ── */}
        <div className={`rounded-2xl p-5 relative overflow-hidden ${pc.bgColor} border border-border`}>
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${pc.color} gap-1`}>
              <pc.icon className="w-3 h-3" />
              Plan {pc.label} — {pc.price}
            </Badge>
            {plan === 'freemium' && (
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setCurrentCompanyPlan('premium')}>
                <Crown className="w-3 h-3" />
                Mejorar plan
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Ventas este mes</p>
          <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: 'hsl(var(--primary))' }}>
            {formatCOP(gmvThisMonth)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{salesThisMonth.length} ventas · {releasedSalesMonth.length} liberadas</p>
          {plan === 'freemium' && (
            <p className="text-[10px] text-destructive font-medium mt-2">⚠ Fee: 15% Mensualista + 3% + $1.000 COP pasarela por venta</p>
          )}
          {plan !== 'freemium' && (
            <p className="text-[10px] text-success font-medium mt-2">✓ Sin fee Mensualista — solo 3% + $1.000 COP pasarela</p>
          )}
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Ventas mes", value: salesThisMonth.length },
            { label: "Retenidas", value: heldSales.length },
            { label: "Gigs", value: plan === 'freemium' ? `${activeServicesCount}/5` : `${activeServicesCount}` },
            { label: "Vendedores", value: uniqueVendors },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-xl border border-border bg-card">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Feature Matrix for current plan ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              Funciones de tu plan {pc.label}
            </h3>
          </div>
          <div className="divide-y divide-border/50">
            {featureMatrix.map((feat, i) => {
              const value = feat[plan];
              const isAvailable = value !== false;
              return (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className={`text-xs ${isAvailable ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                    {feat.label}
                  </span>
                  {typeof value === 'boolean' ? (
                    value ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground/30" />
                    )
                  ) : (
                    <span className="text-xs font-medium text-primary">{value}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Ventas por semana</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Plan-specific action cards ── */}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/company/gigs">
            <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
              <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-sm font-medium">Gigs</p>
              <p className="text-[10px] text-muted-foreground">
                {plan === 'freemium' ? 'Máximo 5' : 'Ilimitados'}
              </p>
            </div>
          </Link>
          <Link to="/company/vendors">
            <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-sm font-medium">Vendedores</p>
              <p className="text-[10px] text-muted-foreground">Red privada</p>
            </div>
          </Link>

          {/* Cupones */}
          {plan !== 'freemium' ? (
            <Link to="/company/settings">
              <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
                <Tag className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-medium">Cupones</p>
                <p className="text-[10px] text-muted-foreground">Gestionar descuentos</p>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-border bg-card p-3 text-center opacity-50 cursor-not-allowed">
              <Lock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Cupones</p>
              <p className="text-[10px] text-muted-foreground">Premium+</p>
            </div>
          )}

          {/* Chat */}
          {plan !== 'freemium' ? (
            <Link to="/company/settings">
              <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-medium">Chat</p>
                <p className="text-[10px] text-muted-foreground">Mensajes vendedores</p>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-border bg-card p-3 text-center opacity-50 cursor-not-allowed">
              <Lock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Chat</p>
              <p className="text-[10px] text-muted-foreground">Premium+</p>
            </div>
          )}
        </div>

        {/* Enterprise-exclusive features */}
        {plan === 'enterprise' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
              <Globe className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-sm font-medium">Dominio propio</p>
              <p className="text-[10px] text-primary font-mono">{company?.customDomain || 'ventas.tuempresa.com'}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
              <Code className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-sm font-medium">API / Integración</p>
              <p className="text-[10px] text-muted-foreground">Códigos automáticos</p>
            </div>
          </div>
        )}

        {/* Recent sales */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ventas recientes</p>
            <Link to="/company/sales" className="text-xs text-primary hover:underline">Ver todas</Link>
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

        {/* Upgrade CTA for non-enterprise */}
        {plan !== 'enterprise' && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-3">
              {plan === 'freemium' ? <Crown className="w-8 h-8 text-primary" /> : <Building2 className="w-8 h-8 text-primary" />}
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {plan === 'freemium' ? 'Desbloquea Premium' : 'Escala a Enterprise'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan === 'freemium'
                    ? 'Gigs ilimitados, cupones, chat y sin fee del 15%'
                    : 'Dominio propio, marca blanca, integración API automática'}
                </p>
              </div>
              <Button size="sm" className="gap-1" onClick={() => setCurrentCompanyPlan(plan === 'freemium' ? 'premium' : 'enterprise')}>
                Mejorar <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
