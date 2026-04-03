import { Link, useNavigate } from "react-router-dom";
import TutorialOverlay from "@/components/TutorialOverlay";
import { vendorDashboardTutorial } from "@/data/tutorialData";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight, ShoppingBag, DollarSign,
  ChevronDown, BarChart3, RefreshCw, Zap, Lock,
  TrendingUp, CreditCard, Star, Crown, Shield, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import {
  vendors, companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, formatCOP
} from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

  const activeServices = vendorServices.filter(s => s.isActive);
  const inactiveServices = vendorServices.filter(s => !s.isActive);

  // Simulated private offers (higher commission)
  const privateOffers = vendorServices.filter(s => s.vendorCommissionPct >= 25).slice(0, 2);

  const [showMetrics, setShowMetrics] = useState(false);

  const greetingTime = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos dias";
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

  const renderServiceCard = (service: typeof vendorServices[0], showPrivateBadge = false) => {
    const coverImg = categoryCovers[service.category];
    const isRecurring = service.type === 'suscripción';

    return (
      <div
        key={service.id}
        onClick={() => navigate(`/vendor/company/${service.companyId}/service/${service.id}`)}
        className={`rounded-2xl border bg-card overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-300 ${
          !service.isActive ? 'opacity-60 border-border' : showPrivateBadge ? 'border-amber-300/50' : 'border-border hover:border-primary/20'
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {!service.isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button
                size="sm"
                variant="secondary"
                className="text-[10px] h-7 rounded-full gap-1"
                onClick={(e) => { e.stopPropagation(); navigate(`/vendor/company/${service.companyId}/service/${service.id}`); }}
              >
                <Lock className="w-2.5 h-2.5" /> Activar
              </Button>
            </div>
          )}

          {showPrivateBadge && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white">
                <Star className="w-2 h-2" /> Oferta privada
              </span>
            </div>
          )}

          <div className="absolute top-2 left-2">
            {isRecurring ? (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/90 text-white">
                <RefreshCw className="w-2 h-2" /> Mensual
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                <Zap className="w-2 h-2" /> Unico
              </span>
            )}
          </div>

          <div className="absolute bottom-2 right-2">
            <p className="text-sm font-bold text-white drop-shadow-md">{formatCOP(service.earningsPerSale)}</p>
          </div>
        </div>

        <div className="p-3 space-y-1.5">
          <h3 className="font-semibold text-xs text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground truncate">{service.company?.name}</p>
            <span className="text-[9px] text-primary font-medium flex-shrink-0">
              {service.vendorCommissionPct}%
            </span>
          </div>
          {service.salesCount > 0 && (
            <p className="text-[9px] text-muted-foreground">{service.salesCount} venta{service.salesCount !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <VendorTabLayout>
       <div className="space-y-6">
        <TutorialOverlay pageId="vendor-dashboard" steps={vendorDashboardTutorial} />
        {/* Greeting — more spacing */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">{greetingTime}</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">{firstName}</h1>
        </div>

        {/* Balance card */}
        <Link to="/vendor/payments">
          <div className="rounded-2xl bg-foreground p-5 text-background hover:opacity-95 active:scale-[0.99] transition-all">
            <p className="text-[9px] opacity-50 tracking-wide uppercase">Comisiones del mes</p>
            <p className="text-3xl font-bold tracking-tight mt-2">{formatCOP(commissionsThisMonth)}</p>
            <div className="flex items-center gap-4 text-[10px] opacity-60 mt-3">
              <span>{formatCOP(heldCommissions)} en devolucion</span>
              <span>{formatCOP(releasedCommissions)} liberadas</span>
            </div>
          </div>
        </Link>

        {/* Quick metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-sm font-bold text-foreground">{totalSales}</p>
            <p className="text-[9px] text-muted-foreground">Ventas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-sm font-bold text-foreground">{formatCOP(heldCommissions)}</p>
            <p className="text-[9px] text-muted-foreground">En devolucion</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-sm font-bold text-foreground">{formatCOP(releasedCommissions)}</p>
            <p className="text-[9px] text-muted-foreground">Disponible</p>
          </div>
        </div>

        {/* Metrics toggle */}
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
        >
          <BarChart3 className="w-3 h-3" />
          <span>Ver metricas</span>
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Ventas brutas", value: formatCOP(totalSalesAmount) },
                    { label: "Conversion", value: totalSales > 0 ? `${conversionRate}%` : "--" },
                    { label: "Devoluciones", value: String(refundedCount) },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Private Offers — highlighted section */}
        {privateOffers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">Ofertas privadas</p>
              <Badge variant="outline" className="text-[8px] border-amber-300/50 text-amber-600">Comision alta</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {privateOffers.map(s => renderServiceCard(s, true))}
            </div>
          </div>
        )}

        {/* Active Products */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Mis productos activos</p>
            <Link to="/vendor/products" className="text-[10px] font-medium text-primary flex items-center gap-0.5 hover:underline">
              Explorar <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {activeServices.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeServices.slice(0, 8).map(s => renderServiceCard(s))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <ShoppingBag className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">Sin productos activos</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Explora el catalogo y activa tu primer producto</p>
              <Link to="/vendor/products">
                <Button size="sm" variant="outline" className="mt-3 text-[10px] h-7">Explorar</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Inactive / pending activation */}
        {inactiveServices.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Pendientes de activacion</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {inactiveServices.slice(0, 4).map(s => renderServiceCard(s))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 pb-4">
          <Link to="/vendor/support" className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Soporte</span>
          </Link>
          <Link to="/vendor/crm" className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Mis clientes</span>
          </Link>
        </div>
      </div>
    </VendorTabLayout>
  );
}
