import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Star, Clock, UserCheck, BookOpen, ChevronDown, Mail, Phone, MessageCircle, ShoppingCart, TrendingUp, Calendar, Crown, Shield } from "lucide-react";
import { vendors, formatCOP } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function VendedoresTab({ service, serviceSales, trainingProgress, allVendorIds }: any) {
  const { currentCompanyPlan, commissionTiers, vendorCommissionAssignments, assignVendorTier, getVendorTier } = useDemo();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const serviceTiers = commissionTiers.filter(t => t.serviceId === service.id).sort((a, b) => a.tierOrder - b.tierOrder);

  const vendorData = Array.from(allVendorIds as Set<string>).map(vendorId => {
    const vendor = vendors.find(v => v.id === vendorId);
    const vSales = serviceSales.filter((s: any) => s.vendorId === vendorId);
    const monthSales = vSales.filter((s: any) => new Date(s.createdAt) >= monthAgo);
    const training = trainingProgress.find((tp: any) => tp.vendorId === vendorId && tp.serviceId === service.id);
    const gmv = monthSales.reduce((sum: number, s: any) => sum + (s.amountCOP || s.grossAmount), 0);
    const activeSubs = vSales.filter((s: any) => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length;
    const heldSales = vSales.filter((s: any) => s.status === 'HELD').length;
    const completedSales = vSales.filter((s: any) => s.status === 'COMPLETED').length;
    const trainingStatus = training?.status === 'declared_completed' ? 'completada'
      : training?.status === 'in_progress' ? 'en progreso' : 'pendiente';
    const lastSaleDate = vSales.length > 0 ? vSales.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : null;
    return {
      id: vendorId, name: vendor?.name || vendorId, email: vendor?.email || '',
      phone: '3001234567',
      salesMonth: monthSales.length, totalSales: vSales.length, gmv, activeSubs,
      heldSales, completedSales, trainingStatus, lastSaleDate,
      joinDate: vendor?.createdAt || '2024-06-01',
    };
  }).sort((a, b) => b.salesMonth - a.salesMonth);

  const statusColors: Record<string, string> = {
    completada: 'bg-emerald-500/10 text-emerald-600',
    'en progreso': 'bg-amber-500/10 text-amber-600',
    pendiente: 'bg-muted text-muted-foreground',
  };

  const showContact = currentCompanyPlan === 'premium' || currentCompanyPlan === 'enterprise';

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
          {vendorData.map((v, i) => {
            const isExpanded = expandedId === v.id;
            return (
              <div key={v.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 && v.salesMonth > 0 ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                    {i === 0 && v.salesMonth > 0 ? <Star className="w-4 h-4 text-amber-500" fill="currentColor" /> : <span className="text-xs font-bold text-primary">{v.name.split(' ').map((n: string) => n[0]).join('')}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground">{v.salesMonth} ventas este mes · {formatCOP(v.gmv)}</p>
                  </div>
                  <Badge className={`text-[9px] border-0 ${statusColors[v.trainingStatus]}`}>
                    {v.trainingStatus === 'completada' ? <><UserCheck className="w-2.5 h-2.5 mr-0.5" /> Capacitado</> :
                     v.trainingStatus === 'en progreso' ? <><BookOpen className="w-2.5 h-2.5 mr-0.5" /> En progreso</> :
                     <><Clock className="w-2.5 h-2.5 mr-0.5" /> Pendiente</>}
                  </Badge>
                  {(() => {
                    const vTier = getVendorTier(v.id, service.id);
                    if (!vTier) return null;
                    if (vTier.tierOrder === 3) return <Badge className="text-[8px] bg-primary/10 text-primary border-0"><Crown className="w-2 h-2 mr-0.5" /> Elite</Badge>;
                    if (vTier.tierOrder === 2) return <Badge className="text-[8px] bg-amber-500/10 text-amber-600 border-0"><Star className="w-2 h-2 mr-0.5" /> Premium</Badge>;
                    return <Badge variant="outline" className="text-[8px]"><Shield className="w-2 h-2 mr-0.5" /> Básico</Badge>;
                  })()}
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground/30 transition-transform", isExpanded && "rotate-180")} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <p className="text-sm font-bold">{v.salesMonth}</p>
                            <p className="text-[9px] text-muted-foreground">Ventas/mes</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/30">
                            <p className="text-sm font-bold">{v.totalSales}</p>
                            <p className="text-[9px] text-muted-foreground">Total</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-primary/5">
                            <p className="text-sm font-bold text-primary">{formatCOP(v.gmv)}</p>
                            <p className="text-[9px] text-muted-foreground">GMV/mes</p>
                          </div>
                          {service.type === 'suscripción' && (
                            <div className="text-center p-2 rounded-lg bg-muted/30">
                              <p className="text-sm font-bold">{v.activeSubs}</p>
                              <p className="text-[9px] text-muted-foreground">Suscripciones</p>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Completadas:</span>
                            <span className="font-medium text-foreground">{v.completedSales}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-muted-foreground">En devolución:</span>
                            <span className="font-medium text-foreground">{v.heldSales}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Última venta:</span>
                            <span className="font-medium text-foreground">
                              {v.lastSaleDate ? new Date(v.lastSaleDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Conversión:</span>
                            <span className="font-medium text-foreground">
                              {v.totalSales > 0 ? `${Math.round((v.completedSales / v.totalSales) * 100)}%` : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Contact info — Premium/Enterprise only */}
                        {showContact && (
                          <div className="space-y-2 pt-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Contacto</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px]">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{v.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{v.phone}</span>
                              </div>
                            </div>
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-[10px] rounded-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-500/20 dark:hover:bg-emerald-500/5"
                                onClick={() => window.open(`https://wa.me/57${v.phone.replace(/\s/g, '')}`, '_blank')}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-[10px] rounded-full"
                                onClick={() => window.open(`mailto:${v.email}`, '_blank')}
                              >
                                <Mail className="w-3 h-3 mr-1" /> Email
                              </Button>
                            </div>
                          </div>
                        )}

                        {!showContact && (
                          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                            <p className="text-[10px] text-muted-foreground text-center">
                              Mejora a <span className="font-semibold text-primary">Premium</span> para ver el contacto de tus vendedores
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin vendedores</p>
          <p className="text-xs text-muted-foreground">Ningún vendedor ha interactuado con este producto</p>
        </div>
      )}
    </div>
  );
}
