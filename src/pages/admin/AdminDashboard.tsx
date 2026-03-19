import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { 
  vendors, companies, formatCOP, formatDate
} from "@/data/mockData";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const { sales, commissions, services, vendorPayments, companyPayments } = useDemo();
  
  const today = new Date();
  const thisMonth = today.toISOString().slice(0, 7);
  
  const totalGMV = sales.reduce((acc, s) => acc + (s.amountCOP || s.grossAmount || 0), 0);
  const salesThisMonth = sales.filter(s => s.createdAt.startsWith(thisMonth));
  const gmvThisMonth = salesThisMonth.reduce((a, s) => a + (s.amountCOP || s.grossAmount || 0), 0);
  const platformRevenue = sales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + (s.mensualistaFeeAmount || 0), 0);
  
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const activeServices = services.filter(s => s.status === 'activo').length;
  
  const heldAmount = sales.filter(s => s.status === 'HELD').reduce((a, s) => a + (s.amountCOP || 0), 0);
  const releasedAmount = sales.filter(s => s.status === 'RELEASED').reduce((a, s) => a + (s.amountCOP || 0), 0);
  const refundedCount = sales.filter(s => s.status === 'REFUNDED').length;
  
  const failedPayments = vendorPayments.filter(p => p.status === 'falló').length +
    companyPayments.filter(p => p.status === 'falló').length;

  // Revenue trend (6 months)
  const revenueTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('es-CO', { month: 'short' });
    const fee = sales.filter(s => s.createdAt.startsWith(key) && s.status !== 'REFUNDED').reduce((a, s) => a + (s.mensualistaFeeAmount || 0), 0);
    return { mes: label, revenue: fee };
  });

  // Recent sales
  const recentSales = sales.slice(0, 6);

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "text-amber-600 bg-amber-50", label: "Retenida" },
      'RELEASED': { cls: "text-emerald-600 bg-emerald-50", label: "Liberada" },
      'REFUNDED': { cls: "text-red-600 bg-red-50", label: "Devuelta" },
    };
    return map[status] || { cls: "text-muted-foreground bg-muted", label: status };
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-5">
        {/* Revenue */}
        <div className="rounded-2xl bg-[#F4F0FA] p-5">
          <p className="text-xs text-muted-foreground">Revenue plataforma (total)</p>
          <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: 'hsl(var(--primary))' }}>
            {formatCOP(platformRevenue)}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>GMV total: {formatCOP(totalGMV)}</span>
            <span>GMV mes: {formatCOP(gmvThisMonth)}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: "Vendedores", value: activeVendors },
            { label: "Empresas", value: activeCompanies },
            { label: "Gigs", value: activeServices },
            { label: "Ventas mes", value: salesThisMonth.length },
            { label: "Devoluciones", value: refundedCount },
            { label: "Pagos fallidos", value: failedPayments },
          ].map(stat => (
            <div key={stat.label} className="text-center p-2.5 rounded-xl border border-border bg-card">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <p className="text-[10px] text-amber-700 uppercase tracking-wide">En retención</p>
            <p className="text-lg font-bold text-amber-700 mt-0.5">{formatCOP(heldAmount)}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
            <p className="text-[10px] text-emerald-700 uppercase tracking-wide">Liberado</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{formatCOP(releasedAmount)}</p>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Revenue mensual</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [formatCOP(value), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Últimas transacciones</p>
            <Link to="/admin/transactions" className="text-xs text-primary hover:underline">Ver live</Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentSales.map(sale => {
              const service = services.find(s => s.id === sale.serviceId);
              const company = companies.find(c => c.id === sale.companyId);
              const sc = getStatusConfig(sale.status);
              return (
                <div key={sale.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{sale.clientName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {company?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{formatCOP(sale.amountCOP || sale.grossAmount)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Vendedores", sub: "Gestionar red", href: "/admin/vendors" },
            { label: "Empresas", sub: "Ver empresas", href: "/admin/companies" },
            { label: "Pagos", sub: "Monitorear", href: "/admin/payments" },
          ].map(item => (
            <Link key={item.href} to={item.href}>
              <div className="rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors text-center">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}