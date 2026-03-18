import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import { companies, vendors, CURRENT_COMPANY_ID, formatCOP, formatDate, services as allServices } from "@/data/mockData";
import type { CompanyPayment } from "@/data/mockData";

export default function CompanyPayments() {
  const { companyPayments, sales, services } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [selected, setSelected] = useState<CompanyPayment | null>(null);
  
  const myPayments = companyPayments.filter(p => p.companyId === CURRENT_COMPANY_ID);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'programado': { cls: "text-amber-600 bg-amber-50", label: "Programado" },
      'enviado': { cls: "text-emerald-600 bg-emerald-50", label: "Transferido" },
      'falló': { cls: "text-red-600 bg-red-50", label: "Falló" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Pagos recibidos</h1>

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {myPayments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin transferencias aún</p>
          ) : myPayments.slice(0, 30).map(payment => {
            const service = allServices.find(s => s.id === payment.serviceId);
            const vendor = vendors.find(v => v.id === payment.vendorId);
            return (
              <div key={payment.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{service?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{vendor?.name} · {payment.clientName} · {formatDate(payment.scheduledDate)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{formatCOP(payment.amountCOP)}</span>
                  {getStatusBadge(payment.status)}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(payment)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Detalle de transferencia</DialogTitle></DialogHeader>
            {selected && (() => {
              const service = allServices.find(s => s.id === selected.serviceId);
              return (
                <div className="space-y-2 text-sm">
                  <div className="text-center py-3 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Neto transferido</p>
                    <p className="text-2xl font-bold text-primary">{formatCOP(selected.amountCOP)}</p>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Venta bruta</span><span>{formatCOP(selected.grossAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Comisión vendedor</span><span className="text-red-500">-{formatCOP(selected.vendorCommission)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fee plataforma</span><span className="text-red-500">-{formatCOP(selected.mensualistaFee)}</span></div>
                  </div>
                  {selected.status === 'falló' && selected.failureReason && (
                    <p className="text-xs text-red-600 p-2 bg-red-50 rounded-lg">{selected.failureReason}</p>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}