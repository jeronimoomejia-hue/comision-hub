import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  DollarSign, ShoppingCart, TrendingUp, Users, Crown, Zap, Building2, Tag, MessageCircle, Globe, Code, ArrowRight, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { 
  companies, vendors, CURRENT_COMPANY_ID, formatCOP, formatDate, CompanyPlan
} from "@/data/mockData";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const planConfig: Record<CompanyPlan, { label: string; color: string; icon: React.ElementType }> = {
  freemium: { label: "Freemium", color: "bg-muted text-muted-foreground", icon: Zap },
  premium: { label: "Premium", color: "bg-primary text-primary-foreground", icon: Crown },
  enterprise: { label: "Enterprise", color: "bg-foreground text-background", icon: Building2 },
};

export default function CompanyDashboard() {
  const { sales, commissions, services } = useDemo();
  
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const plan = company?.plan || 'freemium';
  const pc = planConfig[plan];
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  
  const thisMonth = new Date().toISOString().slice(0, 7);
  const salesThisMonth = companySales.filter(s => s.createdAt.startsWith(thisMonth));
  const gmvThisMonth = salesThisMonth.reduce((acc, s) => acc + s.amountCOP, 0);
  
  const heldSales = companySales.filter(s => s.status === 'HELD');
  const releasedSalesMonth = companySales.filter(s => s.status === 'RELEASED' && s.createdAt.startsWith(thisMonth));
  
  const uniqueVendors = new Set(companySales.map(s => s.vendorId)).size;
  const activeServicesCount = companyServices.filter(s => s.status === 'activo').length;
  const maxServices = plan === 'freemium' ? 5 : Infinity;

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

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        {/* Plan Badge + Balance */}
        <div className="rounded-2xl bg-[#F4F0FA] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${pc.color} gap-1`}>
              <pc.icon className="w-3 h-3" />
              Plan {pc.label}
            </Badge>
            {plan === 'freemium' && (
              <Link to="/company/settings">
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  <Crown className="w-3 h-3" />
                  Mejorar plan
                </Button>
              </Link>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Ventas este mes</p>
          <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: 'hsl(var(--primary))' }}>
            {formatCOP(gmvThisMonth)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{salesThisMonth.length} ventas · {releasedSalesMonth.length} liberadas</p>
          {plan === 'freemium' && (
            <p className="text-[10px] text-primary mt-2">Fee: 15% + costos de pasarela</p>
          )}
          {plan !== 'freemium' && (
            <p className="text-[10px] text-success mt-2">✓ Sin fee Mensualista — solo costos de pasarela</p>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Ventas mes", value: salesThisMonth.length },
            { label: "Retenidas", value: heldSales.length },
            { label: "Servicios", value: `${activeServicesCount}${plan === 'freemium' ? '/5' : ''}` },
            { label: "Vendedores", value: uniqueVendors },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-xl border border-border bg-card">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Plan Features Quick View */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Funciones de tu plan</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Servicios", value: plan === 'freemium' ? 'Máx. 5' : 'Ilimitados', available: true },
              { label: "Cupones", value: plan === 'freemium' ? 'No incluido' : 'Activo', available: plan !== 'freemium' },
              { label: "Chat con vendedores", value: plan === 'freemium' ? 'No incluido' : 'Activo', available: plan !== 'freemium' },
              { label: "Códigos automáticos", value: plan === 'enterprise' ? 'Activo' : 'Manual', available: plan === 'enterprise' },
              { label: "Dominio personalizado", value: plan === 'enterprise' ? (company?.customDomain || 'Configurar') : 'No incluido', available: plan === 'enterprise' },
              { label: "Marca blanca", value: plan === 'enterprise' ? 'Activo' : 'No incluido', available: plan === 'enterprise' },
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${feature.available ? 'bg-success/5 text-success' : 'bg-muted/50 text-muted-foreground'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${feature.available ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                <span>{feature.label}: <span className="font-medium">{feature.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
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
                    <span className="text-sm font-semibold">{formatCOP(sale.amountCOP)}</span>
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

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/company/services">
            <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
              <p className="text-sm font-medium">Servicios</p>
              <p className="text-[10px] text-muted-foreground">Gestionar catálogo</p>
            </div>
          </Link>
          <Link to="/company/vendors">
            <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
              <p className="text-sm font-medium">Vendedores</p>
              <p className="text-[10px] text-muted-foreground">Ver red privada</p>
            </div>
          </Link>
          {(plan === 'premium' || plan === 'enterprise') && (
            <>
              <Link to="/company/settings">
                <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
                  <Tag className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-medium">Cupones</p>
                  <p className="text-[10px] text-muted-foreground">Gestionar descuentos</p>
                </div>
              </Link>
              <Link to="/company/settings">
                <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
                  <MessageCircle className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-medium">Chat</p>
                  <p className="text-[10px] text-muted-foreground">Mensajes vendedores</p>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Upgrade CTA for freemium */}
        {plan === 'freemium' && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Desbloquea más funciones</p>
                <p className="text-xs text-muted-foreground">Servicios ilimitados, cupones, chat y sin fee del 15%</p>
              </div>
              <Link to="/company/settings">
                <Button size="sm" className="gap-1">
                  Mejorar <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
