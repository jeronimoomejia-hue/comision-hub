import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ChevronRight, Package, Sparkles, Check,
  Rocket, BookOpen, ShoppingBag, DollarSign, ArrowRight,
  X, CheckCircle2, Circle
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
  {
    id: 1,
    icon: Building2,
    title: "Explora empresas",
    desc: "Descubre los productos que puedes vender",
    cta: "Ver catálogo",
    href: "/vendor/products",
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Capacítate",
    desc: "Completa el entrenamiento para activar servicios",
    cta: "Mis empresas",
    href: "/vendor/products",
  },
  {
    id: 3,
    icon: ShoppingBag,
    title: "Registra tu primera venta",
    desc: "Vende un servicio y gana tu comisión",
    cta: "Ir a vender",
    href: "/vendor/products",
  },
  {
    id: 4,
    icon: DollarSign,
    title: "Cobra tus comisiones",
    desc: "Se liberan automáticamente tras la retención",
    cta: "Ver pagos",
    href: "/vendor/payments",
  },
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

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === vendorId && l.status === 'active')
    .map(l => l.companyId);
  const linkedCompanies = companies.filter(c => linkedCompanyIds.includes(c.id));

  // Onboarding state
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem('vendor_onboarding_dismissed') === 'true'
  );

  const completedSteps = (() => {
    let s = 0;
    if (linkedCompanies.length > 0) s++;
    if (totalSales > 0) s += 2;
    if (releasedCommissions > 0) s++;
    return Math.min(s, 4);
  })();

  const isNewUser = totalSales === 0 && commissionsThisMonth === 0;

  // Featured offers
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
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">{greetingTime}</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{firstName}</h1>
        </motion.div>

        {/* Onboarding for new users */}
        <AnimatePresence>
          {isNewUser && !onboardingDismissed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 relative"
            >
              <button
                onClick={dismissOnboarding}
                className="absolute top-3.5 right-3.5 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">¡Bienvenido a Mensualista!</h2>
                  <p className="text-[11px] text-muted-foreground">{completedSteps} de {onboardingSteps.length} pasos</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps / onboardingSteps.length) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </div>

              <div className="space-y-2">
                {onboardingSteps.map((step, i) => {
                  const done = i < completedSteps;
                  const isNext = i === completedSteps;
                  return (
                    <Link
                      key={step.id}
                      to={step.href}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isNext
                          ? 'bg-primary/[0.06] border border-primary/15 hover:bg-primary/10'
                          : done
                          ? 'opacity-60'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        done ? 'bg-primary/10' : isNext ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <step.icon className={`w-3.5 h-3.5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {step.title}
                        </p>
                        {!done && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">{step.desc}</p>
                        )}
                      </div>
                      {isNext && (
                        <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5 flex-shrink-0">
                          {step.cta} <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance Card — always visible, clean */}
        <Link to="/vendor/payments">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-foreground p-5 text-background hover:opacity-95 active:scale-[0.99] transition-all group"
          >
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
          </motion.div>
        </Link>

        {/* Quick stats row — only if has data */}
        {!isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "Ventas", value: String(totalSales) },
              { label: "Empresas", value: String(linkedCompanies.length) },
              { label: "Servicios", value: String(allServices.filter(s => linkedCompanyIds.includes(s.companyId) && s.status === 'activo').length) },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3.5 text-center">
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Featured offers */}
        {featuredOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
                    <span className="text-[10px] text-muted-foreground">
                      {offer.vendorCommissionPct}% comisión
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* My companies — compact list */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                      <p className="text-[11px] text-muted-foreground truncate">{company.industry} · {serviceCount} servicios</p>
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
              <p className="text-[11px] text-muted-foreground mt-1">Explora el catálogo para unirte a una empresa.</p>
              <Link to="/vendor/products">
                <Button size="sm" variant="outline" className="mt-3 text-xs">
                  Explorar catálogo
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </VendorTabLayout>
  );
}
