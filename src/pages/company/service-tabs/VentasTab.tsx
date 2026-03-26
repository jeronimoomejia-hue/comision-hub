import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, RotateCcw, Check, X
} from "lucide-react";
import { vendors, formatCOP } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";
import { toast } from "sonner";

export default function VentasTab({ service, serviceSales, commissions, refundRequests, updateRefundRequest }: any) {
  const [filter, setFilter] = useState('todos');
  const filters = ['todos', 'HELD', 'COMPLETED', 'REFUNDED'];
  const filterLabels: Record<string, string> = { todos: 'Todos', HELD: 'Tiempo de devolución', RELEASED: 'Liberadas', REFUNDED: 'Devueltas' };
  const filtered = filter === 'todos' ? serviceSales : serviceSales.filter((s: any) => s.status === filter);

  const pendingRefunds = refundRequests.filter((r: any) => r.serviceId === service.id && r.status === 'pendiente');

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {filterLabels[f]} ({f === 'todos' ? serviceSales.length : serviceSales.filter((s: any) => s.status === f).length})
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} venta{filtered.length !== 1 ? 's' : ''}</p>

      <StatusGuide />

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((sale: any) => {
            const vendor = vendors.find(v => v.id === sale.vendorId);
            const existingRefund = refundRequests.find((r: any) => r.saleId === sale.id);
            return (
              <TransactionCard key={sale.id} id={sale.id}
                clientName={sale.clientName} clientEmail={sale.clientEmail} clientPhone={sale.clientPhone}
                serviceName={service.name} serviceCategory={service.category}
                vendorName={vendor?.name || sale.vendorId}
                amount={sale.grossAmount} commission={sale.sellerCommissionAmount}
                platformFee={sale.mensualistaFeeAmount} netAmount={sale.providerNetAmount}
                status={sale.status} statusType="sale" date={sale.createdAt}
                holdEndDate={sale.holdEndAt} releasedDate={sale.releasedAt}
                activationCode={sale.activationCode} isSubscription={sale.isSubscription}
                paymentId={sale.mpPaymentId} refundStatus={existingRefund?.status}
                onSupport={() => toast.success("Soporte contactado")} role="company"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin ventas</p>
          <p className="text-xs text-muted-foreground">No hay ventas con este filtro</p>
        </div>
      )}

      {/* Pending refunds */}
      {pendingRefunds.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" /> Devoluciones pendientes ({pendingRefunds.length})
          </h3>
          {pendingRefunds.map((refund: any) => {
            const sale = serviceSales.find((s: any) => s.id === refund.saleId);
            const vendor = vendors.find(v => v.id === refund.vendorId);
            return (
              <div key={refund.id} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{sale?.clientName || 'Cliente'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Vendido por {vendor?.name || refund.vendorId}</p>
                    <p className="text-xs text-muted-foreground mt-1">Motivo: {refund.reason}</p>
                  </div>
                  <p className="text-sm font-bold">{formatCOP(sale?.grossAmount || 0)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-xs flex-1" onClick={() => {
                    updateRefundRequest(refund.id, { status: 'aprobado', decisionBy: 'empresa', decidedAt: new Date().toISOString().split('T')[0] });
                    toast.success("Devolución aprobada");
                  }}>
                    <Check className="w-3 h-3 mr-1" /> Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs flex-1" onClick={() => {
                    updateRefundRequest(refund.id, { status: 'rechazado', decisionBy: 'empresa', decidedAt: new Date().toISOString().split('T')[0] });
                    toast.success("Devolución rechazada");
                  }}>
                    <X className="w-3 h-3 mr-1" /> Rechazar
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
