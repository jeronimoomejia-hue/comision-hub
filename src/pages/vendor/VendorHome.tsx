import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, UserX, Building2, 
  ChevronRight, LogOut, Bell, Plus, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/contexts/DemoContext";
import { 
  vendors, companies, services, CURRENT_VENDOR_ID, formatCOP 
} from "@/data/mockData";
import logoMensualista from "@/assets/logo-mensualista.png";

export default function VendorHome() {
  const navigate = useNavigate();
  const { sales, commissions, currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === (currentVendorId || CURRENT_VENDOR_ID));
  const firstName = vendor?.name.split(' ')[0] || 'Vendedor';

  // KPIs generales
  const thisMonth = new Date().toISOString().slice(0, 7);
  const vendorCommissions = commissions.filter(c => c.vendorId === CURRENT_VENDOR_ID);
  const commissionsThisMonth = vendorCommissions
    .filter(c => c.createdAt.startsWith(thisMonth) && c.status !== 'REFUNDED')
    .reduce((a, c) => a + c.amountCOP, 0);

  const vendorSales = sales.filter(s => s.vendorId === CURRENT_VENDOR_ID);
  const totalSalesAccum = vendorSales
    .filter(s => s.status !== 'REFUNDED')
    .reduce((a, s) => a + s.grossAmount, 0);

  const cancelledClients = vendorSales.filter(s => s.status === 'REFUNDED').length;

  // Companies the vendor is "active" in (has sales or trainings with)
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Hola, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Aquí tienes un resumen de tu actividad.</p>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-10"
        >
          {[
            { label: "Comisiones este mes", value: formatCOP(commissionsThisMonth), icon: DollarSign, color: "text-primary" },
            { label: "Ventas acumuladas", value: formatCOP(totalSalesAccum), icon: ShoppingCart, color: "text-emerald-600" },
            { label: "Clientes cancelados", value: String(cancelledClients), icon: UserX, color: "text-destructive" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Active Companies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground">Tus empresas activas</h2>
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
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                    >
                      <span className="text-white font-bold text-lg">{company.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{companyServices.length} servicios · {companySales.length} ventas</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
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
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
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
                    <p className="text-xs text-muted-foreground">{company.industry} · {companyServices.length} servicios</p>
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
