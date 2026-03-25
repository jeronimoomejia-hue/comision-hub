import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, UserX, Building2, 
  ChevronRight, Plus, Search, Package, TrendingUp,
  BookOpen, Crown, Zap, BarChart3, Clock, CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { 
  vendors, companies, services as allServices, vendorCompanyLinks,
  CURRENT_VENDOR_ID, formatCOP, CompanyPlan
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const planBadge: Record<CompanyPlan, { label: string; icon: React.ElementType }> = {
  freemium: { label: "Free", icon: Zap },
  premium: { label: "Premium", icon: Crown },
  enterprise: { label: "Enterprise", icon: Building2 },
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { sales, commissions, trainingProgress, currentVendorId } = useDemo();
  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const vendor = vendors.find(v => v.id === vendorId);
  const firstName = vendor?.name.split(' ')[0] || 'Vendedor';

  // Global KPIs
  const vendorSales = sales.filter(s => s.vendorId === vendorId);
  const vendorCommissions = commissions.filter(c => c.vendorId === vendorId);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const commissionsThisMonth = vendorCommissions
    .filter(c => c.createdAt.startsWith(thisMonth) && c.status !== 'REFUNDED')
    .reduce((a, c) => a + c.amountCOP, 0);

  const totalSalesAccum = vendorSales
    .filter(s => s.status !== 'REFUNDED')
    .reduce((a, s) => a + s.grossAmount, 0);

  const cancelledClients = vendorSales.filter(s => s.status === 'REFUNDED').length;

  const heldCommissions = vendorCommissions.filter(c => c.status === 'HELD').reduce((a, c) => a + c.amountCOP, 0);
  const releasedCommissions = vendorCommissions.filter(c => c.status === 'RELEASED').reduce((a, c) => a + c.amountCOP, 0);

  // Companies the vendor is linked to
  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === vendorId && l.status === 'active')
    .map(l => l.companyId);
  
  const linkedCompanies = companies.filter(c => linkedCompanyIds.includes(c.id));
  const otherCompanies = companies.filter(c => !linkedCompanyIds.includes(c.id)).slice(0, 4);

  // Weekly chart
  const today = new Date();
  const weeklyCommissions = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekComms = vendorCommissions.filter(c => {
      const d = new Date(c.createdAt);
      return d >= weekStart && d < weekEnd && c.status !== 'REFUNDED';
    });
    return { week: `S${i + 1}`, comisiones: weekComms.reduce((a, c) => a + c.amountCOP, 0) };
  });

  // Recent sales
  const recentSales = vendorSales.slice(0, 4).map(sale => {
    const svc = allServices.find(s => s.id === sale.serviceId);
    const company = companies.find(c => c.id === sale.companyId);
    return { ...sale, serviceName: svc?.name || '', companyName: company?.name || '', companyColor: company?.primaryColor };
  });

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "bg-amber-50 text-amber-600", label: "Retenida" },
      'RELEASED': { cls: "bg-emerald-50 text-emerald-600", label: "Liberada" },
      'REFUNDED': { cls: "bg-red-50 text-red-600", label: "Devuelta" },
    };
    return map[status] || { cls: "bg-muted text-muted-foreground", label: status };
  };

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        {/* Hero Greeting + Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary/5 p-5 sm:p-6 border border-border"
        >
          <p className="text-sm text-muted-foreground">Hola, {firstName} 👋</p>
          <p className="text-[10px] text-muted-foreground mt-1">Comisiones del mes</p>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight mt-1" style={{ color: 'hsl(var(--primary))' }}>
            {formatCOP(commissionsThisMonth)}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              {formatCOP(heldCommissions)} retenidas
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {formatCOP(releasedCommissions)} liberadas
            </span>
          </div>
        </motion.div>

        {/* Quick KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ventas totales", value: formatCOP(totalSalesAccum), icon: ShoppingCart, color: "text-emerald-600" },
            { label: "Ventas mes", value: String(vendorSales.filter(s => s.createdAt.startsWith(thisMonth)).length), icon: TrendingUp, color: "text-primary" },
            { label: "Cancelados", value: String(cancelledClients), icon: UserX, color: "text-destructive" },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground">{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* My Companies — the "restaurants" */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Mis empresas
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {linkedCompanies.map(company => {
              const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
              const companySales = vendorSales.filter(s => s.companyId === company.id && s.status !== 'REFUNDED');
              const companyComm = vendorCommissions.filter(c => {
                const sale = vendorSales.find(s => s.id === c.saleId);
                return sale?.companyId === company.id && c.status !== 'REFUNDED';
              }).reduce((a, c) => a + c.amountCOP, 0);
              const pb = planBadge[company.plan];

              return (
                <Link
                  key={company.id}
                  to={`/vendor/company/${company.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
                  >
                    <span className="text-white font-bold text-lg">{company.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">{company.name}</p>
                      <Badge variant="outline" className="text-[8px] gap-0.5 px-1.5 py-0">
                        <pb.icon className="w-2.5 h-2.5" />
                        {pb.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {companyServices.length} servicios · {companySales.length} ventas · {formatCOP(companyComm)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Discover companies */}
        {otherCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Empresas recomendadas
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {otherCompanies.map(company => {
                const companyServices = allServices.filter(s => s.companyId === company.id && s.status === 'activo');
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
        )}

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Comisiones por semana
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyCommissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} 
                formatter={(value: number) => [formatCOP(value), 'Comisión']} 
              />
              <Bar dataKey="comisiones" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Actividad reciente</h3>
            <Link to="/vendor/sales" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentSales.length > 0 ? recentSales.map(sale => {
              const sc = getStatusConfig(sale.status);
              return (
                <div key={sale.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (sale.companyColor || 'hsl(var(--primary))') + '20' }}
                    >
                      <span className="text-xs font-bold" style={{ color: sale.companyColor || 'hsl(var(--primary))' }}>
                        {sale.companyName[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{sale.clientName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{sale.companyName} · {sale.serviceName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold">{formatCOP(sale.sellerCommissionAmount)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Sin ventas recientes</p>
            )}
          </div>
        </motion.div>
      </div>
    </VendorTabLayout>
  );
}
