import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Clock, CheckCircle2, RotateCcw, MessageCircle,
  Package, User, Calendar, CreditCard, Shield, Copy, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCOP, formatDate, services as allServices } from "@/data/mockData";
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

const saleStatusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  'HELD': { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20", label: "En retención" },
  'RELEASED': { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Liberada" },
  'REFUNDED': { icon: RotateCcw, color: "text-red-600", bg: "bg-red-500/10 border-red-500/20", label: "Devuelta" },
};

const paymentStatusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  'programado': { icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20", label: "Programado" },
  'enviado': { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Transferido" },
  'falló': { icon: RotateCcw, color: "text-red-600", bg: "bg-red-500/10 border-red-500/20", label: "Falló" },
};

const refundStatusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  'pendiente': { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20", label: "Pendiente" },
  'aprobado': { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Aprobada" },
  'rechazado': { icon: RotateCcw, color: "text-red-600", bg: "bg-red-500/10 border-red-500/20", label: "Rechazada" },
  'automático': { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20", label: "Automática" },
};

export default function TransactionCard({
  id, clientName, clientEmail, serviceName, serviceCategory, serviceId,
  companyName, vendorName, amount, commission, platformFee, netAmount,
  status, statusType = 'sale', date, holdEndDate, releasedDate,
  activationCode, refundDaysLeft, refundStatus, isSubscription,
  paymentId, failureReason, refundReason, refundDecision,
  onRefund, onSupport, role = 'vendor'
}: TransactionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const configMap = statusType === 'payment' ? paymentStatusConfig : statusType === 'refund' ? refundStatusConfig : saleStatusConfig;
  const sc = configMap[status] || { icon: Package, color: "text-muted-foreground", bg: "bg-muted", label: status };
  const StatusIcon = sc.icon;
  const coverImg = serviceCategory ? categoryCovers[serviceCategory] : null;

  const copyId = () => {
    navigator.clipboard.writeText(paymentId || id);
    toast.success("ID copiado al portapapeles");
  };

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md cursor-pointer active:scale-[0.995]"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 p-3.5">
        {/* Service cover */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {coverImg ? (
            <img src={coverImg} alt={serviceCategory} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{clientName}</p>
            {isSubscription && (
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-primary/30 text-primary">REC</Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {serviceName}{companyName ? ` · ${companyName}` : ''}{vendorName ? ` · ${vendorName}` : ''}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Amount + Status */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <p className="text-sm font-bold text-foreground">{formatCOP(amount)}</p>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-5 font-medium ${sc.bg} ${sc.color} border`}>
            <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
            {sc.label}
          </Badge>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
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
            <div className="px-3.5 pb-3.5 space-y-3 border-t border-border/50 pt-3">
              {/* Financial breakdown */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Desglose financiero</p>
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

              {/* Hold explanation */}
              {status === 'HELD' && holdEndDate && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-700">Dinero en retención</p>
                    <p className="text-[10px] text-amber-600/80 mt-0.5 leading-relaxed">
                      Los fondos están en retención según la política del servicio. Se liberan automáticamente el {new Date(holdEndDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.
                    </p>
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2">
                {clientEmail && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-muted-foreground truncate">{clientEmail}</span>
                  </div>
                )}
                {releasedDate && status === 'RELEASED' && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">Liberada {new Date(releasedDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
                {(paymentId || id) && (
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-muted-foreground font-mono text-[10px] truncate">{paymentId || id}</span>
                  </div>
                )}
              </div>

              {/* Activation code */}
              {activationCode && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">Código de activación</span>
                  </div>
                  <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">{activationCode}</code>
                </div>
              )}

              {/* Failure reason */}
              {failureReason && (
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-600">{failureReason}</p>
                </div>
              )}

              {/* Refund info */}
              {refundReason && (
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Motivo de devolución</p>
                  <p className="text-xs text-foreground">{refundReason}</p>
                  {refundDecision && <p className="text-[10px] text-muted-foreground mt-1">Decidido por: {refundDecision}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-muted-foreground" onClick={copyId}>
                  <Copy className="w-3 h-3 mr-1.5" /> Copiar ID
                </Button>
                {onSupport && (
                  <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-emerald-600" onClick={onSupport}>
                    <MessageCircle className="w-3 h-3 mr-1.5" /> Soporte
                  </Button>
                )}
                {onRefund && refundDaysLeft !== undefined && refundDaysLeft > 0 && !refundStatus && (
                  <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-destructive" onClick={onRefund}>
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
