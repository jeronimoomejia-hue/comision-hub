import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Plus, Phone, MessageCircle, ChevronRight, Repeat, Zap, GripVertical, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { services as allServices, companies, CURRENT_VENDOR_ID, vendorCompanyLinks, formatCOP } from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import { toast } from "sonner";

type Stage = 'contactado' | 'interesado' | 'negociando' | 'cerrado';

interface Prospect {
  id: string;
  name: string;
  phone?: string;
  serviceId: string;
  stage: Stage;
  createdAt: string;
  note?: string;
}

const STAGES: { key: Stage; label: string; color: string; dotColor: string }[] = [
  { key: 'contactado', label: 'Contactado', color: 'text-blue-600', dotColor: 'bg-blue-500' },
  { key: 'interesado', label: 'Interesado', color: 'text-amber-600', dotColor: 'bg-amber-500' },
  { key: 'negociando', label: 'Negociando', color: 'text-purple-600', dotColor: 'bg-purple-500' },
  { key: 'cerrado',    label: 'Cerrado',    color: 'text-emerald-600', dotColor: 'bg-emerald-500' },
];

// Demo prospects
const INITIAL_PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Andrea Ruiz', phone: '300 123 4567', serviceId: 'service-025', stage: 'interesado', createdAt: '2026-03-23', note: 'Quiere plan gym para ella y su esposo' },
  { id: 'p2', name: 'Felipe Mora', phone: '311 987 6543', serviceId: 'service-028', stage: 'contactado', createdAt: '2026-03-24' },
  { id: 'p3', name: 'Juliana Castro', serviceId: 'service-034', stage: 'negociando', createdAt: '2026-03-20', note: 'Pidió descuento' },
  { id: 'p4', name: 'Roberto Henao', phone: '315 456 7890', serviceId: 'service-033', stage: 'cerrado', createdAt: '2026-03-18' },
];

