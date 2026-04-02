import { useMemo } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate, services as allServices, companies } from "@/data/mockData";
import { Wallet, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function VendorSubscriptions() {
  const { subscriptions, currentVendorId } = useDemo();

  const mySubs = useMemo(
    () => subscriptions.filter(s => s.vendorId === currentVendorId && s.status === "active"),
    [subscriptions, currentVendorId]
  );

  const totalMonthly = mySubs.reduce((a, s) => a + s.monthlyCommissionCOP, 0);

  // Mock trend data (ascending to motivate)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString("es-CO", { month: "short" });
    const base = totalMonthly * 0.4;
    const growth = (totalMonthly - base) / 5;
    return { name: label.charAt(0).toUpperCase() + label.slice(1), ingreso: Math.round(base + growth * i) };
  });

  return (
    <VendorTabLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold text-foreground">Mi cartera de ingresos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Suscripciones activas que generan ingresos recurrentes</p>
        </div>

        {/* Main KPI */}
        <div className="rounded-2xl bg-foreground p-5 text-background">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 opacity-50" />
            <span className="text-[10px] opacity-50 uppercase tracking-wide">Ingreso mensual recurrente</span>
          </div>
          <p className="text-3xl font-bold tracking-tight">{formatCOP(totalMonthly)}</p>
          <p className="text-[10px] opacity-60 mt-1">{mySubs.length} suscripciones activas</p>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3 h-3 text-primary" /> Evolución · 6 meses
          </p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 10, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                  formatter={(v: number) => [formatCOP(v), "Ingreso"]}
                />
                <Line type="monotone" dataKey="ingreso" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscriptions list */}
        <div className="space-y-2">
          {mySubs.map(sub => {
            const service = allServices.find(s => s.id === sub.serviceId);
            const company = service ? companies.find(c => c.id === service.companyId) : null;
            const daysUntilNext = Math.max(0, Math.ceil((new Date(sub.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

            return (
              <div key={sub.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{sub.clientName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{service?.name} · {company?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-primary">{formatCOP(sub.monthlyCommissionCOP)}</p>
                    <p className="text-[9px] text-muted-foreground">/mes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Desde {formatDate(sub.startDate)}
                  </span>
                  <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-600 border-0">
                    <RefreshCw className="w-2 h-2 mr-0.5" /> Cobro en {daysUntilNext}d
                  </Badge>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-0">
                    {sub.daysActive}d activa
                  </Badge>
                </div>
              </div>
            );
          })}
          {mySubs.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Sin suscripciones activas</p>
              <p className="text-xs text-muted-foreground mt-0.5">Vende servicios recurrentes para generar ingresos mensuales</p>
            </div>
          )}
        </div>

        {/* Total */}
        {mySubs.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{mySubs.length} suscripciones activas</span>
            <span className="text-sm font-bold text-foreground">Total: {formatCOP(totalMonthly)}/mes</span>
          </div>
        )}
      </div>
    </VendorTabLayout>
  );
}
