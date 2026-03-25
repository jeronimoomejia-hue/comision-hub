import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  DollarSign, TrendingUp, Users, Crown, Zap, Building2, 
  ArrowRight, Package, ChevronRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { 
  companies, CURRENT_COMPANY_ID, formatCOP, CompanyPlan
} from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType; price: string }> = {
  freemium: { label: "Freemium", icon: Zap, price: "Gratis" },
  premium: { label: "Premium", icon: Crown, price: "€100/mes" },
  enterprise: { label: "Enterprise", icon: Building2, price: "€300/mes" },
};

const allPlans: CompanyPlan[] = ['freemium', 'premium', 'enterprise'];

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { sales, services, currentCompanyPlan, setCurrentCompanyPlan } = useDemo();
  
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const plan = currentCompanyPlan;
  const pc = planConfig[plan];
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  
  const thisMonth = new Date().toISOString().slice(0, 7);
  const salesThisMonth = companySales.filter(s => s.createdAt.startsWith(thisMonth));
  const gmvThisMonth = salesThisMonth.reduce((acc, s) => acc + (s.amountCOP || 0), 0);
  const uniqueVendors = new Set(companySales.map(s => s.vendorId)).size;
  const totalSubscriptions = companyServices.reduce((acc, s) => acc + (s.activeSubscriptions || 0), 0);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Plan switcher (demo) */}
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
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

        {/* KPIs row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Ventas este mes", value: formatCOP(gmvThisMonth), sub: `${salesThisMonth.length} transacciones`, icon: DollarSign },
            { label: "Suscripciones activas", value: totalSubscriptions.toLocaleString(), sub: "recurrentes", icon: RefreshCw },
            { label: "Productos activos", value: companyServices.filter(s => s.status === 'activo').length, sub: plan === 'freemium' ? 'máx. 5' : 'ilimitados', icon: Package },
            { label: "Vendedores", value: uniqueVendors, sub: "en tu red", icon: Users },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Services section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Mis Productos</h2>
            <Link to="/company/services" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyServices.slice(0, 3).map(service => {
              const serviceSales = companySales.filter(s => s.serviceId === service.id);
              const coverImg = categoryCovers[service.category];
              
              return (
                <div
                  key={service.id}
                  onClick={() => navigate(`/company/services/${service.id}`)}
                  className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img 
                      src={coverImg} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-semibold text-white leading-tight">{service.name}</h3>
                      <p className="text-[10px] text-white/70 mt-0.5">{formatCOP(service.priceCOP)}/mes</p>
                    </div>
                  </div>
                  
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{service.activeSubscriptions || 0}</p>
                        <p className="text-[9px] text-muted-foreground">Suscritos</p>
                      </div>
                      <div className="w-px h-6 bg-border" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{serviceSales.length}</p>
                        <p className="text-[9px] text-muted-foreground">Ventas</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                      Gestionar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ventas recientes</span>
            <Link to="/company/services" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
              Ver en productos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {companySales.slice(0, 5).map(sale => {
              const service = services.find(s => s.id === sale.serviceId);
              const sc = sale.status === 'HELD' 
                ? { cls: "text-amber-600 bg-amber-500/10", label: "Retenida" }
                : sale.status === 'RELEASED' 
                  ? { cls: "text-emerald-600 bg-emerald-500/10", label: "Liberada" }
                  : { cls: "text-red-600 bg-red-500/10", label: "Devuelta" };
              return (
                <div key={sale.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{sale.clientName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{service?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{formatCOP(sale.amountCOP || 0)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
            {companySales.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Sin ventas recientes</p>
            )}
          </div>
        </div>

        {/* Upgrade CTA */}
        {plan !== 'enterprise' && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              {plan === 'freemium' ? <Crown className="w-5 h-5 text-primary flex-shrink-0" /> : <Building2 className="w-5 h-5 text-primary flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {plan === 'freemium' ? 'Desbloquea Premium' : 'Escala a Enterprise'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {plan === 'freemium'
                    ? 'Productos ilimitados, cupones, chat y sin fee del 15%'
                    : 'Dominio propio, marca blanca, integración API'}
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