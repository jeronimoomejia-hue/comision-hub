import { useState, useMemo } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import PageTutorial from "@/components/PageTutorial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, EmptyState, StatCard } from "@/components/dashboard/DashboardComponents";
import { 
  Plus, Search, Filter, ShoppingCart, User, Mail, Phone, Eye, MessageCircle,
  Calendar, DollarSign, RefreshCw, Clock, CheckCircle, XCircle, Building2,
  CreditCard, AlertCircle, Package, ChevronDown, ChevronUp, RotateCcw, 
  ShieldAlert, CheckCircle2, AlertTriangle, Zap, CreditCard as CreditCardIcon
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate, services as allServices, vendors, CURRENT_VENDOR_ID } from "@/data/mockData";
import type { Sale, VendorPayment } from "@/data/mockData";

// Status display helpers
const getStatusBadge = (status: string) => {
  const map: Record<string, { className: string; label: string }> = {
    'HELD': { className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: 'En retención' },
    'COMPLETED': { className: "bg-green-500/10 text-green-600 border-green-500/20", label: 'Liberado' },
    'REFUNDED': { className: "bg-red-500/10 text-red-600 border-red-500/20", label: 'Reembolsado' },
  };
  const item = map[status] || { className: "bg-muted text-muted-foreground", label: status };
  return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
};

const getPaymentStatusBadge = (status: string) => {
  const map: Record<string, { className: string; label: string }> = {
    'programado': { className: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: 'Programado' },
    'enviado': { className: "bg-green-500/10 text-green-500 border-green-500/20", label: 'Enviado' },
    'falló': { className: "bg-red-500/10 text-red-500 border-red-500/20", label: 'Falló' },
  };
  const item = map[status] || { className: "bg-muted text-muted-foreground", label: status };
  return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
};

