import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Edit3, AlertCircle, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatCOP, CURRENT_COMPANY_ID, type Service } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import ServiceEditModal from "@/components/company/ServiceEditModal";

export default function CompanyServices() {
  const { sales: demoSales, services, currentCompanyPlan, addService, updateService } = useDemo();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showNewService, setShowNewService] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '', description: '', category: 'seguros', type: 'suscripción' as 'suscripción' | 'puntual',
    priceCOP: 150000, vendorCommissionPct: 20, requiresTraining: true, trainingType: 'pdf' as 'pdf' | 'video',
    refundWindowDays: 14 as 7 | 14 | 30, autoRefund: false,
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

  const handleSaveService = (updatedService: Partial<Service>) => {
    if (selectedService) {
      updateService(selectedService.id, updatedService);
    }
    toast.success("Cambios guardados");
  };

  const handleCreateService = () => {
    if (!newForm.name.trim()) { toast.error("Ingresa un nombre"); return; }
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
    });
    setShowNewService(false);
    setNewForm({ name: '', description: '', category: 'seguros', type: 'suscripción', priceCOP: 150000, vendorCommissionPct: 20, requiresTraining: true, trainingType: 'pdf', refundWindowDays: 14, autoRefund: false });
    toast.success("Servicio creado");
  };

  return (
    <DashboardLayout role="company" userName="Poliza.ai">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Servicios</h1>
            {currentCompanyPlan === 'freemium' && (
              <p className="text-xs text-muted-foreground">{companyServices.length}/5 servicios (Freemium)</p>
            )}
          </div>
          <Button 
            size="sm" className="h-8 text-xs" 
            onClick={() => canAddMore ? setShowNewService(true) : toast.error("Límite alcanzado. Mejora tu plan.")}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nuevo servicio
          </Button>
        </div>

        {currentCompanyPlan === 'freemium' && !canAddMore && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">Límite de 5 servicios alcanzado. Mejora a Premium para servicios ilimitados.</p>
          </div>
        )}

        {/* Activation codes info */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-2">
          {currentCompanyPlan === 'enterprise' ? (
            <>
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Enterprise:</span> Códigos de activación automáticos vía API/Webhook.
              </p>
            </>
          ) : (
            <>
              <Key className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Códigos manuales:</span> Ingresa los códigos al confirmar cada venta.
              </p>
            </>
          )}
        </div>

        {/* Services list */}
        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {companyServices.map(service => {
            const stats = getServiceStats(service.id);
            return (
              <div key={service.id} className="flex items-center justify-between px-4 py-3 gap-3">
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
            );
          })}
          {companyServices.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Sin servicios. Crea el primero.</p>
          )}
        </div>

        <ServiceEditModal 
          service={selectedService}
          sales={companySales}
          onClose={() => setSelectedService(null)}
          onSave={handleSaveService}
        />

        {/* Create dialog */}
        <Dialog open={showNewService} onOpenChange={setShowNewService}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="text-base">Crear nuevo servicio</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Nombre del servicio</Label>
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
            </div>
            <DialogFooter>
              <Button size="sm" className="text-xs" onClick={handleCreateService}>
                Crear servicio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
