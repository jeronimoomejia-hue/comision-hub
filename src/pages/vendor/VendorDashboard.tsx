import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight, Sparkles, Rocket, BookOpen, ShoppingBag, DollarSign,
  ArrowRight, ChevronDown, BarChart3, RefreshCw, Zap, Lock, Check,
  TrendingUp, CreditCard, Star, Clock, Shield, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import {
  vendors, companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, formatCOP
} from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const onboardingSteps = [
  { id: 1, title: "Explora empresas", href: "/vendor/products" },
  { id: 2, title: "Capacítate", href: "/vendor/products" },
  { id: 3, title: "Vende", href: "/vendor/products" },
  { id: 4, title: "Cobra", href: "/vendor/payments" },
];

export default function VendorDashboard() {
  const { sales, commissions, trainingProgress, currentVendorId } = useDemo();
  const navigate = useNavigate();
  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const vendor = vendors.find(v => v.id === vendorId);
  const firstName = vendor?.name.split(' ')[0] || 'Vendedor';

  const vendorSales = sales.filter(s => s.vendorId === vendorId);
  const vendorCommissions = commissions.filter(c => c.vendorId === vendorId);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const commissionsThisMonth = vendorCommissions
    .filter(c => c.createdAt.startsWith(thisMonth) && c.status !== 'REFUNDED')
    .reduce((a, c) => a + c.amountCOP, 0);

  const totalSales = vendorSales.filter(s => s.status !== 'REFUNDED').length;
  const heldCommissions = vendorCommissions.filter(c => c.status === 'HELD').reduce((a, c) => a + c.amountCOP, 0);
  const releasedCommissions = vendorCommissions.filter(c => c.status === 'COMPLETED').reduce((a, c) => a + c.amountCOP, 0);
  const refundedCount = vendorSales.filter(s => s.status === 'REFUNDED').length;
  const totalSalesAmount = vendorSales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + s.grossAmount, 0);
  const conversionRate = totalSales > 0 ? Math.round((totalSales / (totalSales + refundedCount)) * 100) : 0;

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === vendorId && l.status === 'active')
    .map(l => l.companyId);

  const vendorServices = allServices
    .filter(s => s.status === 'activo' && linkedCompanyIds.includes(s.companyId))
    .map(s => {
      const company = companies.find(c => c.id === s.companyId);
      const training = trainingProgress.find(tp => tp.vendorId === vendorId && tp.serviceId === s.id);
      const isActive = !s.requiresTraining || training?.status === 'declared_completed';
      const salesCount = vendorSales.filter(sl => sl.serviceId === s.id && sl.status !== 'REFUNDED').length;
      const earningsPerSale = Math.round(s.priceCOP * s.vendorCommissionPct / 100);
      return { ...s, company, isActive, salesCount, earningsPerSale };
    })
    .sort((a, b) => b.salesCount - a.salesCount);

  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem('vendor_onboarding_dismissed') === 'true'
  );
  const [showMetrics, setShowMetrics] = useState(false);

  const completedSteps = (() => {
    let s = 0;
    if (linkedCompanyIds.length > 0) s++;
    if (totalSales > 0) s += 2;
    if (releasedCommissions > 0) s++;
    return Math.min(s, 4);
  })();

  const isNewUser = totalSales === 0 && commissionsThisMonth === 0;
  const nextStep = onboardingSteps[completedSteps] || onboardingSteps[3];

  const dismissOnboarding = () => {
    setOnboardingDismissed(true);
    localStorage.setItem('vendor_onboarding_dismissed', 'true');
  };

  const greetingTime = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  })();

  const chartData = (() => {
    const months: { name: string; ventas: number; comisiones: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('es-CO', { month: 'short' });
      const monthSales = vendorSales.filter(s => s.createdAt.startsWith(key) && s.status !== 'REFUNDED');
      const monthComm = vendorCommissions.filter(c => c.createdAt.startsWith(key) && c.status !== 'REFUNDED');
      months.push({
        name: label.charAt(0).toUpperCase() + label.slice(1),
        ventas: monthSales.length,
        comisiones: monthComm.reduce((a, c) => a + c.amountCOP, 0),
      });
    }
    return months;
  })();

  const recentPayments = vendorCommissions
    .filter(c => c.status === 'COMPLETED' && c.paymentDate)
    .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())
    .slice(0, 3);

  // Recent sales for activity feed
  const recentSales = vendorSales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Featured offers (products from non-linked companies)
  const featuredOffers = allServices
    .filter(s => s.status === 'activo' && !linkedCompanyIds.includes(s.companyId))
    .map(s => ({
      ...s,
      earningsPerSale: Math.round(s.priceCOP * s.vendorCommissionPct / 100),
      company: companies.find(c => c.id === s.companyId),
    }))
    .sort((a, b) => b.earningsPerSale - a.earningsPerSale)
    .slice(0, 2);

  return (
    <VendorTabLayout>
      <div className="space-y-4">
        {/* Row 1: Greeting + Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Greeting + onboarding */}
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-xs">{greetingTime}</p>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{firstName}</h1>
            </div>

            <AnimatePresence>
              {isNewUser && !onboardingDismissed && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                  <Link
                    to={nextStep.href}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/15 bg-primary/[0.04] hover:bg-primary/[0.07] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">Paso {completedSteps + 1}/4 · {nextStep.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {onboardingSteps.map((_, i) => (
                          <div key={i} className={`h-0.5 flex-1 rounded-full ${i < completedSteps ? 'bg-primary' : i === completedSteps ? 'bg-primary/40' : 'bg-muted'}`} />
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  </Link>
                  <button onClick={(e) => { e.preventDefault(); dismissOnboarding(); }} className="text-[10px] text-muted-foreground hover:text-foreground mt-1 ml-1">Ocultar</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick activity feed */}
            {recentSales.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mb-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Actividad reciente
                </p>
                <div className="space-y-1.5">
                  {recentSales.slice(0, 3).map(sale => {
                    const svc = allServices.find(s => s.id === sale.serviceId);
                    return (
                      <div key={sale.id} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            sale.status === 'COMPLETED' ? 'bg-emerald-500' : sale.status === 'HELD' ? 'bg-amber-500' : sale.status === 'REFUNDED' ? 'bg-destructive' : 'bg-muted-foreground'
                          }`} />
                          <span className="text-foreground truncate">{sale.clientName}</span>
                        </div>
                        <span className="text-muted-foreground flex-shrink-0 ml-2">{formatCOP(sale.sellerCommissionAmount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Balance card */}
          <div className="space-y-2">
            <Link to="/vendor/payments">
              <div className="rounded-2xl bg-foreground p-4 text-background hover:opacity-95 active:scale-[0.99] transition-all group">
                <p className="text-[9px] opacity-50 tracking-wide uppercase">Comisiones del mes</p>
                <p className="text-2xl font-bold tracking-tight mt-0.5">{formatCOP(commissionsThisMonth)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-[10px] opacity-60">
                    <span>{formatCOP(heldCommissions)} retenidas</span>
                    <span>{formatCOP(releasedCommissions)} liberadas</span>
                  </div>
                  <span className="text-[9px] opacity-30 group-hover:opacity-60 transition-opacity flex items-center gap-0.5">
                    Detalle <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Metrics toggle */}
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors ml-1"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Ver métricas y pagos</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showMetrics ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expanded metrics */}
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
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Ventas brutas", value: formatCOP(totalSalesAmount) },
                    { label: "Transacciones", value: String(totalSales) },
                    { label: "Retención", value: totalSales > 0 ? `${conversionRate}%` : "—" },
                    { label: "Devoluciones", value: String(refundedCount) },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Chart */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
                      <TrendingUp className="w-3 h-3 text-primary" /> Ventas · 6 meses
                    </p>
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number, name: string) => [
                              name === 'comisiones' ? formatCOP(value) : value,
                              name === 'comisiones' ? 'Comisiones' : 'Ventas'
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
                      <Link to="/vendor/payments" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                        Ver todos <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    {recentPayments.length > 0 ? (
                      <div className="space-y-2">
                        {recentPayments.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                            <div>
                              <p className="text-xs font-medium text-foreground">{formatCOP(p.amountCOP)}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(p.paymentDate!).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
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

        {/* My Products — card grid with cover images */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold text-foreground">Mis productos</p>
            <Link to="/vendor/products" className="text-[10px] font-medium text-primary flex items-center gap-0.5 hover:underline">
              Explorar <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {vendorServices.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {vendorServices.slice(0, 8).map((service) => {
                const coverImg = categoryCovers[service.category];
                const isRecurring = service.type === 'suscripción';
                const availableCodes = service.activationCodes.filter((c: any) => c.status === 'available').length;

                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      if (service.isActive) {
                        navigate(`/vendor/company/${service.companyId}/service/${service.id}`);
                      } else {
                        navigate(`/vendor/trainings/${service.id}`);
                      }
                    }}
                    className={`rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all duration-300 ${
                      !service.isActive ? 'grayscale opacity-75' : ''
                    }`}
                  >
                    <div className="relative h-24 overflow-hidden">
                      <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {!service.isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white border border-white/20">
                            <Lock className="w-2.5 h-2.5" /> Sin activar
                          </span>
                        </div>
                      )}

                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        {isRecurring ? (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-medium px-1 py-0.5 rounded-full bg-blue-500/90 text-white">
                            <RefreshCw className="w-2 h-2" /> Mensual
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-medium px-1 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                            <Zap className="w-2 h-2" /> Único
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-1.5 right-1.5">
                        <p className="text-xs font-bold text-white drop-shadow-md">{formatCOP(service.earningsPerSale)}</p>
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <h3 className="font-semibold text-[11px] text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-[9px] text-muted-foreground truncate">{service.company?.name}</p>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground pt-1 border-t border-border/50">
                        <span className="flex items-center gap-0.5"><Clock className="w-2 h-2" /> {service.refundPolicy.refundWindowDays}d</span>
                        {service.salesCount > 0 && <span>{service.salesCount} venta{service.salesCount !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <ShoppingBag className="w-6 h-6 text-muted-foreground/20 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-foreground">Sin productos aún</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Explora el catálogo para empezar</p>
              <Link to="/vendor/products">
                <Button size="sm" variant="outline" className="mt-2 text-[10px] h-7">Explorar</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Featured offers */}
        {featuredOffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-xs font-semibold text-foreground">Productos destacados</p>
              </div>
              <Link to="/vendor/products" className="text-[10px] font-medium text-primary flex items-center gap-0.5 hover:underline">
                Ver todo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {featuredOffers.map((offer) => (
                <Link
                  key={offer.id}
                  to={`/vendor/company/${offer.companyId}`}
                  className="block rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/20 hover:shadow-sm active:scale-[0.99] transition-all"
                >
                  <div className="relative h-24 overflow-hidden">
                    <img
                      src={categoryCovers[offer.category]}
                      alt={offer.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2">
                      <p className="text-white/50 text-[8px] uppercase tracking-widest truncate">{offer.company?.name}</p>
                      <h3 className="text-white font-semibold text-[11px] leading-tight truncate">{offer.name}</h3>
                    </div>
                  </div>
                  <div className="px-2.5 py-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-primary">{formatCOP(offer.earningsPerSale)}</span>
                      <span className="text-[9px] text-muted-foreground ml-1">por venta</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{offer.vendorCommissionPct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </VendorTabLayout>
  );
}
