import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ChevronRight, Sparkles,
  Rocket, BookOpen, ShoppingBag, DollarSign, ArrowRight,
  CheckCircle2, ChevronDown, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import {
  vendors, companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, formatCOP
} from "@/data/mockData";
import { industryCover } from "@/data/coverImages";

const onboardingSteps = [
  { id: 1, icon: Building2, title: "Explora empresas", href: "/vendor/products" },
  { id: 2, icon: BookOpen, title: "Capacítate", href: "/vendor/products" },
  { id: 3, icon: ShoppingBag, title: "Vende", href: "/vendor/products" },
  { id: 4, icon: DollarSign, title: "Cobra", href: "/vendor/payments" },
];

export default function VendorDashboard() {
  const { sales, commissions, currentVendorId } = useDemo();
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
  const releasedCommissions = vendorCommissions.filter(c => c.status === 'RELEASED').reduce((a, c) => a + c.amountCOP, 0);
  const refundedCount = vendorSales.filter(s => s.status === 'REFUNDED').length;
  const totalSalesAmount = vendorSales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + s.grossAmount, 0);
  const conversionRate = totalSales > 0 ? Math.round((totalSales / (totalSales + refundedCount)) * 100) : 0;

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === vendorId && l.status === 'active')
    .map(l => l.companyId);
  const linkedCompanies = companies.filter(c => linkedCompanyIds.includes(c.id));

  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem('vendor_onboarding_dismissed') === 'true'
  );
  const [showMetrics, setShowMetrics] = useState(false);

  const completedSteps = (() => {
    let s = 0;
    if (linkedCompanies.length > 0) s++;
    if (totalSales > 0) s += 2;
    if (releasedCommissions > 0) s++;
    return Math.min(s, 4);
  })();

  const isNewUser = totalSales === 0 && commissionsThisMonth === 0;
  const nextStep = onboardingSteps[completedSteps] || onboardingSteps[3];

  const featuredOffers = (() => {
    const active = allServices.filter(s => s.status === 'activo');
    return active
      .map(s => ({
        ...s,
        earningsPerSale: Math.round(s.priceCOP * s.vendorCommissionPct / 100),
        company: companies.find(c => c.id === s.companyId),
      }))
      .sort((a, b) => b.earningsPerSale - a.earningsPerSale)
      .slice(0, 2);
  })();

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

  return (
    <VendorTabLayout>
      <div className="space-y-5">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-muted-foreground text-sm">{greetingTime}</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{firstName}</h1>
        </motion.div>

        {/* Onboarding — compact inline banner */}
        <AnimatePresence>
          {isNewUser && !onboardingDismissed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={nextStep.href}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-primary/15 bg-primary/[0.04] hover:bg-primary/[0.07] active:scale-[0.99] transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Paso {completedSteps + 1} de 4 · {nextStep.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {onboardingSteps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < completedSteps ? 'bg-primary' : i === completedSteps ? 'bg-primary/40' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); dismissOnboarding(); }}
                className="text-[10px] text-muted-foreground hover:text-foreground mt-1.5 ml-1 transition-colors"
              >
                Ocultar guía
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link to="/vendor/payments">
            <div className="rounded-2xl bg-foreground p-5 text-background hover:opacity-95 active:scale-[0.99] transition-all group">
              <p className="text-[10px] opacity-50 tracking-wide uppercase">Comisiones del mes</p>
              <p className="text-3xl font-bold tracking-tight mt-1">
                {formatCOP(commissionsThisMonth)}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-[11px] opacity-60">
                  <span>{formatCOP(heldCommissions)} retenidas</span>
                  <span>{formatCOP(releasedCommissions)} liberadas</span>
                </div>
                <span className="text-[10px] opacity-30 group-hover:opacity-60 transition-opacity flex items-center gap-1">
                  Detalle <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* Expand metrics button */}
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-1.5 mt-2 ml-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <BarChart3 className="w-3 h-3" />
            <span>Ver métricas</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showMetrics ? 'rotate-180' : ''}`} />
          </button>

          {/* Collapsible metrics panel */}
          <AnimatePresence>
            {showMetrics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                  {[
                    { label: "Ventas brutas", value: formatCOP(totalSalesAmount) },
                    { label: "Transacciones", value: String(totalSales) },
                    { label: "Retención", value: totalSales > 0 ? `${conversionRate}%` : "—" },
                    { label: "Devoluciones", value: String(refundedCount) },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-3 text-center">
                      <p className="text-base font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Featured offers */}
        {featuredOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <p className="text-sm font-semibold text-foreground">Comienza a vender</p>
              </div>
              <Link to="/vendor/products" className="text-[10px] font-medium text-primary flex items-center gap-0.5 hover:underline">
                Ver todo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredOffers.map((offer) => (
                <Link
                  key={offer.id}
                  to={`/vendor/company/${offer.companyId}`}
                  className="block rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/20 hover:shadow-sm active:scale-[0.99] transition-all"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={industryCover[offer.company?.industry || '']}
                      alt={offer.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white/40 text-[9px] uppercase tracking-widest truncate">{offer.company?.name}</p>
                      <h3 className="text-white font-semibold text-sm leading-tight truncate">{offer.name}</h3>
                    </div>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-primary">{formatCOP(offer.earningsPerSale)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5">por venta</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{offer.vendorCommissionPct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* My companies */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Mis empresas</p>
            <Link to="/vendor/products" className="text-[10px] font-medium text-primary flex items-center gap-0.5 hover:underline">
              Explorar <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {linkedCompanies.length > 0 ? (
            <div className="space-y-2">
              {linkedCompanies.map((company) => {
                const serviceCount = allServices.filter(s => s.companyId === company.id && s.status === 'activo').length;
                return (
                  <Link
                    key={company.id}
                    to={`/vendor/company/${company.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm active:scale-[0.99] transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                    >
                      <span className="text-white font-bold text-sm">{company.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{company.name}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{company.industry} · {serviceCount} productos</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Building2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Sin empresas aún</p>
              <p className="text-[11px] text-muted-foreground mt-1">Explora el catálogo para unirte.</p>
              <Link to="/vendor/products">
                <Button size="sm" variant="outline" className="mt-3 text-xs">Explorar catálogo</Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </VendorTabLayout>
  );
}
