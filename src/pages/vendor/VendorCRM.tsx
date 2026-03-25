import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Plus, MessageCircle, Repeat, GripVertical, StickyNote, Zap, Calendar, X, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useDemo } from "@/contexts/DemoContext";
import { services as allServices, companies, CURRENT_VENDOR_ID, vendorCompanyLinks, formatCOP } from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Stage = 'contactado' | 'interesado' | 'negociando' | 'cerrado';

interface Note {
  id: string;
  text: string;
  date: string;
}

interface Prospect {
  id: string;
  name: string;
  phone?: string;
  serviceId: string;
  stage: Stage;
  createdAt: string;
  notes: Note[];
  followUpDate?: string;
}

const STAGES: { key: Stage; label: string; color: string; bg: string; dotColor: string; border: string }[] = [
  { key: 'contactado', label: 'Contactado', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', dotColor: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-500/20' },
  { key: 'interesado', label: 'Interesado', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', dotColor: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-500/20' },
  { key: 'negociando', label: 'Negociando', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', dotColor: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-500/20' },
  { key: 'cerrado',    label: 'Cerrado',    color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dotColor: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-500/20' },
];

const INITIAL_PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Andrea Ruiz', phone: '300 123 4567', serviceId: 'service-025', stage: 'interesado', createdAt: '2026-03-23', notes: [{ id: 'n1', text: 'Quiere plan gym para ella y su esposo', date: '2026-03-23' }], followUpDate: '2026-03-27' },
  { id: 'p2', name: 'Felipe Mora', phone: '311 987 6543', serviceId: 'service-028', stage: 'contactado', createdAt: '2026-03-24', notes: [] },
  { id: 'p3', name: 'Juliana Castro', serviceId: 'service-034', stage: 'negociando', createdAt: '2026-03-20', notes: [{ id: 'n2', text: 'Pidió descuento del 10%', date: '2026-03-20' }, { id: 'n3', text: 'Le mandé propuesta con cupón', date: '2026-03-22' }] },
  { id: 'p4', name: 'Roberto Henao', phone: '315 456 7890', serviceId: 'service-033', stage: 'cerrado', createdAt: '2026-03-18', notes: [{ id: 'n4', text: 'Cerrado — Paquete corte + color', date: '2026-03-18' }] },
];

