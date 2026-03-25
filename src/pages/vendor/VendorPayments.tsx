import { useState, useMemo } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { StatCard, EmptyState, DataTable } from "@/components/dashboard/DashboardComponents";
import { 
  DollarSign, CheckCircle2, AlertTriangle, Clock, CreditCard, Eye, MessageCircle,
  Search, Filter, RotateCcw, ShieldAlert, ChevronDown, ChevronUp, Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, CURRENT_VENDOR_ID, formatCOP, formatDate, services as allServices } from "@/data/mockData";
import type { Sale } from "@/data/mockData";
import { toast } from "sonner";

export default function VendorPayments() {
  const { sales, commissions, vendorPayments, refundRequests, addRefundRequest, currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [refundSale, setRefundSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [expandedService, setExpandedService] = useState<string | null>(null);

  // My sales
  const mySales = useMemo(() => 
    sales.filter(s => s.vendorId === currentVendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales, currentVendorId]
  );

  // Group sales by service
  const salesByService = useMemo(() => {
    const grouped: Record<string, { service: typeof allServices[0]; sales: Sale[] }> = {};
    mySales.forEach(sale => {
      if (!grouped[sale.serviceId]) {
        const service = allServices.find(s => s.id === sale.serviceId);
        if (service) {
          grouped[sale.serviceId] = { service, sales: [] };
        }
      }
      if (grouped[sale.serviceId]) {
        grouped[sale.serviceId].sales.push(sale);
      }
    });
    return Object.values(grouped).sort((a, b) => b.sales.length - a.sales.length);
  }, [mySales]);

  // Commissions
  const vendorCommissions = commissions.filter(c => c.vendorId === currentVendorId);
  
  // KPIs
  const thisMonth = new Date().toISOString().slice(0, 7);
  const releasedThisMonth = vendorCommissions.filter(c => c.status === 'RELEASED' && c.createdAt.startsWith(thisMonth));
  const totalReleasedThisMonth = releasedThisMonth.reduce((acc, c) => acc + c.amountCOP, 0);
  
  const heldSales = mySales.filter(s => s.status === 'HELD');
  const releasedSales = mySales.filter(s => s.status === 'RELEASED');
  const refundedSales = mySales.filter(s => s.status === 'REFUNDED');
  const totalHeld = heldSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);
  const totalReleased = releasedSales.reduce((acc, s) => acc + s.sellerCommissionAmount, 0);

  // Filter
  const filteredSales = mySales.filter(sale => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const matchesSearch = sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesService = serviceFilter === "all" || sale.serviceId === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  // Unique services for filter
  const uniqueServices = [...new Set(mySales.map(s => s.serviceId))].map(
    id => allServices.find(s => s.id === id)
  ).filter(Boolean);

  // Check if sale is eligible for refund
  const canRequestRefund = (sale: Sale) => {
    if (sale.status !== 'HELD') return false;
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service) return false;
    const existingRefund = refundRequests.find(r => r.saleId === sale.id);
    if (existingRefund) return false;
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= service.refundPolicy.refundWindowDays;
  };

  const getRefundDaysLeft = (sale: Sale) => {
    const service = allServices.find(s => s.id === sale.serviceId);
    if (!service) return 0;
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, service.refundPolicy.refundWindowDays - diffDays);
  };

  const handleRefundRequest = () => {
    if (!refundSale || !refundReason.trim()) return;
    const service = allServices.find(s => s.id === refundSale.serviceId);
    if (!service) return;
    
    addRefundRequest({
      saleId: refundSale.id,
      vendorId: currentVendorId,
      companyId: refundSale.companyId,
      serviceId: refundSale.serviceId,
      reason: refundReason,
      status: service.refundPolicy.autoRefund ? 'automático' : 'pendiente',
      decisionBy: service.refundPolicy.autoRefund ? 'sistema' : undefined,
      decidedAt: service.refundPolicy.autoRefund ? new Date().toISOString().split('T')[0] : undefined,
    });

    toast.success(
      service.refundPolicy.autoRefund
        ? "Devolución procesada automáticamente"
        : "Solicitud de devolución enviada a la empresa",
      { description: service.refundPolicy.autoRefund 
          ? "El monto será revertido" 
          : "Recibirás una respuesta pronto" }
    );
    setRefundSale(null);
    setRefundReason("");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      'HELD': { className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: 'En retención' },
      'RELEASED': { className: "bg-green-500/10 text-green-600 border-green-500/20", label: 'Liberado' },
      'REFUNDED': { className: "bg-red-500/10 text-red-600 border-red-500/20", label: 'Reembolsado' },
    };
    const item = map[status] || { className: "bg-muted text-muted-foreground", label: status };
    return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
  };

  const handleSupport = (sale: Sale) => {
    const service = allServices.find(s => s.id === sale.serviceId);
    const message = `Hola, necesito ayuda con una venta:\n\n` +
      `📋 Servicio: ${service?.name || 'N/A'}\n` +
      `👤 Cliente: ${sale.clientName}\n` +
      `💰 Monto: ${formatCOP(sale.grossAmount)}\n` +
      `📅 Fecha: ${formatDate(sale.createdAt)}\n` +
      `📊 Estado: ${sale.status}`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <DashboardLayout role="vendor" userName={vendor?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mis Ventas y Pagos</h1>
          <p className="text-muted-foreground mt-1">
            Tus ventas por servicio, estado de retención y pagos automáticos
          </p>
        </div>

        {/* Main KPI */}
        <div className="card-premium p-6 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 ring-2 ring-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Comisiones liberadas del mes
              </p>
              <p className="text-4xl font-bold text-primary">{formatCOP(totalReleasedThisMonth)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {releasedThisMonth.length} transacciones liberadas
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-5 h-5" />
              <span>Transferencia automática a tu cuenta</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total ventas" 
            value={mySales.length} 
            icon={DollarSign}
            subtitle={`${uniqueServices.length} servicios`}
          />
          <StatCard 
            title="En retención" 
            value={formatCOP(totalHeld)} 
            icon={Clock}
            subtitle={`${heldSales.length} ventas pendientes`}
            variant="warning"
          />
          <StatCard 
            title="Liberadas" 
            value={formatCOP(totalReleased)} 
            icon={CheckCircle2}
            subtitle={`${releasedSales.length} ventas cobradas`}
            variant="success"
          />
          <StatCard 
            title="Reembolsadas" 
            value={refundedSales.length} 
            icon={RotateCcw}
            variant={refundedSales.length > 0 ? "error" : "default"}
          />
        </div>

        {/* Info */}
        <div className="card-premium p-4 bg-muted/30 border-l-4 border-primary">
          <p className="text-sm">
            <strong>¿Cómo funciona?</strong> Cada venta entra en <strong>retención</strong> (7 días). 
            Al liberarse, tu comisión se transfiere automáticamente a tu cuenta bancaria. 
            Puedes solicitar devolución si estás dentro del período de gracia del servicio.
          </p>
        </div>

        {/* ========== Sales by Service (grouped) ========== */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Ventas por servicio
          </h2>

          <div className="space-y-3">
            {salesByService.map(({ service, sales: serviceSales }) => {
              const held = serviceSales.filter(s => s.status === 'HELD');
              const released = serviceSales.filter(s => s.status === 'RELEASED');
              const refunded = serviceSales.filter(s => s.status === 'REFUNDED');
              const totalCommission = serviceSales.reduce((sum, s) => sum + s.sellerCommissionAmount, 0);
              const isExpanded = expandedService === service.id;

              return (
                <div key={service.id} className="card-premium overflow-hidden">
                  {/* Service Header - clickable */}
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
                        <p className="text-xs text-muted-foreground">
                          {service.category} · {service.vendorCommissionPct}% comisión · {service.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="w-3.5 h-3.5" /> {held.length}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {released.length}
                        </span>
                        {refunded.length > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <RotateCcw className="w-3.5 h-3.5" /> {refunded.length}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-primary">{formatCOP(totalCommission)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded sales table */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/40">
                              <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                              <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                              <th className="text-right p-3 font-medium text-muted-foreground">Venta bruta</th>
                              <th className="text-right p-3 font-medium text-muted-foreground">Tu comisión</th>
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
                                  <td className="p-3 text-center">
                                    {sale.status === 'HELD' ? (
                                      <span className="text-xs text-yellow-600 font-medium">
                                        Hasta {formatDate(sale.holdEndAt)}
                                      </span>
                                    ) : sale.status === 'RELEASED' ? (
                                      <span className="text-xs text-green-600">
                                        {sale.releasedAt ? formatDate(sale.releasedAt) : '—'}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-red-600">Devuelto</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      {eligible && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-orange-600 hover:text-orange-700"
                                          onClick={() => setRefundSale(sale)}
                                        >
                                          <RotateCcw className="w-4 h-4 mr-1" />
                                          <span className="text-xs">Devolver ({daysLeft}d)</span>
                                        </Button>
                                      )}
                                      {existingRefund && (
                                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                                          {existingRefund.status}
                                        </Badge>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-green-600 hover:text-green-700"
                                        onClick={() => handleSupport(sale)}
                                      >
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== Full Sales Table (filterable) ========== */}
        <div className="card-premium">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Todas mis ventas
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vista completa con filtros por estado y servicio
            </p>
          </div>

          {/* Filters */}
          <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="HELD">En retención</SelectItem>
                <SelectItem value="RELEASED">Liberados</SelectItem>
                <SelectItem value="REFUNDED">Reembolsados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {uniqueServices.map(service => (
                  <SelectItem key={service!.id} value={service!.id}>
                    {service!.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filteredSales.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={DollarSign}
                title="Sin ventas"
                description="No se encontraron ventas con esos filtros"
              />
            </div>
          ) : (
            <DataTable headers={["Fecha", "Servicio", "Cliente", "Venta bruta", "Tu comisión", "Estado", "Acciones"]}>
              {filteredSales.slice(0, 50).map(sale => {
                const service = allServices.find(s => s.id === sale.serviceId);
                const eligible = canRequestRefund(sale);
                const daysLeft = getRefundDaysLeft(sale);
                const existingRefund = refundRequests.find(r => r.saleId === sale.id);

                return (
                  <tr key={sale.id} className="hover:bg-muted/20">
                    <td className="text-sm">{formatDate(sale.createdAt)}</td>
                    <td className="text-sm">
                      <p className="font-medium">{service?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{service?.type}</p>
                    </td>
                    <td className="text-sm">
                      <p>{sale.clientName}</p>
                      <p className="text-xs text-muted-foreground">{sale.clientEmail}</p>
                    </td>
                    <td className="text-sm text-muted-foreground">{formatCOP(sale.grossAmount)}</td>
                    <td className="font-semibold text-primary">{formatCOP(sale.sellerCommissionAmount)}</td>
                    <td>{getStatusBadge(sale.status)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                          <Eye className="w-4 h-4 mr-1" /> Detalle
                        </Button>
                        {eligible && (
                          <Button 
                            variant="ghost" size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => setRefundSale(sale)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline text-xs">({daysLeft}d)</span>
                          </Button>
                        )}
                        {existingRefund && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                            {existingRefund.status}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </div>
      </div>

      {/* ========== Sale Detail Modal ========== */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Detalle de la venta
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && (() => {
            const service = allServices.find(s => s.id === selectedSale.serviceId);
            const eligible = canRequestRefund(selectedSale);
            const daysLeft = getRefundDaysLeft(selectedSale);
            
            return (
              <div className="space-y-4">
                {/* Amount */}
                <div className="text-center py-4 bg-muted/30 rounded-xl">
                  <p className="text-3xl font-bold text-primary">{formatCOP(selectedSale.sellerCommissionAmount)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Tu comisión ({service?.vendorCommissionPct}%)</p>
                </div>

                {/* Status */}
                <div className={`p-3 rounded-lg flex items-center gap-3 ${
                  selectedSale.status === 'HELD' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  selectedSale.status === 'RELEASED' ? 'bg-green-500/10 border border-green-500/20' :
                  'bg-red-500/10 border border-red-500/20'
                }`}>
                  {selectedSale.status === 'HELD' && <Clock className="w-5 h-5 text-yellow-600" />}
                  {selectedSale.status === 'RELEASED' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {selectedSale.status === 'REFUNDED' && <RotateCcw className="w-5 h-5 text-red-600" />}
                  <div>
                    <p className="font-medium text-sm">
                      {selectedSale.status === 'HELD' && `En retención hasta ${formatDate(selectedSale.holdEndAt)}`}
                      {selectedSale.status === 'RELEASED' && 'Pago liberado y transferido'}
                      {selectedSale.status === 'REFUNDED' && 'Venta reembolsada'}
                    </p>
                  </div>
                </div>

                {/* Financial Split */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-2">
                  <p className="text-sm font-semibold mb-3">Desglose financiero</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Venta bruta</span>
                    <span className="font-medium">{formatCOP(selectedSale.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary">
                    <span>Tu comisión ({service?.vendorCommissionPct}%)</span>
                    <span className="font-semibold">{formatCOP(selectedSale.sellerCommissionAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Fee Mensualista ({service?.mensualistaPct || 8}%)</span>
                    <span>- {formatCOP(selectedSale.mensualistaFeeAmount)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Neto empresa</span>
                    <span>{formatCOP(selectedSale.providerNetAmount)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {[
                    ['Servicio', service?.name],
                    ['Tipo', service?.type === 'suscripción' ? 'Suscripción mensual' : 'Pago único'],
                    ['Cliente', selectedSale.clientName],
                    ['Email', selectedSale.clientEmail],
                    ['Fecha de venta', formatDate(selectedSale.createdAt)],
                    ['Referencia MP', selectedSale.mpPaymentId],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Refund CTA */}
                {eligible && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => { setSelectedSale(null); setRefundSale(selectedSale); }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Solicitar devolución ({daysLeft} días restantes)
                  </Button>
                )}

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSupport(selectedSale)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar soporte
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ========== Refund Request Modal ========== */}
      <Dialog open={!!refundSale} onOpenChange={() => { setRefundSale(null); setRefundReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              Solicitar devolución
            </DialogTitle>
            <DialogDescription>
              {refundSale && (() => {
                const service = allServices.find(s => s.id === refundSale.serviceId);
                return service?.refundPolicy.autoRefund 
                  ? "Este servicio tiene devolución automática. Se procesará al instante."
                  : "La empresa revisará tu solicitud y te notificará.";
              })()}
            </DialogDescription>
          </DialogHeader>
          
          {refundSale && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gig</span>
                  <span className="font-medium">{allServices.find(s => s.id === refundSale.serviceId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span>{refundSale.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto a devolver</span>
                  <span className="font-semibold text-primary">{formatCOP(refundSale.grossAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comisión que se revierte</span>
                  <span className="text-red-600">- {formatCOP(refundSale.sellerCommissionAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo de la devolución</label>
                <Textarea
                  placeholder="Explica por qué solicitas la devolución..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-sm text-orange-700">
                  <strong>Importante:</strong> Al solicitar la devolución, tu comisión de {formatCOP(refundSale.sellerCommissionAmount)} será revertida.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setRefundSale(null); setRefundReason(""); }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleRefundRequest}
                  disabled={!refundReason.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Confirmar devolución
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}