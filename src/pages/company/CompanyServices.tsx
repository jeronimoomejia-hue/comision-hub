import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Search, Key, Zap, Package, AlertTriangle, Upload, RefreshCw, Star, Lock, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatCOP, CURRENT_COMPANY_ID, companies, type Service } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { categoryCovers } from "@/data/coverImages";
import ServiceEditModal from "@/components/company/ServiceEditModal";

export default function CompanyServices() {
  const { sales: demoSales, services, currentCompanyPlan, addService, updateService, addActivationCodes } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showNewService, setShowNewService] = useState(false);
  const [showAddCodes, setShowAddCodes] = useState<Service | null>(null);
  const [newCodes, setNewCodes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newForm, setNewForm] = useState({
    name: '', description: '', category: 'seguros', type: 'suscripción' as 'suscripción' | 'puntual',
    priceCOP: 150000, vendorCommissionPct: 20, requiresTraining: true, trainingType: 'pdf' as 'pdf' | 'video',
    refundWindowDays: 14 as 7 | 14 | 30, autoRefund: false, initialCodes: '',
  });

  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companySales = demoSales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const maxServices = currentCompanyPlan === 'freemium' ? 5 : Infinity;
  const canAddMore = companyServices.length < maxServices;

  const filteredServices = companyServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getServiceStats = (serviceId: string) => {
    const ss = companySales.filter(s => s.serviceId === serviceId);
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    return { salesMonth: ss.filter(s => new Date(s.createdAt) >= monthAgo).length, totalSales: ss.length };
  };

  const getCodeStats = (service: Service) => {
    const total = service.activationCodes.length;
    const available = service.activationCodes.filter(c => c.status === 'available').length;
    return { total, available, isEmpty: available === 0, isLow: available < 5 };
  };

  const handleSaveService = (updatedService: Partial<Service>) => {
    if (selectedService) updateService(selectedService.id, updatedService);
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
      name: newForm.name, description: newForm.description, category: newForm.category,
      priceCOP: newForm.priceCOP, type: newForm.type, vendorCommissionPct: newForm.vendorCommissionPct,
      mensualistaPct: currentCompanyPlan === 'freemium' ? 15 : 8, status: 'activo',
      refundPolicy: { autoRefund: newForm.autoRefund, refundWindowDays: newForm.refundWindowDays },
      requiresTraining: newForm.requiresTraining, trainingType: newForm.trainingType,
      materials: [],
      activationCodes: codeLines.map((code, i) => ({ id: `ac-new-${Date.now()}-${i}`, code, status: 'available' as const })),
    });
    setShowNewService(false);
    setNewForm({ name: '', description: '', category: 'seguros', type: 'suscripción', priceCOP: 150000, vendorCommissionPct: 20, requiresTraining: true, trainingType: 'pdf', refundWindowDays: 14, autoRefund: false, initialCodes: '' });
    toast.success("Servicio creado con " + codeLines.length + " códigos");
  };

  const handleAddCodes = () => {
    if (!showAddCodes) return;
    const codeLines = newCodes.split('\n').map(c => c.trim()).filter(Boolean);
    if (codeLines.length === 0) { toast.error("Ingresa al menos un código"); return; }
    addActivationCodes(showAddCodes.id, codeLines);
    toast.success(`${codeLines.length} códigos agregados`);
    setShowAddCodes(null); setNewCodes("");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Mis Servicios</h1>
            <p className="text-[11px] sm:text-sm text-muted-foreground">
              {companyServices.length} servicio{companyServices.length !== 1 ? 's' : ''} creados
              {currentCompanyPlan === 'freemium' && ` · ${companyServices.length}/5 (Freemium)`}
            </p>
          </div>
          <Button
            size="sm" className="h-9 text-xs"
            onClick={() => canAddMore ? setShowNewService(true) : toast.error("Límite alcanzado. Mejora tu plan.")}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nuevo servicio
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 sm:h-11 bg-card border-border rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Info bar */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          {currentCompanyPlan === 'enterprise' ? (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Enterprise:</span> Los códigos se sincronizan automáticamente vía API.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Códigos:</span> Carga mínimo 20 por servicio. Se entregan automáticamente al comprador.
              </p>
            </div>
          )}
        </div>

        {/* Services Grid (Fiverr style) */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredServices.map(service => {
              const stats = getServiceStats(service.id);
              const codes = getCodeStats(service);
              const coverImg = categoryCovers[service.category];

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                    service.status === 'pausado' ? 'grayscale opacity-75' : ''
                  }`}
                >
                  {/* Cover Image */}
                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {service.status === 'pausado' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/70 text-white border border-white/20">
                          <Lock className="w-3.5 h-3.5" /> Pausado
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm ${
                        service.type === 'suscripción' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
                      }`}>
                        {service.type === 'suscripción' ? <><RefreshCw className="w-2.5 h-2.5" /> Recurrente</> : <><Zap className="w-2.5 h-2.5" /> Puntual</>}
                      </span>
                      {codes.isEmpty && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground shadow-sm">
                          <AlertTriangle className="w-2.5 h-2.5" /> Sin códigos
                        </span>
                      )}
                      {codes.isLow && !codes.isEmpty && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                          <AlertTriangle className="w-2.5 h-2.5" /> Pocos códigos
                        </span>
                      )}
                    </div>

                    {/* Stats on bottom-right */}
                    <div className="absolute bottom-3 right-3 text-right">
                      <p className="text-[9px] text-white/70 uppercase tracking-wider">Ventas/mes</p>
                      <p className="text-sm sm:text-base font-bold text-white drop-shadow-md">{stats.salesMonth}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 sm:p-4 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {service.description}
                    </p>

                    {/* Footer */}
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Package className="w-2.5 h-2.5" />
                          {codes.available}/{codes.total}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />
                          {service.refundPolicy.refundWindowDays}d
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Shield className="w-2.5 h-2.5" />
                          {service.vendorCommissionPct}%
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary">
                        {formatCOP(service.priceCOP)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Sin servicios</p>
            <p className="text-xs text-muted-foreground">Crea tu primer servicio para empezar a vender</p>
          </div>
        )}
      </div>

      {/* Service Detail/Edit Modal */}
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
              {showAddCodes?.name} — {showAddCodes && getCodeStats(showAddCodes).available} códigos disponibles
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Códigos (uno por línea)</Label>
              <Textarea className="text-sm mt-1 font-mono" rows={8} placeholder={"CODIGO-001\nCODIGO-002\n..."} value={newCodes} onChange={e => setNewCodes(e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">{newCodes.split('\n').filter(c => c.trim()).length} códigos</p>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs" onClick={handleAddCodes}>
              <Upload className="w-3.5 h-3.5 mr-1" /> Agregar códigos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={showNewService} onOpenChange={setShowNewService}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">Crear nuevo servicio</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nombre</Label>
              <Input className="h-8 text-sm mt-1" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} /></div>
            <div><Label className="text-xs">Descripción</Label>
              <Textarea className="text-sm mt-1" rows={2} value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Categoría</Label>
                <Select value={newForm.category} onValueChange={v => setNewForm({ ...newForm, category: v })}>
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
                <Select value={newForm.type} onValueChange={v => setNewForm({ ...newForm, type: v as any })}>
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
                <Input type="number" className="h-8 text-sm mt-1" value={newForm.priceCOP} onChange={e => setNewForm({ ...newForm, priceCOP: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Comisión vendedor %</Label>
                <Input type="number" className="h-8 text-sm mt-1" value={newForm.vendorCommissionPct} onChange={e => setNewForm({ ...newForm, vendorCommissionPct: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Días de devolución</Label>
                <Select value={String(newForm.refundWindowDays)} onValueChange={v => setNewForm({ ...newForm, refundWindowDays: Number(v) as 7 | 14 | 30 })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 días</SelectItem>
                    <SelectItem value="14">14 días</SelectItem>
                    <SelectItem value="30">30 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={newForm.autoRefund} onCheckedChange={v => setNewForm({ ...newForm, autoRefund: v })} />
                <Label className="text-xs">Devolución automática</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newForm.requiresTraining} onCheckedChange={v => setNewForm({ ...newForm, requiresTraining: v })} />
              <Label className="text-xs">Requiere capacitación</Label>
            </div>
            {newForm.requiresTraining && (
              <div><Label className="text-xs">Tipo de capacitación</Label>
                <Select value={newForm.trainingType} onValueChange={v => setNewForm({ ...newForm, trainingType: v as any })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF / Documento</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {currentCompanyPlan !== 'enterprise' && (
              <div className="border-t border-border pt-3">
                <Label className="text-xs flex items-center gap-1.5"><Key className="w-3 h-3" /> Códigos de activación (mínimo 20)</Label>
                <Textarea className="text-sm mt-1 font-mono" rows={5} placeholder={"CODIGO-001\nCODIGO-002\n... (mínimo 20)"} value={newForm.initialCodes} onChange={e => setNewForm({ ...newForm, initialCodes: e.target.value })} />
                <p className="text-[10px] text-muted-foreground mt-1">{newForm.initialCodes.split('\n').filter(c => c.trim()).length}/20 códigos</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs" onClick={handleCreateService}>Crear servicio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
