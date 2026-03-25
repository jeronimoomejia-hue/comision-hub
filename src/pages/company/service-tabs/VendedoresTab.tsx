import { Badge } from "@/components/ui/badge";
import { Users, Star, Clock, UserCheck, BookOpen } from "lucide-react";
import { vendors, formatCOP } from "@/data/mockData";

export default function VendedoresTab({ service, serviceSales, trainingProgress, allVendorIds }: any) {
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const vendorData = Array.from(allVendorIds as Set<string>).map(vendorId => {
    const vendor = vendors.find(v => v.id === vendorId);
    const vSales = serviceSales.filter((s: any) => s.vendorId === vendorId);
    const monthSales = vSales.filter((s: any) => new Date(s.createdAt) >= monthAgo);
    const training = trainingProgress.find((tp: any) => tp.vendorId === vendorId && tp.serviceId === service.id);
    const gmv = monthSales.reduce((sum: number, s: any) => sum + (s.amountCOP || s.grossAmount), 0);
    const activeSubs = vSales.filter((s: any) => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length;
    const trainingStatus = training?.status === 'declared_completed' ? 'completada'
      : training?.status === 'in_progress' ? 'en progreso' : 'pendiente';
    return { id: vendorId, name: vendor?.name || vendorId, email: vendor?.email || '', salesMonth: monthSales.length, totalSales: vSales.length, gmv, activeSubs, trainingStatus };
  }).sort((a, b) => b.salesMonth - a.salesMonth);

  const statusColors: Record<string, string> = {
    completada: 'bg-emerald-500/10 text-emerald-600',
    'en progreso': 'bg-amber-500/10 text-amber-600',
    pendiente: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{vendorData.length} vendedor{vendorData.length !== 1 ? 'es' : ''} vinculados</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{vendorData.filter(v => v.trainingStatus === 'completada').length}</p>
          <p className="text-[10px] text-muted-foreground">Capacitados</p>
        </div>
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{vendorData.filter(v => v.salesMonth > 0).length}</p>
          <p className="text-[10px] text-muted-foreground">Con ventas/mes</p>
        </div>
        <div className="p-3 rounded-xl border text-center bg-primary/5 border-primary/20">
          <p className="text-2xl font-bold text-primary">{formatCOP(vendorData.reduce((s, v) => s + v.gmv, 0))}</p>
          <p className="text-[10px] text-muted-foreground">GMV total/mes</p>
        </div>
      </div>

      {vendorData.length > 0 ? (
        <div className="space-y-2">
          {vendorData.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 && v.salesMonth > 0 ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                  {i === 0 && v.salesMonth > 0 ? <Star className="w-4 h-4 text-amber-500" fill="currentColor" /> : <span className="text-xs font-bold text-primary">{v.name.split(' ').map((n: string) => n[0]).join('')}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">{v.email}</p>
                </div>
                <Badge className={`text-[9px] border-0 ${statusColors[v.trainingStatus]}`}>
                  {v.trainingStatus === 'completada' ? <><UserCheck className="w-2.5 h-2.5 mr-0.5" /> Capacitado</> :
                   v.trainingStatus === 'en progreso' ? <><BookOpen className="w-2.5 h-2.5 mr-0.5" /> En progreso</> :
                   <><Clock className="w-2.5 h-2.5 mr-0.5" /> Pendiente</>}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><p className="text-sm font-bold">{v.salesMonth}</p><p className="text-[9px] text-muted-foreground">Ventas/mes</p></div>
                <div className="text-center"><p className="text-sm font-bold">{v.totalSales}</p><p className="text-[9px] text-muted-foreground">Total</p></div>
                <div className="text-center"><p className="text-sm font-bold text-primary">{formatCOP(v.gmv)}</p><p className="text-[9px] text-muted-foreground">GMV/mes</p></div>
                {service.type === 'suscripción' && <div className="text-center"><p className="text-sm font-bold">{v.activeSubs}</p><p className="text-[9px] text-muted-foreground">Suscripciones</p></div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin vendedores</p>
          <p className="text-xs text-muted-foreground">Ningún vendedor ha interactuado con este servicio</p>
        </div>
      )}
    </div>
  );
}
