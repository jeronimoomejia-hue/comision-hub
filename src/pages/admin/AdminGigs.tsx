import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { services, companies, sales, serviceRequests, formatCOP, formatDate, type ServiceRequest } from "@/data/mockData";

export default function AdminServices() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const filtered = services.filter(s => companyFilter === "all" || s.companyId === companyFilter);
  const requestsReview = serviceRequests.filter(r => r.status === 'en revisión').length;

  const getServiceStats = (serviceId: string) => {
    const ss = sales.filter(s => s.serviceId === serviceId);
    return { salesCount: ss.length, gmv: ss.reduce((a, s) => a + s.amountCOP, 0) };
  };

  const getRequestStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'en revisión': { cls: "text-amber-600 bg-amber-50", label: "En revisión" },
      'reunión agendada': { cls: "text-blue-600 bg-blue-50", label: "Reunión" },
      'aprobado': { cls: "text-emerald-600 bg-emerald-50", label: "Aprobado" },
      'rechazado': { cls: "text-red-600 bg-red-50", label: "Rechazado" },
    };
    const c = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Servicios</h1>

        <Tabs defaultValue="active">
          <TabsList className="h-8">
            <TabsTrigger value="active" className="text-xs">Activos ({services.length})</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs">
              Solicitudes
              {requestsReview > 0 && <span className="ml-1 text-[9px] bg-amber-500 text-white px-1 rounded-full">{requestsReview}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-3 space-y-3">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Empresa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
              {filtered.map(service => {
                const company = companies.find(c => c.id === service.companyId);
                const stats = getServiceStats(service.id);
                return (
                  <div key={service.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{service.name}</p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{service.type}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{company?.name} · {service.category} · {stats.salesCount} ventas</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold">{formatCOP(service.priceCOP)}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedService(service)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-3">
            <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
              {serviceRequests.map(req => {
                const company = companies.find(c => c.id === req.companyId);
                return (
                  <div key={req.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.serviceName}</p>
                      <p className="text-[10px] text-muted-foreground">{company?.name} · {req.category} · {formatDate(req.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold">{formatCOP(req.priceCOP)}</span>
                      {getRequestStatusBadge(req.status)}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedRequest(req)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">{selectedService?.name}</DialogTitle></DialogHeader>
            {selectedService && (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground text-xs">{selectedService.description}</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Precio</span><span className="font-medium">{formatCOP(selectedService.priceCOP)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Comisión vendedor</span><span>{selectedService.vendorCommissionPct}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{selectedService.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reembolso</span><span>{selectedService.refundPolicy.autoRefund ? 'Auto' : 'Manual'} ({selectedService.refundPolicy.refundWindowDays}d)</span></div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
      </div>
    </DashboardLayout>
  );
}