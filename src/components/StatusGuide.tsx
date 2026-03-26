import { Send, Clock, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

const STATUS_ITEMS = [
  { icon: Send, label: 'Pendiente', desc: 'Link enviado, esperando pago', color: 'text-blue-600' },
  { icon: Clock, label: 'Tiempo de devolución', desc: 'Pagado. El cliente puede pedir devolución durante este periodo', color: 'text-amber-600' },
  { icon: CheckCircle2, label: 'Completada', desc: 'Dinero liberado a tu cuenta', color: 'text-emerald-600' },
  { icon: RotateCcw, label: 'Devuelta', desc: 'Reembolso al cliente', color: 'text-red-500' },
  { icon: XCircle, label: 'Cancelada', desc: 'Link expirado o rechazado', color: 'text-muted-foreground' },
];

export default function StatusGuide() {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estados de transacción</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {STATUS_ITEMS.map(item => (
          <div key={item.label} className="flex items-start gap-2 p-2 rounded-xl bg-card border border-border/50">
            <item.icon className={`w-3.5 h-3.5 ${item.color} mt-0.5 flex-shrink-0`} />
            <div>
              <p className="text-[11px] font-medium text-foreground">{item.label}</p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
