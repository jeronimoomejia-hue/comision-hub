import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Clock, CheckCircle2, RotateCcw, MessageCircle,
  Package, User, CreditCard, Copy, Send, XCircle, ArrowRight,
  Shield, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCOP, services as allServices } from "@/data/mockData";
import { toast } from "sonner";
import { categoryCovers } from "@/data/coverImages";

interface TransactionCardProps {
  id: string;
  clientName: string;
  clientEmail?: string;
  serviceName?: string;
  serviceCategory?: string;
  serviceId?: string;
  companyName?: string;
  vendorName?: string;
  amount: number;
  commission?: number;
  platformFee?: number;
  netAmount?: number;
  status: string;
  statusType?: 'sale' | 'payment' | 'refund';
  date: string;
  holdEndDate?: string;
  releasedDate?: string;
  activationCode?: string;
  refundDaysLeft?: number;
  refundStatus?: string;
  isSubscription?: boolean;
  paymentId?: string;
  failureReason?: string;
  refundReason?: string;
  refundDecision?: string;
  onRefund?: () => void;
  onSupport?: () => void;
  role?: 'vendor' | 'company' | 'admin';
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string; textColor: string }> = {
  'PENDING':   { icon: Send,         color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-500/10",       label: "Esperando pago",   textColor: "text-blue-700 dark:text-blue-400" },
  'HELD':      { icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-500/10",     label: "En retención",     textColor: "text-amber-700 dark:text-amber-400" },
  'COMPLETED': { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Completada",       textColor: "text-emerald-700 dark:text-emerald-400" },
  'REFUNDED':  { icon: RotateCcw,    color: "text-red-600",     bg: "bg-red-50 dark:bg-red-500/10",         label: "Devuelta",         textColor: "text-red-700 dark:text-red-400" },
  'CANCELLED': { icon: XCircle,      color: "text-gray-500",    bg: "bg-gray-100 dark:bg-gray-500/10",      label: "Cancelada",        textColor: "text-gray-600 dark:text-gray-400" },
};

const paymentStatusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string; textColor: string }> = {
  'programado': { icon: Clock,        color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-500/10",       label: "Programado",   textColor: "text-blue-700" },
  'enviado':    { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Transferido",  textColor: "text-emerald-700" },
  'falló':      { icon: XCircle,      color: "text-red-600",     bg: "bg-red-50 dark:bg-red-500/10",         label: "Falló",        textColor: "text-red-700" },
};

interface TimelineStep {
  label: string;
  date?: string;
  icon: typeof Clock;
  status: 'done' | 'active' | 'upcoming' | 'failed';
}

function getTimeline(
  saleStatus: string,
  date: string,
  holdEndDate?: string,
  releasedDate?: string,
  refundWindowDays?: number
): TimelineStep[] {
  const steps: TimelineStep[] = [];

  if (saleStatus === 'CANCELLED') {
    steps.push({ label: 'Link enviado', date, icon: Send, status: 'done' });
    steps.push({ label: 'Cancelado / Expirado', date, icon: XCircle, status: 'failed' });
    return steps;
  }

  // Step 1: Link sent / Payment
  if (saleStatus === 'PENDING') {
    steps.push({ label: 'Link enviado', date, icon: Send, status: 'active' });
    steps.push({ label: 'Esperando pago', icon: CreditCard, status: 'upcoming' });
    if (refundWindowDays && refundWindowDays > 0) {
      steps.push({ label: `Retención (${refundWindowDays}d)`, icon: Clock, status: 'upcoming' });
    }
    steps.push({ label: 'Pago completado', icon: CheckCircle2, status: 'upcoming' });
    return steps;
  }

  // Paid
  steps.push({ label: 'Pago recibido', date, icon: CreditCard, status: 'done' });

  if (saleStatus === 'REFUNDED') {
    if (refundWindowDays && refundWindowDays > 0) {
      steps.push({ label: `Retención (${refundWindowDays}d)`, icon: Clock, status: 'done' });
    }
    steps.push({ label: 'Devuelta al cliente', date: releasedDate, icon: RotateCcw, status: 'failed' });
    return steps;
  }

  // Has refund window?
  if (refundWindowDays && refundWindowDays > 0) {
    if (saleStatus === 'HELD') {
      steps.push({ label: `Periodo de devolución (${refundWindowDays} días)`, date: holdEndDate ? `El cliente puede pedir devolución hasta el ${new Date(holdEndDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}` : undefined, icon: Clock, status: 'active' });
      steps.push({ label: 'Dinero liberado a tu cuenta', icon: CheckCircle2, status: 'upcoming' });
    } else {
      steps.push({ label: `Retención completada`, icon: Clock, status: 'done' });
      steps.push({ label: 'Dinero liberado', date: releasedDate, icon: CheckCircle2, status: 'done' });
    }
  } else {
    // No refund window → instant
    steps.push({ label: 'Liberación inmediata', date, icon: CheckCircle2, status: 'done' });
  }

  return steps;
}

export default function TransactionCard({
  id, clientName, clientEmail, serviceName, serviceCategory, serviceId,
  companyName, vendorName, amount, commission, platformFee, netAmount,
  status, statusType = 'sale', date, holdEndDate, releasedDate,
  activationCode, refundDaysLeft, refundStatus, isSubscription,
  paymentId, failureReason, refundReason, refundDecision,
  onRefund, onSupport, role = 'vendor'
}: TransactionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const config = statusType === 'payment'
    ? (paymentStatusConfig[status] || statusConfig['PENDING'])
    : (statusConfig[status] || statusConfig['PENDING']);
  const StatusIcon = config.icon;
  const coverImg = serviceCategory ? categoryCovers[serviceCategory] : null;

  // Get refund window for timeline
  const service = serviceId ? allServices.find(s => s.id === serviceId) : undefined;
  const refundWindowDays = service?.refundPolicy.refundWindowDays;

  const timeline = statusType === 'sale' ? getTimeline(status, date, holdEndDate, releasedDate, refundWindowDays) : [];

  const copyId = () => {
    navigator.clipboard.writeText(paymentId || id);
    toast.success("ID copiado");
  };

  const isCancelledOrRefunded = status === 'CANCELLED' || status === 'REFUNDED';

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-all cursor-pointer active:scale-[0.998] ${
        expanded ? 'border-border shadow-lg' : 'border-border/60 hover:border-border hover:shadow-sm'
      } ${isCancelledOrRefunded ? 'opacity-70' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Main row */}
      <div className="flex items-center gap-3.5 p-4">
        {/* Service cover with status indicator */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted">
            {coverImg ? (
              <img src={coverImg} alt={serviceCategory} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
          {/* Status dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${config.bg}`}>
            <StatusIcon className={`w-2 h-2 ${config.color}`} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{clientName}</p>
            {isSubscription && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">Rec</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {serviceName}{companyName ? ` · ${companyName}` : ''}{vendorName ? ` · ${vendorName}` : ''}
          </p>
        </div>

        {/* Amount + Status */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className={`text-sm font-bold ${isCancelledOrRefunded ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {role === 'vendor' && commission ? formatCOP(commission) : formatCOP(amount)}
          </p>
          <span className={`text-[10px] font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground/30" />
        </motion.div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">

              {/* Timeline */}
              {timeline.length > 0 && (
                <div className="space-y-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estado del pedido</p>
                  <div className="relative pl-5">
                    {timeline.map((step, i) => {
                      const isLast = i === timeline.length - 1;
                      const StepIcon = step.icon;
                      const dotColor = step.status === 'done' ? 'bg-emerald-500'
                        : step.status === 'active' ? 'bg-amber-500 animate-pulse'
                        : step.status === 'failed' ? 'bg-red-500'
                        : 'bg-muted-foreground/20';
                      const lineColor = step.status === 'done' ? 'bg-emerald-500/30'
                        : step.status === 'active' ? 'bg-amber-500/30'
                        : 'bg-border';
                      const textColor = step.status === 'upcoming' ? 'text-muted-foreground/50' : 'text-foreground';

                      return (
                        <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                          {/* Vertical line */}
                          {!isLast && (
                            <div className={`absolute left-[5px] top-[14px] w-[2px] h-[calc(100%-6px)] ${lineColor} rounded-full`} />
                          )}
                          {/* Dot */}
                          <div className={`relative z-10 w-3 h-3 rounded-full ${dotColor} flex-shrink-0 mt-0.5`} />
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${textColor}`}>{step.label}</p>
                            {step.date && (
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                {step.date.startsWith('hasta') ? step.date : new Date(step.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Financial breakdown */}
              <div className="rounded-xl bg-muted/30 p-3.5 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Desglose</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Venta bruta</span>
                    <span className="font-medium">{formatCOP(amount)}</span>
                  </div>
                  {commission !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{role === 'vendor' ? 'Tu comisión' : 'Comisión vendedor'}</span>
                      <span className={role === 'vendor' ? "font-semibold text-primary" : "text-red-500"}>
                        {role === 'vendor' ? '+' : '-'}{formatCOP(commission)}
                      </span>
                    </div>
                  )}
                  {platformFee !== undefined && platformFee > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fee plataforma</span>
                      <span className="text-red-500">-{formatCOP(platformFee)}</span>
                    </div>
                  )}
                  {netAmount !== undefined && (
                    <div className="flex justify-between text-xs font-semibold border-t border-border/50 pt-1.5 mt-1.5">
                      <span>{role === 'company' ? 'Tu neto' : 'Neto empresa'}</span>
                      <span className={role === 'company' ? "text-primary" : ""}>{formatCOP(netAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extra info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {clientEmail && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="truncate">{clientEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CreditCard className="w-3 h-3" />
                  <span className="font-mono">{paymentId || id}</span>
                </div>
              </div>

              {/* Activation code */}
              {activationCode && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">Código de activación</span>
                  </div>
                  <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">{activationCode}</code>
                </div>
              )}

              {/* Failure / Refund reason */}
              {failureReason && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10">
                  <p className="text-xs text-red-600">{failureReason}</p>
                </div>
              )}
              {refundReason && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Motivo de devolución</p>
                  <p className="text-xs text-foreground">{refundReason}</p>
                  {refundDecision && <p className="text-[10px] text-muted-foreground mt-1">Decidido por: {refundDecision}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-0.5" onClick={e => e.stopPropagation()}>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs rounded-xl" onClick={copyId}>
                  <Copy className="w-3 h-3 mr-1.5" /> Copiar ID
                </Button>
                {onSupport && (
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={onSupport}>
                    <MessageCircle className="w-3 h-3 mr-1.5" /> Soporte
                  </Button>
                )}
                {onRefund && refundDaysLeft !== undefined && refundDaysLeft > 0 && !refundStatus && (
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs rounded-xl text-red-600 border-red-200 hover:bg-red-50" onClick={onRefund}>
                    <RotateCcw className="w-3 h-3 mr-1.5" /> Devolver ({refundDaysLeft}d)
                  </Button>
                )}
                {refundStatus && (
                  <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 self-center">
                    Devolución: {refundStatus}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
