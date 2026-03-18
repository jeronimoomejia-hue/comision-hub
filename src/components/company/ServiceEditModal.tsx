import { useState, useMemo } from "react";
import { 
  Edit3, TrendingUp, DollarSign, Users, ShoppingCart, 
  FileText, Upload, Save, X, BarChart3, RefreshCw,
  Calendar, ExternalLink, AlertCircle, CheckCircle2, 
  MessageCircle, Eye, Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatCOP, formatDate, type Service, type Sale } from "@/data/mockData";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface ServiceEditModalProps {
  service: Service | null;
  sales: Sale[];
  onClose: () => void;
  onSave: (updatedService: Partial<Service>) => void;
}

export default function ServiceEditModal({ service, sales, onClose, onSave }: ServiceEditModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Service>>({});

  // Service metrics
  const serviceMetrics = useMemo(() => {
    if (!service) return null;
    
    const serviceSales = sales.filter(s => s.serviceId === service.id);
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);
    
    const salesThisMonth = serviceSales.filter(s => s.createdAt.startsWith(thisMonth));
    const salesLastMonth = serviceSales.filter(s => s.createdAt.startsWith(lastMonth));
    
    const gmvThisMonth = salesThisMonth.reduce((sum, s) => sum + s.amountCOP, 0);
    const gmvLastMonth = salesLastMonth.reduce((sum, s) => sum + s.amountCOP, 0);
    
    const heldSales = serviceSales.filter(s => s.status === 'HELD');
    const releasedSales = serviceSales.filter(s => s.status === 'RELEASED');
    const refundedSales = serviceSales.filter(s => s.status === 'REFUNDED');
    
    const subscriptionSales = serviceSales.filter(s => s.isSubscription);
    const oneTimeSales = serviceSales.filter(s => !s.isSubscription);
    
    // Weekly data for chart
    const weeklyData: { week: string; ventas: number; monto: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekSales = serviceSales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= weekStart && saleDate < weekEnd;
      });
      
      weeklyData.push({
        week: `S${8 - i}`,
        ventas: weekSales.length,
        monto: weekSales.reduce((sum, s) => sum + s.amountCOP, 0)
      });
    }
    
    return {
      totalSales: serviceSales.length,
      salesThisMonth: salesThisMonth.length,
      salesLastMonth: salesLastMonth.length,
      salesGrowth: salesLastMonth.length > 0 
        ? Math.round(((salesThisMonth.length - salesLastMonth.length) / salesLastMonth.length) * 100)
        : 100,
      gmvThisMonth,
      gmvLastMonth,
      gmvGrowth: gmvLastMonth > 0 
        ? Math.round(((gmvThisMonth - gmvLastMonth) / gmvLastMonth) * 100)
        : 100,
      heldCount: heldSales.length,
      heldAmount: heldSales.reduce((sum, s) => sum + s.amountCOP, 0),
      releasedCount: releasedSales.length,
      releasedAmount: releasedSales.reduce((sum, s) => sum + s.amountCOP, 0),
      refundedCount: refundedSales.length,
      refundedAmount: refundedSales.reduce((sum, s) => sum + s.amountCOP, 0),
      subscriptionCount: subscriptionSales.length,
      oneTimeCount: oneTimeSales.length,
      avgSaleValue: serviceSales.length > 0 
        ? Math.round(serviceSales.reduce((sum, s) => sum + s.amountCOP, 0) / serviceSales.length)
        : 0,
      weeklyData,
      recentSales: serviceSales.slice(0, 5)
    };
  }, [service, sales]);

  const handleStartEdit = () => {
    if (!service) return;
    setEditData({
      name: service.name,
      description: service.description,
      priceCOP: service.priceCOP,
      vendorCommissionPct: service.vendorCommissionPct,
      requiresTraining: service.requiresTraining,
      trainingUrl: service.trainingUrl,
      refundPolicy: { ...service.refundPolicy }
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
    toast.success("Servicio actualizado correctamente");
  };

  const handleCancelEdit = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleSupport = () => {
    const message = `Hola, necesito ayuda con mi servicio:\n- Servicio: ${service?.name}\n- ID: ${service?.id}`;
    window.open(`https://wa.me/573001234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!service || !serviceMetrics) return null;

  const statusData = [
    { name: 'Liberadas', value: serviceMetrics.releasedCount, fill: 'hsl(142, 76%, 36%)' },
    { name: 'En retención', value: serviceMetrics.heldCount, fill: 'hsl(45, 93%, 47%)' },
    { name: 'Devueltas', value: serviceMetrics.refundedCount, fill: 'hsl(262, 83%, 58%)' }
  ].filter(d => d.value > 0);

  const typeData = [
    { name: 'Suscripción', value: serviceMetrics.subscriptionCount, fill: 'hsl(292, 100%, 50%)' },
    { name: 'Puntual', value: serviceMetrics.oneTimeCount, fill: 'hsl(220, 10%, 60%)' }
  ].filter(d => d.value > 0);

  return (
    <Dialog open={!!service} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              <Badge className={service.status === 'activo' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                {service.status === 'activo' ? 'Activo' : 'Pausado'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={handleStartEdit} size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar servicio
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="metrics" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="metrics">📊 Métricas</TabsTrigger>
            <TabsTrigger value="details">📝 Detalles</TabsTrigger>
            <TabsTrigger value="training">🎓 Capacitación</TabsTrigger>
            <TabsTrigger value="sales">💰 Ventas</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* TAB: Metrics */}
            <TabsContent value="metrics" className="space-y-6 m-0">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-premium p-4 bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vendido este mes</p>
                      <p className="text-lg font-bold">{formatCOP(serviceMetrics.gmvThisMonth)}</p>
                      {serviceMetrics.gmvGrowth !== 0 && (
                        <p className={`text-xs ${serviceMetrics.gmvGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {serviceMetrics.gmvGrowth > 0 ? '+' : ''}{serviceMetrics.gmvGrowth}% vs mes anterior
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-premium p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ventas este mes</p>
                      <p className="text-lg font-bold">{serviceMetrics.salesThisMonth}</p>
                      {serviceMetrics.salesGrowth !== 0 && (
                        <p className={`text-xs ${serviceMetrics.salesGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {serviceMetrics.salesGrowth > 0 ? '+' : ''}{serviceMetrics.salesGrowth}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-premium p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">En retención</p>
                      <p className="text-lg font-bold">{serviceMetrics.heldCount}</p>
                      <p className="text-xs text-muted-foreground">{formatCOP(serviceMetrics.heldAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="card-premium p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Liberadas</p>
                      <p className="text-lg font-bold">{serviceMetrics.releasedCount}</p>
                      <p className="text-xs text-muted-foreground">{formatCOP(serviceMetrics.releasedAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-premium p-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Ventas por semana
                  </h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={serviceMetrics.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                      <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'monto' ? formatCOP(value) : value,
                          name === 'monto' ? 'Monto' : 'Ventas'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ventas" 
                        stroke="hsl(292, 100%, 50%)" 
                        fill="hsl(292, 100%, 50%)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="card-premium p-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    Estado de ventas
                  </h4>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie 
                          data={statusData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={40} 
                          outerRadius={65} 
                          paddingAngle={3} 
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                      Sin datos de ventas
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card-premium p-4 text-center">
                  <p className="text-2xl font-bold">{serviceMetrics.totalSales}</p>
                  <p className="text-xs text-muted-foreground">Ventas totales</p>
                </div>
                <div className="card-premium p-4 text-center">
                  <p className="text-2xl font-bold">{formatCOP(serviceMetrics.avgSaleValue)}</p>
                  <p className="text-xs text-muted-foreground">Ticket promedio</p>
                </div>
                <div className="card-premium p-4 text-center">
                  <p className="text-2xl font-bold">{service.activeSubscriptions || 0}</p>
                  <p className="text-xs text-muted-foreground">Suscripciones activas</p>
                </div>
              </div>
            </TabsContent>

            {/* TAB: Details */}
            <TabsContent value="details" className="space-y-6 m-0">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="card-premium p-6 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-primary" />
                      Información básica
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del servicio</Label>
                        <Input 
                          value={editData.name || ''} 
                          onChange={e => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Precio COP</Label>
                        <Input 
                          type="number"
                          value={editData.priceCOP || ''} 
                          onChange={e => setEditData({ ...editData, priceCOP: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea 
                        value={editData.description || ''} 
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Comisión vendedor %</Label>
                        <Input 
                          type="number"
                          value={editData.vendorCommissionPct || ''} 
                          onChange={e => setEditData({ ...editData, vendorCommissionPct: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Días para reembolso</Label>
                        <Select 
                          value={String(editData.refundPolicy?.refundWindowDays || 7)}
                          onValueChange={v => setEditData({ 
                            ...editData, 
                            refundPolicy: { ...editData.refundPolicy!, refundWindowDays: Number(v) as 7 | 14 | 30 }
                          })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 días</SelectItem>
                            <SelectItem value="14">14 días</SelectItem>
                            <SelectItem value="30">30 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label>Reembolso automático</Label>
                        <p className="text-xs text-muted-foreground">El cliente puede solicitar reembolso sin aprobación</p>
                      </div>
                      <Switch 
                        checked={editData.refundPolicy?.autoRefund || false}
                        onCheckedChange={v => setEditData({ 
                          ...editData, 
                          refundPolicy: { ...editData.refundPolicy!, autoRefund: v }
                        })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="card-premium p-6">
                    <h4 className="font-semibold mb-4">Información del servicio</h4>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Precio</p>
                        <p className="text-lg font-bold text-primary">{formatCOP(service.priceCOP)}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Comisión vendedor</p>
                        <p className="text-lg font-bold">{service.vendorCommissionPct}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <Badge variant={service.type === 'suscripción' ? 'default' : 'secondary'} className="mt-1">
                          {service.type === 'suscripción' ? 'Suscripción' : 'Puntual'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="card-premium p-6">
                    <h4 className="font-semibold mb-4">Política de reembolsos</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {service.refundPolicy.autoRefund ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {service.refundPolicy.autoRefund ? 'Reembolso automático' : 'Reembolso manual'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.refundPolicy.autoRefund 
                              ? 'El cliente puede solicitar sin aprobación'
                              : 'Requiere tu aprobación'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{service.refundPolicy.refundWindowDays} días</p>
                          <p className="text-xs text-muted-foreground">Ventana de reembolso</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB: Training */}
            <TabsContent value="training" className="space-y-6 m-0">
              <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Material de capacitación
                  </h4>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir nuevo archivo
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 mb-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {service.requiresTraining ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {service.requiresTraining ? 'Capacitación requerida' : 'Sin capacitación requerida'}
                    </span>
                  </div>
                  {isEditing && (
                    <Switch 
                      checked={editData.requiresTraining ?? service.requiresTraining}
                      onCheckedChange={v => setEditData({ ...editData, requiresTraining: v })}
                    />
                  )}
                </div>

                {service.requiresTraining && (
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{service.trainingType?.toUpperCase() || 'PDF'}</p>
                            <p className="text-xs text-muted-foreground">Material de capacitación actual</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {service.trainingUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={service.trainingUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver
                              </a>
                            </Button>
                          )}
                          {isEditing && (
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Reemplazar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="space-y-2">
                        <Label>URL de capacitación</Label>
                        <Input 
                          value={editData.trainingUrl || service.trainingUrl || ''} 
                          onChange={e => setEditData({ ...editData, trainingUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Materials */}
              <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4 text-primary" />
                    Materiales adicionales
                  </h4>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Agregar material
                    </Button>
                  )}
                </div>
                
                {service.materials && service.materials.length > 0 ? (
                  <div className="space-y-2">
                    {service.materials.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{m.title}</p>
                            <p className="text-xs text-muted-foreground uppercase">{m.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={m.url} target="_blank" rel="noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          {isEditing && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin materiales adicionales</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: Sales */}
            <TabsContent value="sales" className="space-y-6 m-0">
              <div className="card-premium p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Ventas recientes
                </h4>
                
                {serviceMetrics.recentSales.length > 0 ? (
                  <div className="space-y-3">
                    {serviceMetrics.recentSales.map(sale => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{sale.clientName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-medium text-sm">{formatCOP(sale.amountCOP)}</p>
                            <Badge 
                              className={
                                sale.status === 'RELEASED' ? 'bg-green-500/10 text-green-500' :
                                sale.status === 'HELD' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-purple-500/10 text-purple-500'
                              }
                            >
                              {sale.status === 'RELEASED' ? 'Liberada' : sale.status === 'HELD' ? 'En retención' : 'Devuelta'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin ventas registradas</p>
                  </div>
                )}
              </div>

              {/* Type breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card-premium p-4 text-center">
                  <Badge variant="default" className="mb-2">Suscripción</Badge>
                  <p className="text-2xl font-bold">{serviceMetrics.subscriptionCount}</p>
                  <p className="text-xs text-muted-foreground">ventas</p>
                </div>
                <div className="card-premium p-4 text-center">
                  <Badge variant="secondary" className="mb-2">Puntual</Badge>
                  <p className="text-2xl font-bold">{serviceMetrics.oneTimeCount}</p>
                  <p className="text-xs text-muted-foreground">ventas</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={handleSupport}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Soporte
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}