import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { services, serviceRequests, formatCOP, formatDate, CURRENT_COMPANY_ID, type ServiceRequest, type Service } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import ServiceEditModal from "@/components/company/ServiceEditModal";

export default function CompanyServices() {
  const { sales: demoSales } = useDemo();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [acceptMeeting, setAcceptMeeting] = useState(false);

  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companySales = demoSales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyRequests = serviceRequests.filter(r => r.companyId === CURRENT_COMPANY_ID);

  const getServiceStats = (serviceId: string) => {
    const ss = companySales.filter(s => s.serviceId === serviceId);
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    return { salesMonth: ss.filter(s => new Date(s.createdAt) >= monthAgo).length };
  };

  const getRequestStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'en revisión': { cls: "text-amber-600 bg-amber-50", label: "En revisión" },
      'reunión agendada': { cls: "text-blue-600 bg-blue-50", label: "Reunión" },
      'aprobado': { cls: "text-emerald-600 bg-emerald-50", label: "Aprobada" },
      'rechazado': { cls: "text-red-600 bg-red-50", label: "Rechazada" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  const handleSaveService = (updatedService: Partial<Service>) => {
    toast.success("Cambios guardados");
  };

  return (
    <DashboardLayout role="company" userName="Poliza.ai">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Servicios</h1>
          <Button size="sm" className="h-8 text-xs" onClick={() => setShowNewRequest(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />Solicitar
          </Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="h-8">
            <TabsTrigger value="active" className="text-xs">Activos ({companyServices.length})</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs">Solicitudes ({companyRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-3">
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
                <p className="text-xs text-muted-foreground text-center py-8">Sin servicios. Solicita el primero.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-3">
            <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
              {companyRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{req.serviceName}</p>
                    <p className="text-[10px] text-muted-foreground">{req.category} · {formatDate(req.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{formatCOP(req.priceCOP)}</span>
                    {getRequestStatusBadge(req.status)}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedRequest(req)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {companyRequests.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Sin solicitudes</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <ServiceEditModal 
          service={selectedService}
          sales={companySales}
          onClose={() => setSelectedService(null)}
          onSave={handleSaveService}
        />

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Solicitud</DialogTitle></DialogHeader>
            {selectedRequest && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center"><span className="font-semibold">{selectedRequest.serviceName}</span>{getRequestStatusBadge(selectedRequest.status)}</div>
                <p className="text-xs text-muted-foreground">{selectedRequest.description}</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Precio</span><span>{formatCOP(selectedRequest.priceCOP)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Comisión</span><span>{selectedRequest.vendorCommissionPct}%</span></div>
                {selectedRequest.meetingDate && <p className="text-xs text-blue-600 p-2 bg-blue-50 rounded-lg">Reunión: {formatDate(selectedRequest.meetingDate)}</p>}
                {selectedRequest.adminNotes && <p className="text-xs p-2 bg-muted rounded-lg">{selectedRequest.adminNotes}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-base">Solicitar nuevo servicio</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Nombre del servicio</Label><Input className="h-8 text-sm mt-1" /></div>
              <div><Label className="text-xs">Descripción</Label><Textarea className="text-sm mt-1" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Categoría</Label><Select><SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="seguros">Seguros</SelectItem><SelectItem value="legal">Legal</SelectItem><SelectItem value="marketing">Marketing</SelectItem></SelectContent></Select></div>
                <div><Label className="text-xs">Tipo</Label><Select><SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="suscripción">Suscripción</SelectItem><SelectItem value="puntual">Puntual</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Precio (COP)</Label><Input type="number" className="h-8 text-sm mt-1" /></div>
                <div><Label className="text-xs">Comisión vendedor %</Label><Input type="number" className="h-8 text-sm mt-1" /></div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Checkbox id="meeting" checked={acceptMeeting} onCheckedChange={(v) => setAcceptMeeting(!!v)} />
                <label htmlFor="meeting" className="text-xs text-muted-foreground">Acepto agendar reunión obligatoria</label>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" className="text-xs" disabled={!acceptMeeting} onClick={() => { setShowNewRequest(false); setAcceptMeeting(false); toast.success("Solicitud enviada"); }}>
                Enviar solicitud
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}