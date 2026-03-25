import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, ChevronRight, Search, TrendingUp,
  Crown, Zap, Package, ArrowUpRight, ArrowDownRight,
  Sparkles, CheckCircle2, Circle, X, Check, Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import {
  vendors, companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, formatCOP, CompanyPlan
} from "@/data/mockData";
import { industryCover } from "@/data/coverImages";

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType }> = {
  freemium: { label: "Free", icon: Zap },
  premium: { label: "Premium", icon: Crown },
  enterprise: { label: "Enterprise", icon: Building2 },
};

const tutorialSteps = [
  { id: 1, title: "Explora tus empresas", desc: "Revisa el catálogo de servicios de cada empresa." },
  { id: 2, title: "Completa capacitaciones", desc: "Activa servicios completando el material de estudio." },
  { id: 3, title: "Registra tu primera venta", desc: "Vende un servicio y gana tu primera comisión." },
  { id: 4, title: "Cobra tus comisiones", desc: "Las comisiones se liberan automáticamente tras el periodo de retención." },
];

export default function VendorDashboard() {
  const { sales, commissions, currentVendorId } = useDemo();
  const [showTutorial, setShowTutorial] = useState(true);
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
  const totalSalesAmount = vendorSales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + s.grossAmount, 0);
  const heldCommissions = vendorCommissions.filter(c => c.status === 'HELD').reduce((a, c) => a + c.amountCOP, 0);
  const releasedCommissions = vendorCommissions.filter(c => c.status === 'RELEASED').reduce((a, c) => a + c.amountCOP, 0);
  const refundedCount = vendorSales.filter(s => s.status === 'REFUNDED').length;
  const conversionRate = totalSales > 0 ? Math.round((totalSales / (totalSales + refundedCount)) * 100) : 0;

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === vendorId && l.status === 'active')
    .map(l => l.companyId);

  const linkedCompanies = companies.filter(c => linkedCompanyIds.includes(c.id));

  // 2 featured offers: highest commission services from ALL companies
  const featuredOffers = (() => {
    const activeServices = allServices.filter(s => s.status === 'activo');
    if (!activeServices.length) return [];
    return activeServices
      .map(s => ({
        ...s,
        earningsPerSale: Math.round(s.priceCOP * s.vendorCommissionPct / 100),
        company: companies.find(c => c.id === s.companyId),
      }))
      .sort((a, b) => b.earningsPerSale - a.earningsPerSale)
      .slice(0, 2);
  })();

  // Tutorial progress: check actual completion
  const completedSteps = (() => {
    let steps = 0;
    if (linkedCompanies.length > 0) steps++;
    // Check if any training completed
    // For new user this will be 0
    if (totalSales > 0) steps++;
    if (releasedCommissions > 0) steps++;
    return steps;
  })();

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground text-sm font-light">Buenos días</p>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mt-0.5">
            {firstName}
          </h1>
        </motion.div>

        {/* Balance Card */}
        <Link to="/vendor/payments">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-foreground p-5 text-background cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all group"
          >
            <p className="text-[10px] font-light opacity-60 tracking-wide uppercase">Comisiones del mes</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
              {formatCOP(commissionsThisMonth)}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-[11px] opacity-70">
                <span>{formatCOP(heldCommissions)} retenidas</span>
                <span>{formatCOP(releasedCommissions)} liberadas</span>
              </div>
              <span className="text-[10px] opacity-40 group-hover:opacity-70 transition-opacity flex items-center gap-1">
                Ver pagos <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        </Link>

        {/* KPIs — uniform height */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Ventas", value: formatCOP(totalSalesAmount), trend: totalSales > 0 ? `+${totalSales}` : "—", up: totalSales > 0 },
            { label: "Transacciones", value: String(totalSales), trend: totalSales > 0 ? `+${totalSales}` : "—", up: totalSales > 0 },
            { label: "Retención", value: totalSales > 0 ? `${conversionRate}%` : "—", trend: conversionRate >= 80 ? "Excelente" : (totalSales > 0 ? "Mejorar" : "—"), up: conversionRate >= 80 || totalSales === 0 },
            { label: "Devoluciones", value: String(refundedCount), trend: refundedCount === 0 ? "Perfecto" : `-${refundedCount}`, up: refundedCount === 0 },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between min-h-[88px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight truncate">{kpi.label}</p>
              <p className="text-lg font-semibold text-foreground tracking-tight mt-1 truncate">{kpi.value}</p>
              <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${kpi.up ? 'text-emerald-500' : 'text-destructive'}`}>
                {kpi.trend !== "—" && (kpi.up ? <ArrowUpRight className="w-3 h-3 flex-shrink-0" /> : <ArrowDownRight className="w-3 h-3 flex-shrink-0" />)}
                <span className="truncate">{kpi.trend}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tutorial */}
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Primeros pasos</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{completedSteps} de {tutorialSteps.length} completados</p>
              </div>
              <button onClick={() => setShowTutorial(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / tutorialSteps.length) * 100}%` }}
              />
            </div>
            <div className="space-y-2.5">
              {tutorialSteps.map((step, i) => {
                const done = i < completedSteps;
                return (
                  <div key={step.id} className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-medium leading-tight ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {step.title}
                      </p>
                      {!done && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{step.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Featured Offers */}
        {featuredOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-sm font-medium text-foreground">Ofertas destacadas</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredOffers.map((offer, i) => (
                <Link
                  key={offer.id}
                  to={`/vendor/company/${offer.companyId}`}
                  className="block rounded-2xl border border-border bg-card overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.99] transition-all duration-300"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={industryCover[offer.company?.industry || '']}
                      alt={offer.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white/50 text-[9px] uppercase tracking-widest truncate">{offer.company?.name}</p>
                      <h3 className="text-white font-semibold text-sm mt-0.5 leading-snug line-clamp-1">{offer.name}</h3>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-primary">
                        {formatCOP(offer.earningsPerSale)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">por venta</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Fácil de vender", "Alta demanda", "Material incluido", "Soporte incluido"].map((p, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <Check className="w-2.5 h-2.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-[9px] text-muted-foreground leading-tight">{p}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-border">
                      <span className="text-[9px] text-muted-foreground truncate">
                        {formatCOP(offer.priceCOP)} · {offer.vendorCommissionPct}%
                      </span>
                      <span className="text-[10px] font-medium text-primary flex items-center gap-0.5 group-hover:underline flex-shrink-0">
                        Ver <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* My Companies */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">Mis empresas</p>
            <Link to="/vendor/products" className="text-[10px] font-medium text-primary flex items-center gap-0.5 hover:underline">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {linkedCompanies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {linkedCompanies.map((company, i) => {
                const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
                const companySalesCount = vendorSales.filter(s => s.companyId === company.id && s.status !== 'REFUNDED').length;
                const pc = planConfig[company.plan];
                const cover = industryCover[company.industry];

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.27 + 0.04 * i }}
                  >
                    <Link
                      to={`/vendor/company/${company.id}`}
                      className="block rounded-2xl border border-border bg-card overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={cover}
                          alt={company.industry}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20"
                              style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                            >
                              <span className="text-white font-semibold text-sm">{company.name[0]}</span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-white font-semibold text-sm truncate">{company.name}</h3>
                              <p className="text-white/50 text-[10px] truncate">{company.industry}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {companyServices.length}
                          </span>
                          <span>{companySalesCount} ventas</span>
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0 gap-0.5 font-medium">
                            <pc.icon className="w-2.5 h-2.5" />
                            {pc.label}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Entrar <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Aún no tienes empresas activas</p>
              <p className="text-xs text-muted-foreground">Explora las empresas disponibles y empieza a vender.</p>
            </div>
          )}
        </motion.div>
      </div>
    </VendorTabLayout>
  );
}
