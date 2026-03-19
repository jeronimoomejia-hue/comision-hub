import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Edit3, AlertCircle, Key, Zap, Package, AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { formatCOP, CURRENT_COMPANY_ID, type Service } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import ServiceEditModal from "@/components/company/ServiceEditModal";

export default function CompanyServices() {
  const { sales: demoSales, services, currentCompanyPlan, addService, updateService, addActivationCodes } = useDemo();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showNewService, setShowNewService] = useState(false);
  const [showAddCodes, setShowAddCodes] = useState<Service | null>(null);
  const [newCodes, setNewCodes] = useState("");
  const [newForm, setNewForm] = useState({
    name: '', description: '', category: 'seguros', type: 'suscripción' as 'suscripción' | 'puntual',
    priceCOP: 150000, vendorCommissionPct: 20, requiresTraining: true, trainingType: 'pdf' as 'pdf' | 'video',
    refundWindowDays: 14 as 7 | 14 | 30, autoRefund: false,
    initialCodes: '',
  });

  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companySales = demoSales.filter(s => s.companyId === CURRENT_COMPANY_ID);

  const maxServices = currentCompanyPlan === 'freemium' ? 5 : Infinity;
  const canAddMore = companyServices.length < maxServices;

  const getServiceStats = (serviceId: string) => {
    const ss = companySales.filter(s => s.serviceId === serviceId);
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    return { salesMonth: ss.filter(s => new Date(s.createdAt) >= monthAgo).length, totalSales: ss.length };
  };

  const getCodeStats = (service: Service) => {
    const total = service.activationCodes.length;
    const available = service.activationCodes.filter(c => c.status === 'available').length;
    const delivered = service.activationCodes.filter(c => c.status === 'delivered').length;
    const pct = total > 0 ? (available / total) * 100 : 0;
    const isLow = available < 5;
    const isEmpty = available === 0;
    return { total, available, delivered, pct, isLow, isEmpty };
  };

  const handleSaveService = (updatedService: Partial<Service>) => {
    if (selectedService) {
      updateService(selectedService.id, updatedService);
    }
    toast.success("Cambios guardados");
  };

  const handleCreateService = () => {
    if (!newForm.name.trim()) { toast.error("Ingresa un nombre"); return; }
    const codeLines = newForm.initialCodes.split('\n').map(c => c.trim()).filter(Boolean);
    if (codeLines.length < 20 && currentCompanyPlan !== 'enterprise') {
      toast.error("Debes ingresar mínimo 20 códigos de activación");
      return;
    }
    addService({
      companyId: CURRENT_COMPANY_ID,
      name: newForm.name,
      description: newForm.description,
      category: newForm.category,
      priceCOP: newForm.priceCOP,
      type: newForm.type,
      vendorCommissionPct: newForm.vendorCommissionPct,
      mensualistaPct: currentCompanyPlan === 'freemium' ? 15 : 8,
      status: 'activo',
      refundPolicy: { autoRefund: newForm.autoRefund, refundWindowDays: newForm.refundWindowDays },
      requiresTraining: newForm.requiresTraining,
      trainingType: newForm.trainingType,
      materials: [],
      activationCodes: codeLines.map((code, i) => ({
        id: `ac-new-${Date.now()}-${i}`,
        code,
        status: 'available' as const,
      })),
    });
    setShowNewService(false);
    setNewForm({ name: '', description: '', category: 'seguros', type: 'suscripción', priceCOP: 150000, vendorCommissionPct: 20, requiresTraining: true, trainingType: 'pdf', refundWindowDays: 14, autoRefund: false, initialCodes: '' });
    toast.success("Gig creado con " + codeLines.length + " códigos");
  };

  const handleAddCodes = () => {
    if (!showAddCodes) return;
    const codeLines = newCodes.split('\n').map(c => c.trim()).filter(Boolean);
    if (codeLines.length === 0) { toast.error("Ingresa al menos un código"); return; }
    addActivationCodes(showAddCodes.id, codeLines);
    toast.success(`${codeLines.length} códigos agregados`);
    setShowAddCodes(null);
    setNewCodes("");
  };

  // Services with low stock
  const lowStockServices = companyServices.filter(s => {
    const codes = getCodeStats(s);
    return codes.isLow && s.status === 'activo';
  });

  return (
    <DashboardLayout role="company" userName="Poliza.ai">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Servicios</h1>
            {currentCompanyPlan === 'freemium' && (
              <p className="text-xs text-muted-foreground">{companyServices.length}/5 gigs (Freemium)</p>
            )}
          </div>
          <Button 
            size="sm" className="h-8 text-xs" 
            onClick={() => canAddMore ? setShowNewService(true) : toast.error("Límite alcanzado. Mejora tu plan.")}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nuevo gig
          </Button>
        </div>

        {currentCompanyPlan === 'freemium' && !canAddMore && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">Límite de 5 gigs alcanzado. Mejora a Premium para gigs ilimitados.</p>
          </div>
        )}

        {/* Activation codes explanation */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          {currentCompanyPlan === 'enterprise' ? (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Enterprise:</span> Los códigos se sincronizan automáticamente vía API/Webhook. No necesitas cargarlos manualmente.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Códigos de activación:</span> Carga mínimo 20 códigos por gig. La plataforma los entrega automáticamente a cada comprador. Cuando se agoten, agrega más.
              </p>
            </div>
          )}
        </div>

        {/* Low stock alert */}
        {lowStockServices.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-xs font-medium text-destructive">
                {lowStockServices.length === 1 ? '1 gig tiene' : `${lowStockServices.length} gigs tienen`} pocos códigos disponibles
              </p>
            </div>
            {lowStockServices.map(s => {
              const codes = getCodeStats(s);
              return (
                <div key={s.id} className="flex items-center justify-between text-xs pl-6">
                  <span className="text-muted-foreground">{s.name}: <span className={codes.isEmpty ? 'text-destructive font-semibold' : 'text-amber-600 font-medium'}>{codes.available} disponibles</span></span>
                  <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => { setShowAddCodes(s); setNewCodes(""); }}>
                    <Upload className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Services list */}
        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {companyServices.map(service => {
            const stats = getServiceStats(service.id);
            const codes = getCodeStats(service);
            return (
              <div key={service.id} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{service.name}</p>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{service.type}</Badge>
                      {service.status === 'pausado' && <Badge variant="secondary" className="text-[9px] px-1 py-0">Pausado</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {service.category} · {stats.salesMonth} ventas/mes · {service.vendorCommissionPct}% comisión · {service.refundPolicy.refundWindowDays}d devolución
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{formatCOP(service.priceCOP)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedService(service)}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Activation codes stock bar */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Package className={`w-3 h-3 flex-shrink-0 ${codes.isEmpty ? 'text-destructive' : codes.isLow ? 'text-amber-500' : 'text-primary'}`} />
                    <div className="flex-1">
                      <Progress 
                        value={codes.pct} 
                        className={`h-1.5 ${codes.isEmpty ? '[&>div]:bg-destructive' : codes.isLow ? '[&>div]:bg-amber-500' : '[&>div]:bg-primary'}`}
                      />
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${codes.isEmpty ? 'text-destructive' : codes.isLow ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {codes.available}/{codes.total} códigos
                    </span>
                  </div>
                  <Button 
                    variant="ghost" size="sm" 
                    className={`h-6 text-[10px] px-2 ${codes.isLow ? 'text-amber-600 hover:text-amber-700' : ''}`}
                    onClick={() => { setShowAddCodes(service); setNewCodes(""); }}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            );
          })}
          {companyServices.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Sin gigs. Crea el primero.</p>
          )}
        </div>

        <ServiceEditModal 
          service={selectedService}
          sales={companySales}
          onClose={() => setSelectedService(null)}
          onSave={handleSaveService}
        />

        {/* Add codes dialog */}
        <Dialog open={!!showAddCodes} onOpenChange={() => setShowAddCodes(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Agregar códigos de activación</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {showAddCodes?.name} — {showAddCodes && getCodeStats(showAddCodes).available} códigos disponibles actualmente
              </p>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Códigos (uno por línea)</Label>
                <Textarea 
                  className="text-sm mt-1 font-mono" 
                  rows={8} 
                  placeholder={"CODIGO-001\nCODIGO-002\nCODIGO-003\n..."}
                  value={newCodes}
                  onChange={e => setNewCodes(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {newCodes.split('\n').filter(c => c.trim()).length} códigos ingresados
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" className="text-xs" onClick={handleAddCodes}>
                <Upload className="w-3.5 h-3.5 mr-1" />
                Agregar códigos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create dialog */}
        <Dialog open={showNewService} onOpenChange={setShowNewService}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-base">Crear nuevo gig</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Nombre del gig</Label>
                <Input className="h-8 text-sm mt-1" value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} />
              </div>
              <div><Label className="text-xs">Descripción</Label>
                <Textarea className="text-sm mt-1" rows={2} value={newForm.description} onChange={e => setNewForm({...newForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Categoría</Label>
                  <Select value={newForm.category} onValueChange={v => setNewForm({...newForm, category: v})}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguros">Seguros</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ventas">Ventas</SelectItem>
                      <SelectItem value="rrhh">RRHH</SelectItem>
                      <SelectItem value="contabilidad">Contabilidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Tipo</Label>
                  <Select value={newForm.type} onValueChange={v => setNewForm({...newForm, type: v as any})}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suscripción">Suscripción</SelectItem>
                      <SelectItem value="puntual">Puntual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Precio (COP)</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={newForm.priceCOP}
                    onChange={e => setNewForm({...newForm, priceCOP: Number(e.target.value)})} />
                </div>
                <div><Label className="text-xs">Comisión vendedor %</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={newForm.vendorCommissionPct}
                    onChange={e => setNewForm({...newForm, vendorCommissionPct: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Días de devolución</Label>
                  <Select value={String(newForm.refundWindowDays)} onValueChange={v => setNewForm({...newForm, refundWindowDays: Number(v) as 7|14|30})}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="14">14 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Switch checked={newForm.autoRefund} onCheckedChange={v => setNewForm({...newForm, autoRefund: v})} />
                  <Label className="text-xs">Devolución automática</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newForm.requiresTraining} onCheckedChange={v => setNewForm({...newForm, requiresTraining: v})} />
                <Label className="text-xs">Requiere capacitación</Label>
              </div>
              {newForm.requiresTraining && (
                <div><Label className="text-xs">Tipo de capacitación</Label>
                  <Select value={newForm.trainingType} onValueChange={v => setNewForm({...newForm, trainingType: v as any})}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF / Documento</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Activation codes section */}
              {currentCompanyPlan !== 'enterprise' && (
                <div className="border-t border-border pt-3">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Key className="w-3 h-3" />
                    Códigos de activación (mínimo 20)
                  </Label>
                  <Textarea 
                    className="text-sm mt-1 font-mono" 
                    rows={5} 
                    placeholder={"CODIGO-001\nCODIGO-002\nCODIGO-003\n... (uno por línea, mínimo 20)"}
                    value={newForm.initialCodes}
                    onChange={e => setNewForm({...newForm, initialCodes: e.target.value})}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {newForm.initialCodes.split('\n').filter(c => c.trim()).length}/20 códigos ingresados — Se entregan automáticamente al comprador tras el pago.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button size="sm" className="text-xs" onClick={handleCreateService}>
                Crear gig
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