export default function VendorCRM() {
  const { currentVendorId } = useDemo();
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newService, setNewService] = useState("");
  const [newNote, setNewNote] = useState("");
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');

  // Available services (from linked companies)
  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === (currentVendorId || CURRENT_VENDOR_ID) && l.status === 'active')
    .map(l => l.companyId);
  const availableServices = allServices.filter(s => linkedCompanyIds.includes(s.companyId) && s.status === 'activo');

  const handleAdd = () => {
    if (!newName.trim() || !newService) return;
    const prospect: Prospect = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      serviceId: newService,
      stage: 'contactado',
      createdAt: new Date().toISOString().split('T')[0],
      note: newNote.trim() || undefined,
    };
    setProspects(prev => [prospect, ...prev]);
    setShowAdd(false);
    setNewName("");
    setNewPhone("");
    setNewService("");
    setNewNote("");
    toast.success("Prospecto agregado");
  };

  const moveStage = (id: string, direction: 'next' | 'prev') => {
    setProspects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const idx = STAGES.findIndex(s => s.key === p.stage);
      const newIdx = direction === 'next' ? Math.min(idx + 1, STAGES.length - 1) : Math.max(idx - 1, 0);
      return { ...p, stage: STAGES[newIdx].key };
    }));
  };

  const removeProspect = (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    toast.success("Prospecto eliminado");
  };

  const getServiceInfo = (serviceId: string) => {
    const service = allServices.find(s => s.id === serviceId);
    const company = service ? companies.find(c => c.id === service.companyId) : null;
    return { service, company };
  };

  const prospectsByStage = STAGES.map(stage => ({
    ...stage,
    prospects: prospects.filter(p => p.stage === stage.key),
  }));

  const totalValue = prospects
    .filter(p => p.stage !== 'cerrado')
    .reduce((acc, p) => {
      const s = allServices.find(sv => sv.id === p.serviceId);
      return acc + (s ? Math.round(s.priceCOP * s.vendorCommissionPct / 100) : 0);
    }, 0);

  return (
    <VendorTabLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Clientes</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {prospects.length} prospectos · {formatCOP(totalValue)} potencial
            </p>
          </div>
          <Button size="sm" className="rounded-xl h-9 gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </Button>
        </div>

        {/* Pipeline stages as horizontal progress */}
        <div className="flex gap-1">
          {prospectsByStage.map(stage => (
            <div
              key={stage.key}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                stage.prospects.length > 0 ? stage.dotColor : 'bg-muted'
              }`}
              style={{ opacity: stage.prospects.length > 0 ? 1 : 0.3 }}
            />
          ))}
        </div>

        {/* Stage counts */}
        <div className="grid grid-cols-4 gap-2">
          {prospectsByStage.map(stage => (
            <div key={stage.key} className="text-center">
              <p className={`text-lg font-bold ${stage.prospects.length > 0 ? stage.color : 'text-muted-foreground/30'}`}>
                {stage.prospects.length}
              </p>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{stage.label}</p>
            </div>
          ))}
        </div>

        {/* Prospect cards by stage */}
        <div className="space-y-5">
          {prospectsByStage.map(stage => {
            if (stage.prospects.length === 0) return null;
            return (
              <div key={stage.key}>
                {/* Stage header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                  <p className="text-xs font-semibold text-foreground">{stage.label}</p>
                  <span className="text-[10px] text-muted-foreground">{stage.prospects.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stage.prospects.map(prospect => {
                    const { service, company } = getServiceInfo(prospect.serviceId);
                    const coverImg = service?.category ? categoryCovers[service.category] : null;
                    const stageIdx = STAGES.findIndex(s => s.key === prospect.stage);
                    const canNext = stageIdx < STAGES.length - 1;
                    const canPrev = stageIdx > 0;
                    const commissionEstimate = service ? Math.round(service.priceCOP * service.vendorCommissionPct / 100) : 0;

                    return (
                      <div
                        key={prospect.id}
                        className={`rounded-2xl border bg-card overflow-hidden transition-all ${
                          prospect.stage === 'cerrado' ? 'border-emerald-200 dark:border-emerald-500/20' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3.5">
                          {/* Service image */}
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {coverImg ? (
                              <img src={coverImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-foreground truncate">{prospect.name}</p>
                              {service?.type === 'suscripción' && (
                                <Repeat className="w-3 h-3 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {service?.name} · {company?.name}
                            </p>
                          </div>

                          {/* Commission estimate */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-foreground">{formatCOP(commissionEstimate)}</p>
                            <p className="text-[9px] text-muted-foreground">comisión</p>
                          </div>
                        </div>

                        {/* Note if exists */}
                        {prospect.note && (
                          <div className="px-3.5 pb-2">
                            <p className="text-[10px] text-muted-foreground/70 italic">"{prospect.note}"</p>
                          </div>
                        )}

                        {/* Actions bar */}
                        <div className="flex items-center border-t border-border/40 divide-x divide-border/40">
                          {/* Move prev */}
                          {canPrev && (
                            <button
                              onClick={() => moveStage(prospect.id, 'prev')}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                              <ChevronRight className="w-3 h-3 rotate-180" />
                              {STAGES[stageIdx - 1].label}
                            </button>
                          )}
                          
                          {/* Contact buttons */}
                          {prospect.phone && (
                            <button
                              onClick={() => window.open(`https://wa.me/57${prospect.phone?.replace(/\s/g, '')}`, '_blank')}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </button>
                          )}

                          {/* Move next / Remove */}
                          {canNext ? (
                            <button
                              onClick={() => moveStage(prospect.id, 'next')}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium text-primary hover:bg-primary/5 transition-colors"
                            >
                              {STAGES[stageIdx + 1].label}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => removeProspect(prospect.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                              <Check className="w-3 h-3 text-emerald-500" />
                              Listo
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {prospects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Sin prospectos</p>
            <p className="text-xs text-muted-foreground mb-4">Agrega tu primer prospecto para empezar</p>
            <Button size="sm" className="rounded-xl" onClick={() => setShowAdd(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Agregar prospecto
            </Button>
          </div>
        )}
      </div>

      {/* Add prospect dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Nuevo prospecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre del cliente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-xl h-10"
            />
            <Input
              placeholder="Teléfono (opcional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="rounded-xl h-10"
            />
            <Select value={newService} onValueChange={setNewService}>
              <SelectTrigger className="rounded-xl h-10">
                <SelectValue placeholder="Producto" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map(s => {
                  const company = companies.find(c => c.id === s.companyId);
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        {s.type === 'suscripción' && <Repeat className="w-3 h-3 text-primary" />}
                        <span className="text-muted-foreground text-[10px]">· {company?.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nota rápida (opcional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="rounded-xl h-10"
            />
            <Button className="w-full rounded-xl h-10" onClick={handleAdd} disabled={!newName.trim() || !newService}>
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}
