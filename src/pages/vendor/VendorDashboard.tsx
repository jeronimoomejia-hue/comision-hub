import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, ChevronRight, Plus, Search, TrendingUp,
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
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// Company cover images
import insuranceCover from "@/assets/company-covers/insurance-ai.jpg";
import legalCover from "@/assets/company-covers/legal-ai.jpg";
import marketingCover from "@/assets/company-covers/marketing-ai.jpg";
import salesCover from "@/assets/company-covers/sales-ai.jpg";
import supportCover from "@/assets/company-covers/support-ai.jpg";
import accountingCover from "@/assets/company-covers/accounting-ai.jpg";
import hrCover from "@/assets/company-covers/hr-ai.jpg";
import securityCover from "@/assets/company-covers/security-ai.jpg";

const industryCover: Record<string, string> = {
  'IA para Seguros': insuranceCover,
  'IA Legal': legalCover,
  'IA para Marketing': marketingCover,
  'IA para Ventas': salesCover,
  'IA para Atención': supportCover,
  'IA para Contabilidad': accountingCover,
  'IA para RRHH': hrCover,
  'IA para Ciberseguridad': securityCover,
};

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType }> = {
  freemium: { label: "Free", icon: Zap },
  premium: { label: "Premium", icon: Crown },
  enterprise: { label: "Enterprise", icon: Building2 },
};

