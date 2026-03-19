import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTutorial from "@/components/PageTutorial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, StatCard, EmptyState } from "@/components/dashboard/DashboardComponents";
import {
  ArrowLeft,
  Building2,
  Clock,
  DollarSign,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Plus,
  Download,
  FileText,
  User,
  Mail,
  MessageSquare,
  Lightbulb,
  Target,
  Shield,
  X
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, formatDate } from "@/data/mockData";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import extendedServiceDetails from "@/data/extendedServiceData";

const refundReasons = [
  { value: "arrepentimiento", label: "Cliente se arrepintió" },
  { value: "insatisfecho", label: "No le gustó el servicio" },
  { value: "error", label: "Error en compra" },
  { value: "otro", label: "Otro" }
];

export default function VendorServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { 
    services, 
    sales, 
    commissions, 
    companies, 
    currentVendorId,
    addRefundRequest,
    addSale,
    refundRequests
  } = useDemo();

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<typeof sales[0] | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sale form state
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleForm, setSaleForm] = useState({ clientName: "", clientEmail: "" });

  // Sales pitch modal
  const [pitchModalOpen, setPitchModalOpen] = useState(false);

  const service = services.find(s => s.id === serviceId);
  
  if (!service) {
    return (
      <DashboardLayout role="vendor" userName="Carlos Mendoza">
        <EmptyState
          icon={Building2}
          title="Servicio no encontrado"
          description="El servicio que buscas no existe"
          action={
            <Button onClick={() => navigate('/vendor/services')}>
              Volver a servicios
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  const company = companies.find(c => c.id === service.companyId);
  const extended = extendedServiceDetails[service.id];

  // Sales data
  const serviceSales = sales.filter(
    s => s.serviceId === serviceId && s.vendorId === currentVendorId
  );
  const thisMonth = new Date();
  const salesThisMonth = serviceSales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
  });
  const activeClients = serviceSales.filter(s => s.status === 'HELD' || s.status === 'RELEASED').length;
  const commissionsThisMonth = commissions.filter(c => {
    const sale = sales.find(s => s.id === c.saleId);
    if (!sale || sale.serviceId !== serviceId || sale.vendorId !== currentVendorId) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
  });
  const commissionsTotal = commissionsThisMonth.reduce((acc, c) => acc + c.amountCOP, 0);
  const refundsThisMonth = refundRequests.filter(r => {
    const d = new Date(r.createdAt);
    return r.serviceId === serviceId && r.vendorId === currentVendorId &&
      d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
  }).length;

  // Refund helpers
  const isEligibleForRefund = (sale: typeof sales[0]) => {
    if (sale.status === 'REFUNDED') return false;
    if (refundRequests.find(r => r.saleId === sale.id)) return false;
    const days = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days <= service.refundPolicy.refundWindowDays;
  };
  const getDaysRemaining = (sale: typeof sales[0]) => {
    const days = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, service.refundPolicy.refundWindowDays - days);
  };
  const handleRefundClick = (sale: typeof sales[0]) => {
    setSelectedSale(sale);
    setRefundReason("");
    setRefundNotes("");
    setRefundDialogOpen(true);
  };
  const handleSubmitRefund = async () => {
    if (!selectedSale || !refundReason) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const reasonLabel = refundReasons.find(r => r.value === refundReason)?.label || refundReason;
    const fullReason = refundNotes ? `${reasonLabel}: ${refundNotes}` : reasonLabel;
    addRefundRequest({
      saleId: selectedSale.id, vendorId: currentVendorId, companyId: service.companyId,
      serviceId: service.id, reason: fullReason,
      status: service.refundPolicy.autoRefund ? 'automático' : 'pendiente',
      decisionBy: service.refundPolicy.autoRefund ? 'sistema' : undefined,
      decidedAt: service.refundPolicy.autoRefund ? new Date().toISOString().split('T')[0] : undefined
    });
    toast.success(service.refundPolicy.autoRefund ? "Devolución automática aplicada" : "Solicitud enviada a la empresa");
    setIsSubmitting(false);
    setRefundDialogOpen(false);
    setSelectedSale(null);
  };

  // Sale submission
  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const grossAmount = service.priceCOP;
    const sellerCommissionAmount = Math.round(grossAmount * service.vendorCommissionPct / 100);
    const mensualistaFeeAmount = Math.round(grossAmount * service.mensualistaPct / 100);
    const providerNetAmount = grossAmount - sellerCommissionAmount - mensualistaFeeAmount;
    addSale({
      serviceId: service.id, vendorId: currentVendorId, companyId: service.companyId,
      clientName: saleForm.clientName, clientEmail: saleForm.clientEmail,
      grossAmount, sellerCommissionAmount, mensualistaFeeAmount, providerNetAmount,
      status: 'HELD', isSubscription: service.type === 'suscripción', subscriptionActive: service.type === 'suscripción',
      amountCOP: grossAmount, holdStartAt: new Date().toISOString(), holdEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentProvider: 'MercadoPago', mpPaymentId: `MP-${Date.now()}`
    });
    toast.success("¡Venta registrada!", { description: `Comisión de ${formatCOP(sellerCommissionAmount)} en retención 7 días.` });
    setSaleForm({ clientName: "", clientEmail: "" });
    setSaleLoading(false);
    setSaleDialogOpen(false);
  };

  const handleDownload = (title: string) => {
    toast.success(`Descargando: ${title}`);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { 'HELD': 'En retención', 'RELEASED': 'Liberada', 'REFUNDED': 'Devuelta' };
    return labels[status] || status;
  };

  return (
    <DashboardLayout role="vendor" userName="Carlos Mendoza">
      <div className="space-y-6">
        <PageTutorial
          pageId="vendor-service-detail"
          title="Detalle del servicio"
          description="Desde aquí registras ventas, descargas materiales y consultas la guía de venta."
          steps={[
            "Usa 'Guía de venta' para ver el pitch, objeciones y datos del cliente ideal",
            "Registra ventas directamente con el botón 'Registrar venta'",
            "Descarga los materiales de apoyo en la sección inferior"
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate('/vendor/services')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Volver a servicios
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPitchModalOpen(true)}>
              <MessageSquare className="mr-2 w-4 h-4" />
              Guía de venta
            </Button>
            <Button onClick={() => setSaleDialogOpen(true)}>
              <Plus className="mr-2 w-4 h-4" />
              Registrar venta
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="card-premium p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg font-bold">{service.name}</h1>
                  <StatusBadge status="activo" label="ACTIVO" />
                </div>
                <p className="text-muted-foreground">{company?.name || 'Empresa'}</p>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{formatCOP(service.priceCOP)}</p>
                <p className="text-sm text-muted-foreground">
                  {service.type === 'suscripción' ? 'mensual' : 'pago único'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                service.type === 'suscripción' 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              }`}>
                {service.type === 'suscripción' ? 'Suscripción' : 'Puntual'}
              </span>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Política de devolución
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Devolución automática:</span>
                <span className={`ml-2 font-medium ${service.refundPolicy.autoRefund ? 'text-green-600' : 'text-amber-600'}`}>
                  {service.refundPolicy.autoRefund ? 'Sí' : 'No (requiere aprobación)'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Plazo:</span>
                <span className="ml-2 font-medium">{service.refundPolicy.refundWindowDays} días</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Ventas del mes" value={salesThisMonth.length} icon={ShoppingCart} />
          {service.type === 'suscripción' && (
            <StatCard title="Clientes activos" value={activeClients} icon={Users} variant="success" />
          )}
          <StatCard title="Comisiones del mes" value={formatCOP(commissionsTotal)} icon={TrendingUp} />
          <StatCard title="Devoluciones" value={refundsThisMonth} icon={RotateCcw} variant={refundsThisMonth > 0 ? "warning" : "default"} />
        </div>

        {/* Materials Section */}
        {service.materials.length > 0 && (
          <div className="card-premium">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Materiales de venta
              </h2>
              <span className="text-xs text-muted-foreground">{service.materials.length} archivo{service.materials.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-border">
              {service.materials.map(material => (
                <div key={material.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{material.title}</p>
                      <p className="text-xs text-muted-foreground">PDF • {material.uploadedAt}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(material.title)}>
                    <Download className="w-4 h-4 mr-1" /> Descargar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sales Table */}
        <div className="card-premium">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Clientes / ventas de este servicio</h2>
          </div>
          
          {serviceSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Comisión</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceSales.slice(0, 15).map((sale) => {
                  const commission = commissions.find(c => c.saleId === sale.id);
                  const eligible = isEligibleForRefund(sale);
                  const daysRemaining = getDaysRemaining(sale);
                  const existingRefund = refundRequests.find(r => r.saleId === sale.id);
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{formatDate(sale.createdAt)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.clientName}</p>
                          <p className="text-xs text-muted-foreground">{sale.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {sale.activationCode ? (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{sale.activationCode}</code>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={sale.status === 'RELEASED' ? 'activo' : sale.status === 'REFUNDED' ? 'rechazado' : 'pendiente'} 
                          label={getStatusLabel(sale.status)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCOP(sale.amountCOP)}</TableCell>
                      <TableCell className="text-right">
                        {commission ? (
                          <div>
                            <p className="font-medium text-green-600">{formatCOP(commission.amountCOP)}</p>
                            <p className="text-xs text-muted-foreground">{getStatusLabel(commission.status)}</p>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {existingRefund ? (
                          <span className={`text-xs px-2 py-1 rounded ${
                            existingRefund.status === 'pendiente' ? 'bg-amber-500/10 text-amber-600' :
                            existingRefund.status === 'aprobado' || existingRefund.status === 'automático' ? 'bg-green-500/10 text-green-600' :
                            'bg-red-500/10 text-red-600'
                          }`}>
                            Devolución {existingRefund.status}
                          </span>
                        ) : eligible ? (
                          <Button variant="outline" size="sm" onClick={() => handleRefundClick(sale)}>
                            <RotateCcw className="mr-1 w-3 h-3" />
                            Devolución ({daysRemaining}d)
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {sale.status === 'REFUNDED' ? 'Devuelta' : 'Fuera de período'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={ShoppingCart}
                title="Sin ventas aún"
                description="Registra tu primera venta de este servicio"
                action={
                  <Button onClick={() => setSaleDialogOpen(true)}>
                    <Plus className="mr-2 w-4 h-4" /> Registrar venta
                  </Button>
                }
              />
            </div>
          )}
        </div>

        {/* ============ SALE REGISTRATION DIALOG ============ */}
        <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar venta</DialogTitle>
              <DialogDescription>
                {service.name} — {formatCOP(service.priceCOP)} ({service.vendorCommissionPct}% comisión)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitSale} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del cliente</Label>
                <div className="relative">
                  <Input className="pl-10" placeholder="Juan García" value={saleForm.clientName} onChange={(e) => setSaleForm({...saleForm, clientName: e.target.value})} required />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email del cliente</Label>
                <div className="relative">
                  <Input className="pl-10" type="email" placeholder="cliente@email.com" value={saleForm.clientEmail} onChange={(e) => setSaleForm({...saleForm, clientEmail: e.target.value})} required />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="font-medium">{formatCOP(service.priceCOP)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%):</span>
                  <span className="font-medium text-primary">{formatCOP(Math.round(service.priceCOP * service.vendorCommissionPct / 100))}</span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSaleDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saleLoading}>
                  {saleLoading ? "Registrando..." : "Registrar venta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ============ REFUND DIALOG ============ */}
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Solicitar devolución</DialogTitle>
              <DialogDescription>
                {service.refundPolicy.autoRefund 
                  ? "Esta devolución se procesará automáticamente."
                  : "La empresa revisará tu solicitud."}
              </DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cliente:</span><span className="font-medium">{selectedSale.clientName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Monto:</span><span className="font-medium text-primary">{formatCOP(selectedSale.amountCOP)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Días restantes:</span><span className="font-medium">{getDaysRemaining(selectedSale)} días</span></div>
                </div>
                {service.refundPolicy.autoRefund ? (
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-400">Reembolso automático inmediato.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700 dark:text-amber-400">Requiere aprobación de la empresa.</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Motivo *</Label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                    <SelectContent>
                      {refundReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Textarea placeholder="Detalles adicionales..." value={refundNotes} onChange={(e) => setRefundNotes(e.target.value)} rows={3} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button onClick={handleSubmitRefund} disabled={!refundReason || isSubmitting}>
                {isSubmitting ? "Enviando..." : "Solicitar devolución"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ SALES PITCH MODAL ============ */}
        <Dialog open={pitchModalOpen} onOpenChange={setPitchModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Guía de venta — {service.name}
              </DialogTitle>
              <DialogDescription>Speeches, datos y recomendaciones para vender este servicio</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[65vh]">
              <Tabs defaultValue="pitch" className="px-6 pb-6">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="pitch">Speech</TabsTrigger>
                  <TabsTrigger value="objections">Objeciones</TabsTrigger>
                  <TabsTrigger value="client">Cliente ideal</TabsTrigger>
                  <TabsTrigger value="info">Info clave</TabsTrigger>
                </TabsList>

                {/* SPEECH TAB */}
                <TabsContent value="pitch" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Pitch de una línea
                      </h4>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="font-medium text-lg italic">"{extended?.pitchOneLine}"</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pitch de 3 líneas</h4>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">{extended?.pitchThreeLines}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preguntas de calificación</h4>
                      <ul className="space-y-2">
                        {extended?.qualificationQuestions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                {/* OBJECTIONS TAB */}
                <TabsContent value="objections" className="space-y-3">
                  {extended?.objections.map((obj, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border space-y-2">
                      <p className="font-medium text-sm flex items-start gap-2">
                        <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        "{obj.objection}"
                      </p>
                      <p className="text-sm text-muted-foreground ml-6">
                        → {obj.response}
                      </p>
                    </div>
                  ))}
                </TabsContent>

                {/* CLIENT TAB */}
                <TabsContent value="client" className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Cliente ideal
                    </h4>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">{extended?.idealClient}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Audiencia objetivo</h4>
                    <p className="text-sm text-muted-foreground">{extended?.targetAudience}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Casos de uso</h4>
                    <ul className="space-y-1.5">
                      {extended?.useCases.map((uc, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                {/* INFO TAB */}
                <TabsContent value="info" className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Problema que resuelve</h4>
                    <p className="text-sm">{extended?.problemSolved}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Resultado prometido</h4>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">{extended?.promisedResult}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Qué incluye</h4>
                    <ul className="space-y-1">
                      {extended?.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">No incluye</h4>
                    <ul className="space-y-1">
                      {extended?.notIncluded.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Activación:</span>
                      <p className="font-medium">{extended?.activationTime}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Garantía:</span>
                      <p className="font-medium">{extended?.guarantee}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}