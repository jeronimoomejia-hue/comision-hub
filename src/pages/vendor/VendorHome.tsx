import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, UserX, Building2, 
  ChevronRight, LogOut, Bell, Plus, Search,
  TrendingUp, Star, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/contexts/DemoContext";
import { 
  vendors, companies, services, CURRENT_VENDOR_ID, formatCOP 
} from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import logoMensualista from "@/assets/logo.png";

export default function VendorHome() {
  const navigate = useNavigate();
  const { sales, commissions, currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === (currentVendorId || CURRENT_VENDOR_ID));
  const firstName = vendor?.name.split(' ')[0] || 'Vendedor';

  const thisMonth = new Date().toISOString().slice(0, 7);
  const vendorCommissions = commissions.filter(c => c.vendorId === CURRENT_VENDOR_ID);
  const commissionsThisMonth = vendorCommissions
    .filter(c => c.createdAt.startsWith(thisMonth) && c.status !== 'REFUNDED')
    .reduce((a, c) => a + c.amountCOP, 0);

  const vendorSales = sales.filter(s => s.vendorId === CURRENT_VENDOR_ID);
  const totalSalesAccum = vendorSales
    .filter(s => s.status !== 'REFUNDED')
    .reduce((a, s) => a + s.grossAmount, 0);

  const activeSalesCount = vendorSales.filter(s => s.status !== 'REFUNDED').length;
  const cancelledClients = vendorSales.filter(s => s.status === 'REFUNDED').length;

  // Top 3 services by sales
  const serviceSalesCounts = vendorSales
    .filter(s => s.status !== 'REFUNDED')
    .reduce<Record<string, number>>((acc, s) => {
      acc[s.serviceId] = (acc[s.serviceId] || 0) + 1;
      return acc;
    }, {});

  const topServices = Object.entries(serviceSalesCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([serviceId, count]) => {
      const service = services.find(s => s.id === serviceId);
      const company = companies.find(c => c.id === service?.companyId);
      return { service, company, count };
    })
    .filter(t => t.service);

  const vendorCompanyIds = [...new Set(vendorSales.map(s => s.companyId))];
  const activeCompanies = companies.filter(c => vendorCompanyIds.includes(c.id));
  const otherCompanies = companies.filter(c => !vendorCompanyIds.includes(c.id)).slice(0, 4);

  const handleSelectCompany = (companyId: string) => {
    navigate(`/vendor/company/${companyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 relative">
              <img src={logoMensualista} alt="Mensualista" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">Mensualista</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{firstName[0]}</span>
              </div>
              <span className="text-sm font-medium hidden sm:block">{firstName}</span>
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
        {/* Greeting + Month badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Hola, {firstName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Tu resumen de actividad</p>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </Badge>
          </div>
        </motion.div>

        {/* === TOP DASHBOARD: KPIs + Top Services side by side === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8"
        >
          {/* Left: KPI column */}
          <div className="lg:col-span-2 space-y-3">
            {/* Main KPI - Commissions */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Comisiones del mes</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatCOP(commissionsThisMonth)}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-[11px] text-primary font-medium">{activeSalesCount} ventas activas</span>
              </div>
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Ventas totales</span>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCOP(totalSalesAccum)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <UserX className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Cancelados</span>
                </div>
                <p className="text-lg font-bold text-foreground">{cancelledClients}</p>
              </div>
            </div>
          </div>

          {/* Right: Top Services */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Productos top</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Por ventas</span>
            </div>

            {topServices.length > 0 ? (
              <div className="space-y-2.5">
                {topServices.map(({ service, company, count }, i) => {
                  const coverImg = categoryCovers[service!.category];
                  const earnings = Math.round(service!.priceCOP * service!.vendorCommissionPct / 100);
                  return (
                    <button
                      key={service!.id}
                      onClick={() => navigate(`/vendor/company/${service!.companyId}/service/${service!.id}`)}
                      className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                    >
                      {/* Rank */}
                      <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                      
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={coverImg} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {service!.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {company?.name} · {formatCOP(earnings)} por venta
                        </p>
                      </div>

                      {/* Sales count */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-foreground">{count}</p>
                        <p className="text-[9px] text-muted-foreground">ventas</p>
                      </div>

                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Aún no tienes ventas registradas</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Companies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-base font-semibold mb-3 text-foreground">Tus empresas activas</h2>
          {activeCompanies.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {activeCompanies.map(company => {
                const companyServices = services.filter(s => s.companyId === company.id && s.status === 'activo');
                const companySales = vendorSales.filter(s => s.companyId === company.id && s.status !== 'REFUNDED');
                return (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group w-full"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                    >
                      <span className="text-white font-bold text-base">{company.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{company.name}</p>
                      <p className="text-[11px] text-muted-foreground">{companyServices.length} productos · {companySales.length} ventas</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Aún no tienes empresas activas</p>
              <p className="text-sm text-muted-foreground mb-4">Explora las empresas disponibles y empieza a vender.</p>
            </div>
          )}
        </motion.div>

        {/* Recommended Companies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Empresas recomendadas
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherCompanies.map(company => {
              const companyServices = services.filter(s => s.companyId === company.id && s.status === 'activo');
              return (
                <div
                  key={company.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                  >
                    <span className="text-white font-bold">{company.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.industry} · {companyServices.length} productos</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">
                    <Plus className="w-3 h-3 mr-1" /> Unirte
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
