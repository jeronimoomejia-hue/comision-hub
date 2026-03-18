import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Edit3, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { services, formatCOP, CURRENT_COMPANY_ID, type Service } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import ServiceEditModal from "@/components/company/ServiceEditModal";

export default function CompanyServices() {
  const { sales: demoSales, currentCompanyPlan } = useDemo();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showNewService, setShowNewService] = useState(false);

  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companySales = demoSales.filter(s => s.companyId === CURRENT_COMPANY_ID);

  const maxServices = currentCompanyPlan === 'freemium' ? 5 : Infinity;
  const canAddMore = companyServices.length < maxServices;

  const getServiceStats = (serviceId: string) => {
    const ss = companySales.filter(s => s.serviceId === serviceId);
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    return { salesMonth: ss.filter(s => new Date(s.createdAt) >= monthAgo).length };
  };

  const handleSaveService = (updatedService: Partial<Service>) => {
    toast.success("Cambios guardados");
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
            size="sm" 
            className="h-8 text-xs" 
            onClick={() => canAddMore ? setShowNewService(true) : toast.error("Límite de servicios alcanzado. Mejora tu plan.")}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nuevo servicio
          </Button>
        </div>

        {currentCompanyPlan === 'freemium' && !canAddMore && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">Has alcanzado el límite de 5 servicios del plan Freemium. Mejora a Premium para servicios ilimitados.</p>
          </div>
        )}

        {/* Integration type info */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            {currentCompanyPlan === 'enterprise' 
              ? '🔗 Plan Enterprise: Integración automática de códigos de activación vía API.'
              : '📋 Códigos de activación manuales — ingresa los códigos al registrar cada venta.'
            }
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {companyServices.map(service => {
            const stats = getServiceStats(service.id);
            return (
              <div key={service.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{service.name}</p>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{service.type}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{service.category} · {stats.salesMonth} ventas/mes · {service.vendorCommissionPct}% comisión</p>
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

        <Dialog open={showNewService} onOpenChange={setShowNewService}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-base">Crear nuevo servicio</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Nombre del servicio</Label><Input className="h-8 text-sm mt-1" /></div>
              <div><Label className="text-xs">Descripción</Label><Textarea className="text-sm mt-1" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Categoría</Label>
                  <Select><SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguros">Seguros</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Tipo</Label>
                  <Select><SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suscripción">Suscripción</SelectItem>
                      <SelectItem value="puntual">Puntual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Precio (COP)</Label><Input type="number" className="h-8 text-sm mt-1" /></div>
                <div><Label className="text-xs">Comisión vendedor %</Label><Input type="number" className="h-8 text-sm mt-1" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" className="text-xs" onClick={() => { setShowNewService(false); toast.success("Servicio creado"); }}>
                Crear servicio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
