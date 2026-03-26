import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Users, Crown, Zap, Building2,
  ArrowRight, Package, ChevronRight, RefreshCw, ChevronDown, BarChart3,
  CreditCard, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import {
  companies, CURRENT_COMPANY_ID, formatCOP, CompanyPlan, vendors, services as allServices
} from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType; price: string }> = {
  freemium: { label: "Freemium", icon: Zap, price: "Gratis" },
  premium: { label: "Premium", icon: Crown, price: "€100/mes" },
  enterprise: { label: "Enterprise", icon: Building2, price: "€300/mes" },
};

const allPlans: CompanyPlan[] = ['freemium', 'premium', 'enterprise'];

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { sales, services, commissions, companyPayments, currentCompanyPlan, setCurrentCompanyPlan } = useDemo();

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const plan = currentCompanyPlan;
  const pc = planConfig[plan];
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const salesThisMonth = companySales.filter(s => s.createdAt.startsWith(thisMonth));
  const gmvThisMonth = salesThisMonth.reduce((acc, s) => acc + (s.amountCOP || s.grossAmount || 0), 0);
  const uniqueVendors = new Set(companySales.map(s => s.vendorId)).size;
  const totalSubscriptions = companyServices.reduce((acc, s) => acc + (s.activeSubscriptions || 0), 0);

  const totalGMV = companySales.reduce((s, sale) => s + (sale.amountCOP || sale.grossAmount || 0), 0);
  const totalNet = companySales.filter(s => s.status !== 'REFUNDED').reduce((s, sale) => s + sale.providerNetAmount, 0);
  const heldCount = companySales.filter(s => s.status === 'HELD').length;
  const releasedCount = companySales.filter(s => s.status === 'COMPLETED').length;
  const refundedCount = companySales.filter(s => s.status === 'REFUNDED').length;

  const [showMetrics, setShowMetrics] = useState(false);

  const chartData = (() => {
    const months: { name: string; ventas: number; ingresos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('es-CO', { month: 'short' });
      const monthSales = companySales.filter(s => s.createdAt.startsWith(key) && s.status !== 'REFUNDED');
      months.push({
        name: label.charAt(0).toUpperCase() + label.slice(1),
        ventas: monthSales.length,
        ingresos: monthSales.reduce((a, s) => a + s.providerNetAmount, 0),
      });
    }
    return months;
  })();

  const myPayments = companyPayments.filter(p => p.companyId === CURRENT_COMPANY_ID && p.status === 'enviado')
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Ventas este mes", value: formatCOP(gmvThisMonth), sub: `${salesThisMonth.length} transacciones`, icon: DollarSign },
            { label: "Suscripciones activas", value: totalSubscriptions.toLocaleString(), sub: "recurrentes", icon: RefreshCw },
            { label: "Productos activos", value: companyServices.filter(s => s.status === 'activo').length, sub: plan === 'freemium' ? 'máx. 5' : 'ilimitados', icon: Package },
            { label: "Vendedores", value: uniqueVendors, sub: "en tu red", icon: Users },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Metrics toggle */}
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600 text-xs font-medium hover:bg-purple-500/15 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Ver métricas
          <ChevronDown className={`w-3 h-3 transition-transform ${showMetrics ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "GMV total", value: formatCOP(totalGMV) },
                    { label: "Neto empresa", value: formatCOP(totalNet) },
                    { label: "Tiempo de devolución", value: String(heldCount) },
                    { label: "Devoluciones", value: String(refundedCount) },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-3 text-center">
                      <p className="text-sm font-bold text-foreground">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Chart */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
                      <TrendingUp className="w-3 h-3 text-primary" /> Ventas · 6 meses
                    </p>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number, name: string) => [
                              name === 'ingresos' ? formatCOP(value) : value,
                              name === 'ingresos' ? 'Neto' : 'Ventas'
                            ]}
                          />
                          <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent payments */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-primary" /> Últimos pagos
                      </p>
                      <Link to="/company/payments" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                        Ver todos <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    {myPayments.length > 0 ? (
                      <div className="space-y-2">
                        {myPayments.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                            <div>
                              <p className="text-xs font-medium text-foreground">{formatCOP(p.amountCOP)}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(p.scheduledDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
                            </div>
                            <span className="text-[9px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Depositado</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground py-4 text-center">Sin pagos recientes</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Mis Productos</h2>
            <Link to="/company/services" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
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
                    <img src={coverImg} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-semibold text-white leading-tight">{service.name}</h3>
                      <p className="text-[10px] text-white/70 mt-0.5">{formatCOP(service.priceCOP)}{service.type === 'suscripción' ? '/mes' : ''}</p>
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

        {/* Recent sales with TransactionCards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Ventas recientes</span>
            <Link to="/company/services" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
              Ver en productos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <StatusGuide />

          <div className="space-y-2.5 mt-3">
            {companySales.slice(0, 5).map(sale => {
              const service = services.find(s => s.id === sale.serviceId);
              const vendor = vendors.find(v => v.id === sale.vendorId);
              return (
                <TransactionCard
                  key={sale.id}
                  id={sale.id}
                  clientName={sale.clientName}
                  clientEmail={sale.clientEmail}
                  clientPhone={sale.clientPhone}
                  serviceName={service?.name}
                  serviceCategory={service?.category}
                  vendorName={vendor?.name}
                  amount={sale.amountCOP || sale.grossAmount}
                  commission={sale.sellerCommissionAmount}
                  platformFee={sale.mensualistaFeeAmount}
                  netAmount={sale.providerNetAmount}
                  status={sale.status}
                  statusType="sale"
                  date={sale.createdAt}
                  holdEndDate={sale.holdEndAt}
                  releasedDate={sale.releasedAt}
                  activationCode={sale.activationCode}
                  isSubscription={sale.isSubscription}
                  paymentId={sale.mpPaymentId}
                  role="company"
                />
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