const tutorialSteps = [
  { id: 1, title: "Explora tus empresas", desc: "Revisa el catálogo de servicios de cada empresa." },
  { id: 2, title: "Completa capacitaciones", desc: "Activa servicios completando el material de estudio." },
  { id: 3, title: "Registra tu primera venta", desc: "Vende un servicio y gana tu primera comisión." },
  { id: 4, title: "Cobra tus comisiones", desc: "Las comisiones se liberan automáticamente tras 7 días." },
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
  const otherCompanies = companies.filter(c => !linkedCompanyIds.includes(c.id)).slice(0, 3);

  // Mini chart data (last 6 weeks)
  const today = new Date();
  const weeklyData = Array.from({ length: 6 }, (_, i) => {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (5 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekComms = vendorCommissions.filter(c => {
      const d = new Date(c.createdAt);
      return d >= weekStart && d < weekEnd && c.status !== 'REFUNDED';
    });
    return { name: `S${i + 1}`, value: weekComms.reduce((a, c) => a + c.amountCOP, 0) };
  });

  // Featured offer: pick the highest-commission service from a linked company
  const featuredService = (() => {
    const activeServices = allServices.filter(s => 
      s.status === 'activo' && linkedCompanyIds.includes(s.companyId)
    );
    if (!activeServices.length) return null;
    const best = activeServices.reduce((a, b) => 
      (b.priceCOP * b.vendorCommissionPct) > (a.priceCOP * a.vendorCommissionPct) ? b : a
    );
    const company = companies.find(c => c.id === best.companyId);
    return { ...best, companyName: company?.name || '', companyColor: company?.primaryColor, companyIndustry: company?.industry || '' };
  })();

  // Tutorial progress (mock: first 2 done)
  const completedSteps = 2;

  return (
    <VendorTabLayout>
      <div className="space-y-8">
        {/* Greeting — ultra clean */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground text-sm font-light">Buenos días</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mt-0.5">
            {firstName}
          </h1>
        </motion.div>

        {/* Balance Card — Apple Wallet style */}
        <Link to="/vendor/payments">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-foreground p-6 text-background cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all group"
          >
            <p className="text-xs font-light opacity-60 tracking-wide uppercase">Comisiones del mes</p>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1">
              {formatCOP(commissionsThisMonth)}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-6 text-xs opacity-70">
                <span>{formatCOP(heldCommissions)} retenidas</span>
                <span>{formatCOP(releasedCommissions)} liberadas</span>
              </div>
              <span className="text-[10px] opacity-40 group-hover:opacity-70 transition-opacity flex items-center gap-1">
                Ver pagos <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        </Link>

        {/* KPIs Row — minimal */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Ventas totales", value: formatCOP(totalSalesAmount), trend: "+12%", up: true },
            { label: "Transacciones", value: String(totalSales), trend: "+3", up: true },
            { label: "Tasa de retención", value: `${conversionRate}%`, trend: conversionRate >= 80 ? "Excelente" : "Mejorar", up: conversionRate >= 80 },
            { label: "Devoluciones", value: String(refundedCount), trend: refundedCount === 0 ? "Perfecto" : `-${refundedCount}`, up: refundedCount === 0 },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <p className="text-xl font-semibold text-foreground mt-1 tracking-tight">{kpi.value}</p>
              <div className={`flex items-center gap-0.5 mt-1.5 text-[10px] font-medium ${kpi.up ? 'text-emerald-500' : 'text-destructive'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mini Chart — Apple Health style */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-foreground">Ingresos semanales</p>
            <p className="text-[10px] text-muted-foreground">Últimas 6 semanas</p>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <Tooltip
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  boxShadow: 'none'
                }}
                formatter={(value: number) => [formatCOP(value), '']}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={1.5} 
                fill="url(#areaGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Featured Offer — detailed */}
        {featuredService && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-medium text-foreground">Oferta destacada</p>
            </div>
            <Link
              to={`/vendor/company/${featuredService.companyId}`}
              className="block rounded-2xl border border-border bg-card overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.99] transition-all duration-300"
            >
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img 
                  src={industryCover[featuredService.companyIndustry]}
                  alt={featuredService.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  loading="lazy"
                  width={800}
                  height={512}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">{featuredService.companyName}</p>
                  <h3 className="text-white font-semibold text-base sm:text-lg mt-0.5 leading-snug">{featuredService.name}</h3>
                  <p className="text-white/60 text-[11px] mt-1.5 leading-relaxed line-clamp-2">
                    {featuredService.description}
                  </p>
                </div>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    {formatCOP(Math.round(featuredService.priceCOP * featuredService.vendorCommissionPct / 100))}
                  </span>
                  <span className="text-[10px] text-muted-foreground">comisión por venta</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Fácil de explicar al cliente",
                    "Alta demanda en el mercado",
                    "Material de venta incluido",
                    "Soporte de la empresa",
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground leading-tight">{point}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-[10px] text-muted-foreground">
                    Precio cliente: {formatCOP(featuredService.priceCOP)} · {featuredService.type === 'suscripción' ? 'Recurrente' : 'Pago único'} · {featuredService.vendorCommissionPct}% comisión
                  </span>
                  <span className="text-[10px] font-medium text-primary flex items-center gap-1 group-hover:underline">
                    Ver servicio <ChevronRight className="w-3 h-3" />
                  </span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Tutorial — progress steps */}
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">Primeros pasos</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{completedSteps} de {tutorialSteps.length} completados</p>
              </div>
              <button onClick={() => setShowTutorial(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${(completedSteps / tutorialSteps.length) * 100}%` }} 
              />
            </div>
            <div className="space-y-3">
              {tutorialSteps.map((step, i) => {
                const done = i < completedSteps;
                return (
                  <div key={step.id} className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {step.title}
                      </p>
                      {!done && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* My Companies — Clean gig cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm font-medium text-foreground mb-4">Mis empresas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {linkedCompanies.map((company, i) => {
              const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
              const companySalesCount = vendorSales.filter(s => s.companyId === company.id && s.status !== 'REFUNDED').length;
              const companyComm = vendorCommissions.filter(c => {
                const sale = vendorSales.find(s => s.id === c.saleId);
                return sale?.companyId === company.id && c.status !== 'REFUNDED';
              }).reduce((a, c) => a + c.amountCOP, 0);
              const pc = planConfig[company.plan];
              const cover = industryCover[company.industry];

              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 + 0.04 * i }}
                >
                  <Link
                    to={`/vendor/company/${company.id}`}
                    className="block rounded-2xl border border-border bg-card overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="relative h-32 sm:h-36 overflow-hidden">
                      <img 
                        src={cover} 
                        alt={company.industry} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        loading="lazy"
                        width={800}
                        height={512}
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
                            <p className="text-white/50 text-[10px]">{company.industry}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{companyServices.length} servicios</span>
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
        </motion.div>

        {/* Discover — greyed-out gig cards */}
        {otherCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm font-medium text-foreground mb-4">Descubre más empresas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {otherCompanies.map((company, i) => {
                const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
                const pc = planConfig[company.plan];
                const cover = industryCover[company.industry];

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 + 0.04 * i }}
                  >
                    <Link
                      to={`/vendor/company/${company.id}`}
                      className="block rounded-2xl border border-border bg-card overflow-hidden group hover:shadow-md transition-all duration-300 grayscale hover:grayscale-0"
                    >
                      <div className="relative h-28 sm:h-32 overflow-hidden">
                        <img 
                          src={cover} 
                          alt={company.industry} 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 opacity-60 group-hover:opacity-100"
                          loading="lazy"
                          width={800}
                          height={512}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        
                        {/* Lock overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-full bg-black/50 text-white/80 backdrop-blur-sm border border-white/10">
                            <Lock className="w-3 h-3" />
                            Unirte para acceder
                          </span>
                        </div>

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
                              <p className="text-white/50 text-[10px]">{company.industry}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>{companyServices.length} servicios</span>
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0 gap-0.5 font-medium">
                            <pc.icon className="w-2.5 h-2.5" />
                            {pc.label}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-medium text-primary group-hover:underline">
                          Unirte →
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </VendorTabLayout>
  );
}
