import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, ShoppingCart, Package, TrendingUp,
  Crown, Star, Shield, Users, EyeOff, DollarSign,
  MessageSquare, Flag, ChevronDown, ChevronRight,
  CheckCircle2, Clock, BookOpen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  sales, services, vendors, commissions, commissionTiers,
  vendorCommissionAssignments, formatCOP, formatDate, CURRENT_COMPANY_ID, companies
} from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
];

const tierIcon = (order: number) => {
  if (order === 3) return <Crown className="w-3 h-3 text-purple-500" />;
  if (order === 2) return <Star className="w-3 h-3 text-amber-500" />;
  return <Shield className="w-3 h-3 text-muted-foreground" />;
};

const tierColor = (order: number) => {
  if (order === 3) return 'border-purple-300/40 bg-purple-500/5 text-purple-700';
  if (order === 2) return 'border-amber-300/40 bg-amber-500/5 text-amber-700';
  return 'border-border bg-muted/30 text-muted-foreground';
};

const saleStatusCls: Record<string, string> = {
  COMPLETED: 'text-emerald-600',
  HELD: 'text-amber-600',
  PENDING: 'text-blue-600',
  REFUNDED: 'text-red-500',
  CANCELLED: 'text-muted-foreground',
};

const saleStatusLabel: Record<string, string> = {
  COMPLETED: 'Completada',
  HELD: 'En periodo',
  PENDING: 'Pendiente',
  REFUNDED: 'Devuelta',
  CANCELLED: 'Cancelada',
};