export default function VendorSales() {
  const { sales, commissions, vendorPayments, refundRequests, addRefundRequest, services, trainingProgress, addSale, subscriptions, currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  
  const [mainTab, setMainTab] = useState("ventas");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "suscripción" | "puntual">("all");
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<VendorPayment | null>(null);
  const [refundSale, setRefundSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    serviceId: "", clientName: "", clientEmail: "", clientPhone: "", notes: ""
  });

  // Active services (training completed)
  const activeServices = useMemo(() => {
    return services.filter(s => {
      if (s.status !== 'activo') return false;
      if (!s.requiresTraining) return true;
      const training = trainingProgress.find(tp => tp.vendorId === currentVendorId && tp.serviceId === s.id);
      return training?.status === 'declared_completed';
    });
  }, [services, trainingProgress, currentVendorId]);

  // My sales
  const mySales = useMemo(() => 
    sales.filter(s => s.vendorId === currentVendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales, currentVendorId]
  );

  // My payments
  const myPayments = useMemo(() => 
    vendorPayments.filter(p => p.vendorId === currentVendorId),
    [vendorPayments, currentVendorId]
  );

  // My refunds
  const myRefunds = useMemo(() => 
    refundRequests.filter(r => r.vendorId === currentVendorId),
    [refundRequests, currentVendorId]
  );

  // Subscriptions
  const activeSubscriptions = useMemo(() => {
    return subscriptions
      .filter(s => s.vendorId === currentVendorId)
      .map(sub => {
        const service = allServices.find(s => s.id === sub.serviceId);
        return { ...sub, service, serviceName: service?.name || 'Producto', monthlyAmount: service?.priceCOP || 0, commission: service ? Math.round(service.priceCOP * service.vendorCommissionPct / 100) : 0 };
      });
  }, [subscriptions, currentVendorId]);

  // Group sales by service
  const salesByService = useMemo(() => {
    const grouped: Record<string, { service: typeof allServices[0]; sales: Sale[] }> = {};
    mySales.forEach(sale => {
      if (!grouped[sale.serviceId]) {
        const service = allServices.find(s => s.id === sale.serviceId);
        if (service) grouped[sale.serviceId] = { service, sales: [] };
      }
      if (grouped[sale.serviceId]) grouped[sale.serviceId].sales.push(sale);
    });
    return Object.values(grouped).sort((a, b) => b.sales.length - a.sales.length);
  }, [mySales]);

  // Commissions
  const vendorCommissions = commissions.filter(c => c.vendorId === currentVendorId);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const releasedThisMonth = vendorCommissions.filter(c => c.status === 'COMPLETED' && c.createdAt.startsWith(thisMonth));
  const totalReleasedThisMonth = releasedThisMonth.reduce((acc, c) => acc + c.amountCOP, 0);
  
  const heldSales = mySales.filter(s => s.status === 'HELD');
  const releasedSales = mySales.filter(s => s.status === 'COMPLETED');
  const totalHeld = heldSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);
  const totalReleased = releasedSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);

  // Unique services for filter
  const uniqueServices = [...new Set(mySales.map(s => s.serviceId))].map(
    id => allServices.find(s => s.id === id)
  ).filter(Boolean);

  // Filtered sales
  const filteredSales = mySales.filter(sale => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const matchesSearch = sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesService = serviceFilter === "all" || sale.serviceId === serviceFilter;
    const matchesType = typeFilter === "all" || service?.type === typeFilter;
    return matchesSearch && matchesStatus && matchesService && matchesType;
  });

  // Refund helpers
  const canRequestRefund = (sale: Sale) => {
    if (sale.status !== 'HELD') return false;
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service) return false;
    if (refundRequests.find(r => r.saleId === sale.id)) return false;
    const diffDays = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= service.refundPolicy.refundWindowDays;
  };

  const getRefundDaysLeft = (sale: Sale) => {
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service) return 0;
    const diffDays = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, service.refundPolicy.refundWindowDays - diffDays);
  };

  const handleRefundRequest = () => {
    if (!refundSale || !refundReason.trim()) return;
    const service = allServices.find(s => s.id === refundSale.serviceId);
    if (!service) return;
    addRefundRequest({
      saleId: refundSale.id, vendorId: currentVendorId, companyId: refundSale.companyId,
      serviceId: refundSale.serviceId, reason: refundReason,
      status: service.refundPolicy.autoRefund ? 'automático' : 'pendiente',
      decisionBy: service.refundPolicy.autoRefund ? 'sistema' : undefined,
      decidedAt: service.refundPolicy.autoRefund ? new Date().toISOString().split('T')[0] : undefined,
    });
    toast.success(service.refundPolicy.autoRefund ? "Devolución procesada automáticamente" : "Solicitud enviada a la empresa");
    setRefundSale(null);
    setRefundReason("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const service = services.find(s => s.id === formData.serviceId);
    if (!service) { toast.error("Producto no encontrado"); setIsLoading(false); return; }
    await new Promise(resolve => setTimeout(resolve, 800));
    const grossAmount = service.priceCOP;
    const sellerCommissionAmount = Math.round(grossAmount * service.vendorCommissionPct / 100);
    const mensualistaFeeAmount = Math.round(grossAmount * service.mensualistaPct / 100);
    const providerNetAmount = grossAmount - sellerCommissionAmount - mensualistaFeeAmount;
    addSale({
      serviceId: formData.serviceId, vendorId: currentVendorId, companyId: service.companyId,
      clientName: formData.clientName, clientEmail: formData.clientEmail,
      grossAmount, sellerCommissionAmount, mensualistaFeeAmount, providerNetAmount,
      status: 'HELD', isSubscription: service.type === 'suscripción', subscriptionActive: service.type === 'suscripción',
      amountCOP: grossAmount, holdStartAt: new Date().toISOString(), holdEndAt: new Date(Date.now() + service.refundPolicy.refundWindowDays * 24 * 60 * 60 * 1000).toISOString(),
      paymentProvider: 'MercadoPago', mpPaymentId: `MP-${Date.now()}`
    });
    toast.success("¡Venta registrada!", { description: `Comisión en retención ${service.refundPolicy.refundWindowDays} días.` });
    setFormData({ serviceId: "", clientName: "", clientEmail: "", clientPhone: "", notes: "" });
    setIsLoading(false);
    setIsDialogOpen(false);
  };

  const handleSupport = (sale: Sale) => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const message = `Hola, necesito ayuda con una venta:\n📋 Producto: ${service?.name}\n👤 Cliente: ${sale.clientName}\n💰 Monto: ${formatCOP(sale.grossAmount)}\n📅 Fecha: ${formatDate(sale.createdAt)}`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Payment counts
  const sentPayments = myPayments.filter(p => p.status === 'enviado');
  const failedPayments = myPayments.filter(p => p.status === 'falló');
  const scheduledPayments = myPayments.filter(p => p.status === 'programado');

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        <PageTutorial
          pageId="vendor-sales"
          title="Mis Ventas"
          description="Consulta el historial de todas tus ventas, pagos y devoluciones en un solo lugar."
          steps={[
            "Para registrar una venta, ve al menú del producto correspondiente",
            "Aquí puedes ver el estado de retención y liberación de tus comisiones",
            "Solicita devoluciones dentro del período de gracia de cada producto"
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Mis Ventas</h1>
            <p className="text-muted-foreground mt-1">
              Ventas, pagos y devoluciones en un solo lugar
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Para registrar una venta, ve al producto correspondiente
          </p>
        </div>

        {/* Main KPI */}
        <div className="card-premium p-5 bg-primary/5 ring-2 ring-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Comisiones liberadas del mes
              </p>
              <p className="text-xl font-bold text-primary">{formatCOP(totalReleasedThisMonth)}</p>
              <p className="text-sm text-muted-foreground mt-1">{releasedThisMonth.length} transacciones</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-5 h-5" />
              <span>Transferencia automática</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total ventas" value={mySales.length} icon={ShoppingCart} subtitle={`${uniqueServices.length} productos`} />
          <StatCard title="En retención" value={formatCOP(totalHeld)} icon={Clock} subtitle={`${heldSales.length} ventas`} variant="warning" />
          <StatCard title="Liberadas" value={formatCOP(totalReleased)} icon={CheckCircle2} subtitle={`${releasedSales.length} ventas`} variant="success" />
          <StatCard title="Devoluciones" value={myRefunds.length} icon={RotateCcw} variant={myRefunds.length > 0 ? "error" : "default"} />
        </div>

        {/* ===== Main Tabs ===== */}
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="ventas">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ventas ({mySales.length})
            </TabsTrigger>
            <TabsTrigger value="pagos">
              <DollarSign className="w-4 h-4 mr-2" />
              Pagos ({myPayments.length})
            </TabsTrigger>
            <TabsTrigger value="devoluciones">
              <RotateCcw className="w-4 h-4 mr-2" />
              Devoluciones ({myRefunds.length})
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB: VENTAS ===== */}
          <TabsContent value="ventas" className="space-y-6 mt-6">
            {/* Info */}
            <div className="card-premium p-4 bg-muted/30 border-l-4 border-primary">
              <p className="text-sm">
                <strong>¿Cómo funciona?</strong> Cada venta entra en <strong>retención</strong> (7 días). 
                Al liberarse, tu comisión se transfiere automáticamente. 
                Puedes pedir devolución si estás dentro del período de gracia.
              </p>
            </div>

            {/* Sales by Service (expandable) */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Por producto
              </h3>
              <div className="space-y-3">
                {salesByService.map(({ service, sales: serviceSales }) => {
                  const held = serviceSales.filter(s => s.status === 'HELD');
                  const released = serviceSales.filter(s => s.status === 'COMPLETED');
                  const refunded = serviceSales.filter(s => s.status === 'REFUNDED');
                  const totalComm = serviceSales.reduce((sum, s) => sum + s.sellerCommissionAmount, 0);
                  const isExpanded = expandedService === service.id;

                  return (
                    <div key={service.id} className="card-premium overflow-hidden">
                      <button
                        onClick={() => setExpandedService(isExpanded ? null : service.id)}
                        className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.category} · {service.vendorCommissionPct}% · {service.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-yellow-600"><Clock className="w-3.5 h-3.5" /> {held.length}</span>
                            <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> {released.length}</span>
                            {refunded.length > 0 && <span className="flex items-center gap-1 text-red-600"><RotateCcw className="w-3.5 h-3.5" /> {refunded.length}</span>}
                          </div>
                          <span className="font-semibold text-primary">{formatCOP(totalComm)}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/40">
                                <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                                <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                                <th className="text-right p-3 font-medium text-muted-foreground">Venta</th>
                                <th className="text-right p-3 font-medium text-muted-foreground">Comisión</th>
                                <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                                <th className="text-center p-3 font-medium text-muted-foreground">Retención</th>
                                <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {serviceSales.map(sale => {
                                const eligible = canRequestRefund(sale);
                                const daysLeft = getRefundDaysLeft(sale);
                                const existingRefund = refundRequests.find(r => r.saleId === sale.id);
                                return (
                                  <tr key={sale.id} className="border-t border-border/50 hover:bg-muted/20">
                                    <td className="p-3">{formatDate(sale.createdAt)}</td>
                                    <td className="p-3">
                                      <p className="font-medium">{sale.clientName}</p>
                                      <p className="text-xs text-muted-foreground">{sale.clientEmail}</p>
                                    </td>
                                    <td className="p-3 text-right text-muted-foreground">{formatCOP(sale.grossAmount)}</td>
                                    <td className="p-3 text-right font-semibold text-primary">{formatCOP(sale.sellerCommissionAmount)}</td>
                                    <td className="p-3 text-center">{getStatusBadge(sale.status)}</td>
                                    <td className="p-3 text-center text-xs">
                                      {sale.status === 'HELD' && <span className="text-yellow-600 font-medium">Hasta {formatDate(sale.holdEndAt)}</span>}
                                      {sale.status === 'COMPLETED' && <span className="text-green-600">{sale.releasedAt ? formatDate(sale.releasedAt) : '—'}</span>}
                                      {sale.status === 'REFUNDED' && <span className="text-red-600">Devuelto</span>}
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}><Eye className="w-4 h-4" /></Button>
                                        {eligible && (
                                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700" onClick={() => setRefundSale(sale)}>
                                            <RotateCcw className="w-4 h-4 mr-1" /><span className="text-xs">({daysLeft}d)</span>
                                          </Button>
                                        )}
                                        {existingRefund && <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">{existingRefund.status}</Badge>}
                                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleSupport(sale)}>
                                          <MessageCircle className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
                {salesByService.length === 0 && (
                  <EmptyState icon={ShoppingCart} title="Sin ventas aún" description="Registra tu primera venta para comenzar" />
                )}
              </div>
            </div>

            {/* Filtered All Sales Table */}
            <div className="card-premium">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Todas las ventas</h3>
              </div>
              <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border/50">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="HELD">En retención</SelectItem>
                    <SelectItem value="COMPLETED">Liberados</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Producto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueServices.map(s => <SelectItem key={s!.id} value={s!.id}>{s!.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Gig</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Venta</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Comisión</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>
                    ) : filteredSales.slice(0, 50).map(sale => {
                      const service = allServices.find(s => s.id === sale.serviceId);
                      const eligible = canRequestRefund(sale);
                      const daysLeft = getRefundDaysLeft(sale);
                      return (
                        <tr key={sale.id} className="border-t border-border/50 hover:bg-muted/20">
                          <td className="p-3">{formatDate(sale.createdAt)}</td>
                          <td className="p-3"><p className="font-medium">{service?.name || 'N/A'}</p><p className="text-xs text-muted-foreground">{service?.type}</p></td>
                          <td className="p-3">{sale.clientName}</td>
                          <td className="p-3 text-right text-muted-foreground">{formatCOP(sale.grossAmount)}</td>
                          <td className="p-3 text-right font-semibold text-primary">{formatCOP(sale.sellerCommissionAmount)}</td>
                          <td className="p-3 text-center">{getStatusBadge(sale.status)}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}><Eye className="w-4 h-4" /></Button>
                              {eligible && <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => setRefundSale(sale)}><RotateCcw className="w-4 h-4" /></Button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ===== TAB: PAGOS ===== */}
          <TabsContent value="pagos" className="space-y-6 mt-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard title="Transferidos" value={sentPayments.length} icon={CheckCircle2} variant="success" />
              <StatCard title="Programados" value={scheduledPayments.length} icon={Clock} />
              <StatCard title="Fallidos" value={failedPayments.length} icon={AlertTriangle} variant={failedPayments.length > 0 ? "error" : "default"} />
            </div>

            <div className="card-premium p-4 bg-muted/30 border-l-4 border-primary">
              <p className="text-sm">
                <strong>Pagos automáticos:</strong> Cuando una venta se libera, tu comisión se transfiere automáticamente a tu cuenta bancaria registrada.
              </p>
            </div>

            <div className="card-premium">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Historial de transferencias
                </h3>
              </div>
              {myPayments.length === 0 ? (
                <div className="p-8"><EmptyState icon={DollarSign} title="Sin pagos aún" description="Tus transferencias aparecerán aquí" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Gig</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Venta bruta</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Tu comisión</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPayments.slice(0, 30).map(payment => {
                        const service = allServices.find(s => s.id === payment.serviceId);
                        return (
                          <tr key={payment.id} className="border-t border-border/50 hover:bg-muted/20">
                            <td className="p-3">{formatDate(payment.scheduledDate)}</td>
                            <td className="p-3 font-medium">{service?.name || 'N/A'}</td>
                            <td className="p-3 text-muted-foreground">{payment.clientName || '-'}</td>
                            <td className="p-3 text-right text-muted-foreground">{formatCOP(payment.grossAmount)}</td>
                            <td className="p-3 text-right font-semibold text-primary">{formatCOP(payment.amountCOP)}</td>
                            <td className="p-3 text-center">{getPaymentStatusBadge(payment.status)}</td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                                <Eye className="w-4 h-4 mr-1" /> Detalle
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== TAB: DEVOLUCIONES ===== */}
          <TabsContent value="devoluciones" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Pendientes" value={myRefunds.filter(r => r.status === 'pendiente').length} icon={Clock} variant="warning" />
              <StatCard title="Aprobadas" value={myRefunds.filter(r => r.status === 'aprobado').length} icon={CheckCircle} variant="success" />
              <StatCard title="Rechazadas" value={myRefunds.filter(r => r.status === 'rechazado').length} icon={XCircle} />
              <StatCard title="Automáticas" value={myRefunds.filter(r => r.status === 'automático').length} icon={Zap} />
            </div>

            <div className="card-premium">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  Historial de devoluciones
                </h3>
              </div>
              {myRefunds.length === 0 ? (
                <div className="p-8"><EmptyState icon={RotateCcw} title="Sin devoluciones" description="Aún no has solicitado ninguna devolución" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Gig</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Monto</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Decisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRefunds.map(refund => {
                        const sale = sales.find(s => s.id === refund.saleId);
                        const service = allServices.find(s => s.id === refund.serviceId);
                        const refundStatusMap: Record<string, { icon: JSX.Element; className: string }> = {
                          'pendiente': { icon: <Clock className="w-4 h-4 text-amber-500" />, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
                          'aprobado': { icon: <CheckCircle className="w-4 h-4 text-green-500" />, className: "bg-green-500/10 text-green-600 border-green-500/20" },
                          'rechazado': { icon: <XCircle className="w-4 h-4 text-red-500" />, className: "bg-red-500/10 text-red-600 border-red-500/20" },
                          'automático': { icon: <Zap className="w-4 h-4 text-blue-500" />, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
                        };
                        const rs = refundStatusMap[refund.status] || { icon: null, className: "" };
                        return (
                          <tr key={refund.id} className="border-t border-border/50 hover:bg-muted/20">
                            <td className="p-3">{formatDate(refund.createdAt)}</td>
                            <td className="p-3 font-medium">{service?.name || 'N/A'}</td>
                            <td className="p-3">{sale?.clientName || 'N/A'}</td>
                            <td className="p-3 text-right font-medium">{sale ? formatCOP(sale.grossAmount) : 'N/A'}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {rs.icon}
                                <Badge variant="outline" className={rs.className}>{refund.status}</Badge>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-sm capitalize">
                                {refund.decisionBy === 'sistema' ? 'Automático' : refund.decisionBy === 'empresa' ? 'Empresa' : 'Pendiente'}
                              </p>
                              {refund.decidedAt && <p className="text-xs text-muted-foreground">{formatDate(refund.decidedAt)}</p>}
                              {refund.rejectionReason && <p className="text-xs text-red-600 mt-0.5">{refund.rejectionReason}</p>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== SALE DETAIL MODAL ===== */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Detalle de la venta</DialogTitle>
          </DialogHeader>
          {selectedSale && (() => {
            const service = allServices.find(s => s.id === selectedSale.serviceId);
            const eligible = canRequestRefund(selectedSale);
            const daysLeft = getRefundDaysLeft(selectedSale);
            return (
              <div className="space-y-4">
                <div className="text-center py-4 bg-muted/30 rounded-xl">
                  <p className="text-3xl font-bold text-primary">{formatCOP(selectedSale.sellerCommissionAmount)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Tu comisión ({service?.vendorCommissionPct}%)</p>
                </div>
                <div className={`p-3 rounded-lg flex items-center gap-3 ${selectedSale.status === 'HELD' ? 'bg-yellow-500/10 border border-yellow-500/20' : selectedSale.status === 'COMPLETED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  {selectedSale.status === 'HELD' && <><Clock className="w-5 h-5 text-yellow-600" /><p className="font-medium text-sm">En retención hasta {formatDate(selectedSale.holdEndAt)}</p></>}
                  {selectedSale.status === 'COMPLETED' && <><CheckCircle2 className="w-5 h-5 text-green-600" /><p className="font-medium text-sm">Liberado y transferido</p></>}
                  {selectedSale.status === 'REFUNDED' && <><RotateCcw className="w-5 h-5 text-red-600" /><p className="font-medium text-sm">Reembolsado</p></>}
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-2">
                  <p className="text-sm font-semibold mb-3">Desglose financiero</p>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Venta bruta</span><span className="font-medium">{formatCOP(selectedSale.grossAmount)}</span></div>
                  <div className="flex justify-between text-sm text-primary"><span>Tu comisión ({service?.vendorCommissionPct}%)</span><span className="font-semibold">{formatCOP(selectedSale.sellerCommissionAmount)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Fee Mensualista ({service?.mensualistaPct || 8}%)</span><span>- {formatCOP(selectedSale.mensualistaFeeAmount)}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm"><span className="text-muted-foreground">Neto empresa</span><span>{formatCOP(selectedSale.providerNetAmount)}</span></div>
                </div>
                <div className="space-y-2">
                  {[['Producto', service?.name], ['Cliente', selectedSale.clientName], ['Fecha', formatDate(selectedSale.createdAt)], ['Ref. MP', selectedSale.mpPaymentId]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm"><span className="text-muted-foreground">{l}</span><span className="font-medium">{v}</span></div>
                  ))}
                </div>
                {eligible && <Button className="w-full" variant="outline" onClick={() => { setSelectedSale(null); setRefundSale(selectedSale); }}><RotateCcw className="w-4 h-4 mr-2" />Solicitar devolución ({daysLeft}d restantes)</Button>}
                <Button className="w-full" variant="outline" onClick={() => handleSupport(selectedSale)}><MessageCircle className="w-4 h-4 mr-2" />Contactar soporte</Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ===== PAYMENT DETAIL MODAL ===== */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Detalle del pago</DialogTitle>
          </DialogHeader>
          {selectedPayment && (() => {
            const service = allServices.find(s => s.id === selectedPayment.serviceId);
            return (
              <div className="space-y-4">
                <div className="text-center py-4 bg-muted/30 rounded-xl">
                  <p className="text-3xl font-bold text-primary">{formatCOP(selectedPayment.amountCOP)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Transferencia a tu cuenta</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-2">
                  <p className="text-sm font-semibold mb-3">Desglose</p>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Venta bruta</span><span>{formatCOP(selectedPayment.grossAmount)}</span></div>
                  <div className="flex justify-between text-sm text-primary"><span>Tu comisión</span><span className="font-semibold">{formatCOP(selectedPayment.amountCOP)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Fee Mensualista</span><span>- {formatCOP(selectedPayment.mensualistaFee)}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm"><span className="text-muted-foreground">Neto empresa</span><span>{formatCOP(selectedPayment.providerNet)}</span></div>
                </div>
                <div className="space-y-2">
                  {[['Producto', service?.name], ['Cliente', selectedPayment.clientName], ['Fecha', formatDate(selectedPayment.scheduledDate)], ['Referencia', selectedPayment.referenceId || selectedPayment.id]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm"><span className="text-muted-foreground">{l}</span><span className="font-medium">{v}</span></div>
                  ))}
                </div>
                {selectedPayment.status === 'falló' && (
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"><p className="text-sm text-red-600"><strong>Error:</strong> {selectedPayment.failureReason || 'Cuenta bancaria inválida'}</p></div>
                )}
                {selectedPayment.status === 'enviado' && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20"><p className="text-sm text-green-600"><strong>Completado:</strong> Transferencia exitosa.</p></div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ===== REFUND REQUEST MODAL ===== */}
      <Dialog open={!!refundSale} onOpenChange={() => { setRefundSale(null); setRefundReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-orange-600" /> Solicitar devolución</DialogTitle>
            <DialogDescription>
              {refundSale && (() => {
                const s = allServices.find(sv => sv.id === refundSale.serviceId);
                return s?.refundPolicy.autoRefund ? "Devolución automática — se procesa al instante." : "La empresa revisará tu solicitud.";
              })()}
            </DialogDescription>
          </DialogHeader>
          {refundSale && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Gig</span><span className="font-medium">{allServices.find(s => s.id === refundSale.serviceId)?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{refundSale.clientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-semibold text-primary">{formatCOP(refundSale.grossAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Comisión que se revierte</span><span className="text-red-600">- {formatCOP(refundSale.sellerCommissionAmount)}</span></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo</label>
                <Textarea placeholder="Explica por qué solicitas la devolución..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={3} />
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-sm text-orange-700"><strong>Importante:</strong> Tu comisión de {formatCOP(refundSale.sellerCommissionAmount)} será revertida.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRefundSale(null); setRefundReason(""); }}>Cancelar</Button>
                <Button onClick={handleRefundRequest} disabled={!refundReason.trim()} className="bg-orange-600 hover:bg-orange-700 text-white">Confirmar devolución</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}