export default function VendorCRM() {
  const { currentVendorId, addSale } = useDemo();
  const [crmEnabled, setCrmEnabled] = useState(true);
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newService, setNewService] = useState("");
  const [quickSale, setQuickSale] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === (currentVendorId || CURRENT_VENDOR_ID) && l.status === 'active')
    .map(l => l.companyId);
  const availableServices = allServices.filter(s => linkedCompanyIds.includes(s.companyId) && s.status === 'activo');

  const getServiceInfo = (serviceId: string) => {
    const service = allServices.find(s => s.id === serviceId);
    const company = service ? companies.find(c => c.id === service.companyId) : null;
    return { service, company };
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (!dragId) return;
    setProspects(prev => prev.map(p => p.id === dragId ? { ...p, stage } : p));
    setDragId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => { setDragId(null); setDragOverStage(null); };

  const addNote = (prospectId: string) => {
    if (!newNoteText.trim()) return;
    setProspects(prev => prev.map(p => {
      if (p.id !== prospectId) return p;
      return { ...p, notes: [...p.notes, { id: `n-${Date.now()}`, text: newNoteText.trim(), date: new Date().toISOString().split('T')[0] }] };
    }));
    setNewNoteText("");
  };

  const setFollowUp = (prospectId: string, date: Date | undefined) => {
    setProspects(prev => prev.map(p =>
      p.id === prospectId ? { ...p, followUpDate: date ? date.toISOString().split('T')[0] : undefined } : p
    ));
    if (date) toast.success(`Seguimiento: ${format(date, "d 'de' MMMM", { locale: es })}`);
  };

  const handleAdd = () => {
    if (!newName.trim() || !newService) return;

    if (quickSale) {
      const service = allServices.find(s => s.id === newService);
      if (service) {
        const gross = service.priceCOP;
        const comm = Math.round(gross * service.vendorCommissionPct / 100);
        const mFee = Math.round(gross * (service.mensualistaPct || 0) / 100);
        const holdEnd = new Date();
        holdEnd.setDate(holdEnd.getDate() + service.refundPolicy.refundWindowDays);
        addSale({
          serviceId: newService,
          companyId: service.companyId,
          vendorId: currentVendorId || CURRENT_VENDOR_ID,
          clientName: newName.trim(),
          clientEmail: `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@email.com`,
          clientPhone: newPhone.trim() || undefined,
          grossAmount: gross,
          sellerCommissionAmount: comm,
          mensualistaFeeAmount: mFee,
          providerNetAmount: gross - comm - mFee,
          holdStartAt: new Date().toISOString().split('T')[0],
          holdEndAt: holdEnd.toISOString().split('T')[0],
          status: service.refundPolicy.refundWindowDays === 0 ? 'COMPLETED' : 'HELD',
          paymentProvider: 'MercadoPago',
          mpPaymentId: `MP-QS-${Date.now()}`,
          isSubscription: service.type === 'suscripción',
          subscriptionActive: service.type === 'suscripción',
          amountCOP: gross,
        });
        toast.success(`Venta registrada — Comisión: ${formatCOP(comm)}`);
      }
    } else {
      const prospect: Prospect = {
        id: `p-${Date.now()}`,
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
        serviceId: newService,
        stage: 'contactado',
        createdAt: new Date().toISOString().split('T')[0],
        notes: [],
      };
      setProspects(prev => [prospect, ...prev]);
      toast.success("Prospecto agregado");
    }

    setShowAdd(false);
    setNewName("");
    setNewPhone("");
    setNewService("");
    setQuickSale(false);
  };

  const removeProspect = (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    toast.success("Eliminado");
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Clientes</h1>
          <p className="text-xs text-muted-foreground">
            {prospects.length} prospectos · {formatCOP(totalValue)} potencial
          </p>
        </div>

        {/* Toggle + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={crmEnabled} onCheckedChange={setCrmEnabled} />
            <div>
              <p className="text-xs font-medium text-foreground">Panel de clientes</p>
              <p className="text-[10px] text-muted-foreground">Opcional — organiza tus prospectos</p>
            </div>
          </div>
          {crmEnabled && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full h-8 px-4 gap-1.5 text-[11px] font-medium" onClick={() => { setQuickSale(true); setShowAdd(true); }}>
                <Zap className="w-3 h-3" />
                Venta rápida
              </Button>
              <Button size="sm" className="rounded-full h-8 px-4 gap-1.5 text-[11px] font-medium" onClick={() => { setQuickSale(false); setShowAdd(true); }}>
                <Plus className="w-3 h-3" />
                Prospecto
              </Button>
            </div>
          )}
        </div>

        {/* CRM Content */}
        <AnimatePresence mode="wait">
          {crmEnabled ? (
            <motion.div
              key="crm-on"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {prospects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Sin prospectos</p>
                  <p className="text-[11px] text-muted-foreground mb-4">Agrega tu primer cliente potencial</p>
                  <Button size="sm" className="rounded-full h-8 px-5 text-[11px]" onClick={() => setShowAdd(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {prospectsByStage.map(stage => (
                    <div
                      key={stage.key}
                      className={cn(
                        "rounded-2xl border transition-all min-h-[140px]",
                        dragOverStage === stage.key
                          ? `${stage.border} ${stage.bg} scale-[1.01]`
                          : "border-border/40 bg-muted/5"
                      )}
                      onDragOver={(e) => handleDragOver(e, stage.key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage.key)}
                    >
                      {/* Column header */}
                      <div className="p-4 pb-2 text-center">
                        <div className={cn("w-2 h-2 rounded-full mx-auto mb-2", stage.dotColor)} />
                        <p className={cn("text-[10px] font-semibold uppercase tracking-widest", stage.color)}>{stage.label}</p>
                        <p className="text-lg font-bold text-foreground mt-0.5">{stage.prospects.length}</p>
                      </div>

                      {/* Cards */}
                      <div className="px-2 pb-2 space-y-2">
                        {stage.prospects.map(prospect => {
                          const { service, company } = getServiceInfo(prospect.serviceId);
                          const coverImg = service?.category ? categoryCovers[service.category] : null;
                          const isExpanded = expandedId === prospect.id;
                          const isDragging = dragId === prospect.id;

                          return (
                            <div
                              key={prospect.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, prospect.id)}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                "rounded-xl border border-border/60 bg-card cursor-grab active:cursor-grabbing transition-all",
                                isDragging ? "opacity-30 scale-95" : "hover:shadow-sm"
                              )}
                            >
                              <div
                                className="flex items-center gap-2.5 p-3"
                                onClick={() => setExpandedId(isExpanded ? null : prospect.id)}
                              >
                                <GripVertical className="w-3 h-3 text-muted-foreground/20 flex-shrink-0" />

                                <div className="w-7 h-7 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
                                  {coverImg ? (
                                    <img src={coverImg} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-muted/50" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[11px] font-semibold text-foreground truncate">{prospect.name}</p>
                                    {service?.type === 'suscripción' && <Repeat className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
                                  </div>
                                  <p className="text-[9px] text-muted-foreground truncate">{company?.name}</p>
                                </div>

                                <ChevronDown className={cn(
                                  "w-3 h-3 text-muted-foreground/30 flex-shrink-0 transition-transform",
                                  isExpanded && "rotate-180"
                                )} />
                              </div>

                              {/* Expanded */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-3 pb-3 space-y-2.5 border-t border-border/20 pt-2.5" onClick={e => e.stopPropagation()}>
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">{service?.name}</span>
                                        <span className="font-semibold text-primary">
                                          {service ? formatCOP(Math.round(service.priceCOP * service.vendorCommissionPct / 100)) : ''}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <button className={cn(
                                              "flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full border transition-colors",
                                              prospect.followUpDate
                                                ? "border-primary/20 bg-primary/5 text-primary font-medium"
                                                : "border-border/50 text-muted-foreground hover:bg-muted/30"
                                            )}>
                                              <Calendar className="w-2.5 h-2.5" />
                                              {prospect.followUpDate
                                                ? format(new Date(prospect.followUpDate), "d MMM", { locale: es })
                                                : "Seguimiento"
                                              }
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarUI
                                              mode="single"
                                              selected={prospect.followUpDate ? new Date(prospect.followUpDate) : undefined}
                                              onSelect={(d) => setFollowUp(prospect.id, d)}
                                              className="p-3 pointer-events-auto"
                                            />
                                          </PopoverContent>
                                        </Popover>

                                        {prospect.phone && (
                                          <button
                                            onClick={() => window.open(`https://wa.me/57${prospect.phone?.replace(/\s/g, '')}`, '_blank')}
                                            className="flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors"
                                          >
                                            <MessageCircle className="w-2.5 h-2.5" />
                                            WhatsApp
                                          </button>
                                        )}

                                        <button
                                          onClick={() => removeProspect(prospect.id)}
                                          className="ml-auto flex items-center text-[9px] px-2 py-1 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </div>

                                      {prospect.notes.length > 0 && (
                                        <div className="space-y-1">
                                          {prospect.notes.map(note => (
                                            <div key={note.id} className="flex gap-1.5 text-[9px]">
                                              <span className="text-muted-foreground/40 flex-shrink-0">
                                                {format(new Date(note.date), "d/M", { locale: es })}
                                              </span>
                                              <span className="text-muted-foreground">{note.text}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="flex gap-1.5">
                                        <Input
                                          placeholder="Agregar nota..."
                                          value={expandedId === prospect.id ? newNoteText : ""}
                                          onChange={(e) => setNewNoteText(e.target.value)}
                                          onKeyDown={(e) => { if (e.key === 'Enter') addNote(prospect.id); }}
                                          className="h-7 text-[10px] rounded-full border-border/40 bg-muted/20 px-3"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 flex-shrink-0 rounded-full"
                                          onClick={() => addNote(prospect.id)}
                                          disabled={!newNoteText.trim()}
                                        >
                                          <StickyNote className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="crm-off"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Panel desactivado</p>
              <p className="text-[11px] text-muted-foreground max-w-[240px]">
                Activa el panel de clientes para organizar tus prospectos y hacer seguimiento de ventas.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) setQuickSale(false); }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              {quickSale ? (
                <><Zap className="w-4 h-4 text-primary" /> Registrar venta</>
              ) : (
                <><Plus className="w-4 h-4 text-muted-foreground" /> Nuevo prospecto</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre del cliente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-full h-10 px-4"
              autoFocus
            />
            <Input
              placeholder="Teléfono (opcional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="rounded-full h-10 px-4"
            />
            <Select value={newService} onValueChange={setNewService}>
              <SelectTrigger className="rounded-full h-10 px-4">
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
                        <span className="text-muted-foreground text-[10px]">{company?.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {quickSale && newService && (() => {
              const service = allServices.find(s => s.id === newService);
              if (!service) return null;
              const comm = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
              return (
                <div className="rounded-2xl bg-primary/[0.03] border border-primary/10 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="font-medium text-foreground">{formatCOP(service.priceCOP)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%)</span>
                    <span className="font-bold text-primary">{formatCOP(comm)}</span>
                  </div>
                  {service.refundPolicy.refundWindowDays > 0 && (
                    <p className="text-[10px] text-muted-foreground">{service.refundPolicy.refundWindowDays} días de retención</p>
                  )}
                  {service.refundPolicy.refundWindowDays === 0 && (
                    <p className="text-[10px] text-emerald-600">Liberación inmediata</p>
                  )}
                </div>
              );
            })()}

            <Button
              className="w-full rounded-full h-10 gap-2 text-[11px] font-semibold"
              onClick={handleAdd}
              disabled={!newName.trim() || !newService}
            >
              {quickSale ? (
                <><Zap className="w-3.5 h-3.5" /> Registrar venta</>
              ) : (
                "Agregar prospecto"
              )}
            </Button>

            {!quickSale && (
              <button
                onClick={() => setQuickSale(true)}
                className="w-full text-center text-[10px] text-muted-foreground hover:text-primary transition-colors py-1"
              >
                Ya cerraste la venta? — Registrar venta rápida
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}