export default function CompanyVendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { trainingProgress, assignVendorTier } = useDemo();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [reportReason, setReportReason] = useState('');

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const vendor = vendors.find(v => v.id === vendorId);
  const vendorIndex = vendors.findIndex(v => v.id === vendorId);
  const avatarUrl = AVATAR_PHOTOS[vendorIndex % AVATAR_PHOTOS.length];

  if (!vendor) {
    return (
      <DashboardLayout role="company" userName={company?.name}>
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Vendedor no encontrado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/company/vendors')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const serviceIds = new Set(companyServices.map(s => s.id));
  const vendorSales = companySales.filter(s => s.vendorId === vendorId);
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthSales = vendorSales.filter(s => new Date(s.createdAt) >= monthAgo);
  const gmv = monthSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
  const totalCommission = commissions
    .filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId))
    .reduce((sum, c) => sum + c.amountCOP, 0);
  const assignments = vendorCommissionAssignments.filter(a => a.vendorId === vendorId && serviceIds.has(a.serviceId));
  const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === vendorId && serviceIds.has(tp.serviceId));

  // Best tier
  let bestTierOrder = 1;
  assignments.forEach(a => {
    const tier = commissionTiers.find(t => t.id === a.tierId);
    if (tier && tier.tierOrder > bestTierOrder) bestTierOrder = tier.tierOrder;
  });

  // Build service list (all company services, showing vendor's status in each)
  const serviceBreakdown = companyServices.map(svc => {
    const assignment = assignments.find(a => a.serviceId === svc.id);
    const tier = assignment ? commissionTiers.find(t => t.id === assignment.tierId) : null;
    const svcSales = vendorSales.filter(s => s.serviceId === svc.id);
    const svcGmv = svcSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
    const training = vendorTrainings.find(tp => tp.serviceId === svc.id);
    const serviceTiers = commissionTiers.filter(t => t.serviceId === svc.id).sort((a, b) => a.tierOrder - b.tierOrder);
    const isActive = svcSales.length > 0 || training;
    return {
      service: svc,
      tier, tierOrder: tier?.tierOrder || 1,
      isPrivate: tier ? !tier.isPublic : false,
      commissionPct: tier?.commissionPct || svc.vendorCommissionPct || 0,
      salesCount: svcSales.length,
      gmv: svcGmv,
      sales: svcSales,
      trainingStatus: training?.status || 'not_started',
      trainingProgress: training?.status === 'declared_completed' ? 100 : training?.status === 'in_progress' ? 60 : 0,
      availableTiers: serviceTiers,
      currentTierId: assignment?.tierId || '',
      isActive,
    };
  });

  // Chart data: sales by month (last 6 months)
  const chartData = (() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('es-CO', { month: 'short' });
      months[key] = 0;
    }
    vendorSales.forEach(s => {
      const key = s.createdAt.slice(0, 7);
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([key, count]) => {
      const d = new Date(key + '-01');
      return { month: d.toLocaleDateString('es-CO', { month: 'short' }), ventas: count };
    });
  })();

  // All sales sorted
  const allSales = vendorSales
    .map(s => {
      const svc = companyServices.find(sv => sv.id === s.serviceId);
      const assignment = assignments.find(a => a.serviceId === s.serviceId);
      const tier = assignment ? commissionTiers.find(t => t.id === assignment.tierId) : null;
      return {
        ...s, serviceName: svc?.name || '', serviceCategory: svc?.category || '',
        tierName: tier?.name || 'Publico', tierOrder: tier?.tierOrder || 1,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Payments data
  const vendorCommissionTotal = commissions
    .filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId))
    .reduce((sum, c) => sum + c.amountCOP, 0);
  const completedSalesNet = vendorSales
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.providerNetAmount, 0);

  const handleTierChange = (serviceId: string, newTierId: string) => {
    assignVendorTier(vendorId!, serviceId, newTierId);
    toast.success("Nivel de comision actualizado");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        <button onClick={() => navigate('/company/vendors')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Mi Red
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <img src={avatarUrl} alt={vendor.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-border" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{vendor.name}</h1>
                {tierIcon(bestTierOrder)}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge className={`text-[9px] border px-2 ${tierColor(bestTierOrder)}`}>
                  {bestTierOrder === 3 ? 'Elite' : bestTierOrder === 2 ? 'Premium' : 'Basico'}
                </Badge>
                <Badge className={`text-[9px] border-0 ${monthSales.length >= 3 ? 'bg-amber-500/10 text-amber-600' : monthSales.length > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                  {monthSales.length >= 3 ? 'Top' : monthSales.length > 0 ? 'Activo' : 'Sin ventas'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-full" onClick={() => setShowChat(true)}>
                <MessageSquare className="w-3 h-3 mr-1" /> Chat
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-full text-muted-foreground" onClick={() => setShowReport(true)}>
                <Flag className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Ventas/mes', value: String(monthSales.length) },
              { label: 'GMV/mes', value: formatCOP(gmv).replace(' COP', '') },
              { label: 'Comisiones', value: formatCOP(totalCommission).replace(' COP', '') },
              { label: 'Total historico', value: String(vendorSales.length) },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Chart */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-foreground mb-3">Ventas ultimos 6 meses</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Servicios</p>
          {serviceBreakdown.map(sb => {
            const isExpanded = expandedService === sb.service.id;
            const coverImg = categoryCovers[sb.service.category] || '';
            return (
              <div key={sb.service.id} className={`rounded-xl border overflow-hidden transition-all ${sb.isPrivate ? 'border-amber-300/40' : 'border-border'} bg-card`}>
                <button
                  onClick={() => setExpandedService(isExpanded ? null : sb.service.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
                >
                  {coverImg && (
                    <img src={coverImg} alt={sb.service.category} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">{sb.service.name}</p>
                      {sb.isPrivate && (
                        <Badge className="text-[7px] bg-amber-500/10 text-amber-600 border-0 px-1">
                          <EyeOff className="w-2 h-2 mr-0.5" /> Privado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{sb.service.category}</span>
                      <span className="text-[9px] font-medium">{sb.commissionPct}%</span>
                      {tierIcon(sb.tierOrder)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-bold">{sb.salesCount} ventas</p>
                    {sb.trainingStatus === 'declared_completed' ? (
                      <span className="text-[8px] text-emerald-600 flex items-center gap-0.5 justify-end"><CheckCircle2 className="w-2.5 h-2.5" /> Capacitado</span>
                    ) : sb.trainingStatus === 'in_progress' ? (
                      <span className="text-[8px] text-amber-600 flex items-center gap-0.5 justify-end"><Clock className="w-2.5 h-2.5" /> En curso</span>
                    ) : (
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5 justify-end"><BookOpen className="w-2.5 h-2.5" /> Sin capacitar</span>
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-3 space-y-3 bg-muted/10">
                    {/* Training progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">Entrenamiento</span>
                        <span className="text-[9px] font-medium">{sb.trainingProgress}%</span>
                      </div>
                      <Progress value={sb.trainingProgress} className="h-1.5" />
                    </div>

                    {/* Tier selector */}
                    {sb.availableTiers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground">Nivel:</span>
                        <Select value={sb.currentTierId} onValueChange={v => handleTierChange(sb.service.id, v)}>
                          <SelectTrigger className="h-7 text-[9px] w-36">
                            <SelectValue placeholder="Asignar nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            {sb.availableTiers.map(t => (
                              <SelectItem key={t.id} value={t.id}>
                                <span className="flex items-center gap-1">
                                  {tierIcon(t.tierOrder)} {t.name} ({t.commissionPct}%)
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* KPIs for this service */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <p className="text-[11px] font-bold">{sb.salesCount}</p>
                        <p className="text-[7px] text-muted-foreground">Ventas</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <p className="text-[11px] font-bold">{formatCOP(sb.gmv).replace(' COP', '')}</p>
                        <p className="text-[7px] text-muted-foreground">GMV</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <p className="text-[11px] font-bold">{formatCOP(Math.round(sb.gmv * sb.commissionPct / 100)).replace(' COP', '')}</p>
                        <p className="text-[7px] text-muted-foreground">Comision</p>
                      </div>
                    </div>

                    {/* Sales for this service */}
                    {sb.sales.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[9px] font-medium text-muted-foreground">Ventas de este servicio</p>
                        {sb.sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(sale => (
                          <div key={sale.id}>
                            <button
                              onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-foreground truncate">{sale.clientName}</p>
                                <p className="text-[8px] text-muted-foreground">{formatDate(sale.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold">{formatCOP(sale.amountCOP || sale.grossAmount)}</p>
                                <p className={`text-[8px] font-medium ${saleStatusCls[sale.status]}`}>{saleStatusLabel[sale.status] || sale.status}</p>
                              </div>
                              <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSale === sale.id ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedSale === sale.id && (
                              <div className="ml-4 mr-2 mb-2 p-2.5 rounded-lg bg-muted/30 space-y-1">
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-muted-foreground">Monto bruto</span>
                                  <span className="font-medium">{formatCOP(sale.amountCOP || sale.grossAmount)}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-muted-foreground">Comision vendedor</span>
                                  <span className="font-medium text-amber-600">-{formatCOP(sale.sellerCommissionAmount)}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-muted-foreground">Fee plataforma</span>
                                  <span className="font-medium">-{formatCOP(sale.mensualistaFeeAmount)}</span>
                                </div>
                                <div className="h-px bg-border" />
                                <div className="flex justify-between text-[9px]">
                                  <span className="font-medium text-foreground">Tu neto</span>
                                  <span className="font-bold text-primary">{formatCOP(sale.providerNetAmount)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Payments summary */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary" /> Pagos a este vendedor
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-sm font-bold text-foreground">{formatCOP(vendorCommissionTotal).replace(' COP', '')}</p>
              <p className="text-[8px] text-muted-foreground">Total comisiones</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-sm font-bold text-foreground">{formatCOP(completedSalesNet).replace(' COP', '')}</p>
              <p className="text-[8px] text-muted-foreground">Neto completado</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-sm font-bold text-foreground">{vendorSales.filter(s => s.status === 'HELD').length}</p>
              <p className="text-[8px] text-muted-foreground">En periodo</p>
            </div>
          </div>
        </div>

        {/* Recent sales (all) */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Todas las ventas</p>
          {allSales.length > 0 ? allSales.slice(0, 10).map(sale => (
            <div key={sale.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-medium text-foreground truncate">{sale.clientName}</p>
                  {sale.tierOrder > 1 && (
                    <span className={`inline-flex items-center gap-0.5 text-[7px] px-1 rounded ${tierColor(sale.tierOrder)}`}>
                      {tierIcon(sale.tierOrder)} {sale.tierName}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground">{sale.serviceName} · {formatDate(sale.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold">{formatCOP(sale.amountCOP || sale.grossAmount)}</p>
                <p className={`text-[8px] font-medium ${saleStatusCls[sale.status]}`}>{saleStatusLabel[sale.status] || sale.status}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground">Sin ventas registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={avatarUrl} alt={vendor.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-xs font-semibold">{vendor.name}</p>
                <p className="text-[9px] text-muted-foreground">Chat interno</p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 min-h-[120px]">
              <p className="text-[10px] text-muted-foreground text-center py-8">Sin mensajes anteriores</p>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="text-xs min-h-[60px]"
                rows={2}
              />
            </div>
            <Button size="sm" className="w-full h-8 text-xs" onClick={() => {
              if (chatMessage.trim()) { toast.success("Mensaje enviado"); setChatMessage(''); setShowChat(false); }
            }}>
              <MessageSquare className="w-3 h-3 mr-1" /> Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold">Reportar vendedor</p>
              <p className="text-[9px] text-muted-foreground">Describe el motivo del reporte</p>
            </div>
            <Textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Describe el motivo..."
              className="text-xs min-h-[80px]"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setShowReport(false)}>
                Cancelar
              </Button>
              <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs" onClick={() => {
                if (reportReason.trim()) { toast.success("Reporte enviado"); setReportReason(''); setShowReport(false); }
              }}>
                <Flag className="w-3 h-3 mr-1" /> Reportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
