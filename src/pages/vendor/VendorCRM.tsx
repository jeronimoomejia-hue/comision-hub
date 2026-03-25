import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Plus, MessageCircle, Repeat, GripVertical, Check, StickyNote, Zap, Calendar, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const STAGES: { key: Stage; label: string; emoji: string; color: string; bg: string; dotColor: string; border: string }[] = [
  { key: 'contactado', label: 'Contactado', emoji: '👋', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', dotColor: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-500/20' },
  { key: 'interesado', label: 'Interesado', emoji: '🔥', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', dotColor: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-500/20' },
  { key: 'negociando', label: 'Negociando', emoji: '🤝', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', dotColor: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-500/20' },
  { key: 'cerrado',    label: 'Cerrado',    emoji: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dotColor: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-500/20' },
];

const INITIAL_PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Andrea Ruiz', phone: '300 123 4567', serviceId: 'service-025', stage: 'interesado', createdAt: '2026-03-23', notes: [{ id: 'n1', text: 'Quiere plan gym para ella y su esposo', date: '2026-03-23' }], followUpDate: '2026-03-27' },
  { id: 'p2', name: 'Felipe Mora', phone: '311 987 6543', serviceId: 'service-028', stage: 'contactado', createdAt: '2026-03-24', notes: [] },
  { id: 'p3', name: 'Juliana Castro', serviceId: 'service-034', stage: 'negociando', createdAt: '2026-03-20', notes: [{ id: 'n2', text: 'Pidió descuento del 10%', date: '2026-03-20' }, { id: 'n3', text: 'Le mandé propuesta con cupón', date: '2026-03-22' }] },
  { id: 'p4', name: 'Roberto Henao', phone: '315 456 7890', serviceId: 'service-033', stage: 'cerrado', createdAt: '2026-03-18', notes: [{ id: 'n4', text: 'Cerrado! Paquete corte + color', date: '2026-03-18' }] },
];

export default function VendorCRM() {
  const { currentVendorId, addSale } = useDemo();
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  
  // New prospect form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newService, setNewService] = useState("");
  const [quickSale, setQuickSale] = useState(false);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  // Available services
  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === (currentVendorId || CURRENT_VENDOR_ID) && l.status === 'active')
    .map(l => l.companyId);
  const availableServices = allServices.filter(s => linkedCompanyIds.includes(s.companyId) && s.status === 'activo');

  const getServiceInfo = (serviceId: string) => {
    const service = allServices.find(s => s.id === serviceId);
    const company = service ? companies.find(c => c.id === service.companyId) : null;
    return { service, company };
  };

  // ─── Drag & Drop ───
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Make drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (!dragId) return;
    setProspects(prev => prev.map(p => p.id === dragId ? { ...p, stage } : p));
    setDragId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverStage(null);
  };

  // ─── Notes ───
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

  // ─── Add / Quick Sale ───
  const handleAdd = () => {
    if (!newName.trim() || !newService) return;

    if (quickSale) {
      // Register sale immediately
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
        toast.success(`¡Venta registrada! Comisión: ${formatCOP(comm)}`);
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
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Clientes</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {prospects.length} prospectos · {formatCOP(totalValue)} potencial
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 gap-1.5 text-xs" onClick={() => { setQuickSale(true); setShowAdd(true); }}>
              <Zap className="w-3.5 h-3.5" />
              Venta rápida
            </Button>
            <Button size="sm" className="rounded-xl h-9 gap-1.5 text-xs" onClick={() => { setQuickSale(false); setShowAdd(true); }}>
              <Plus className="w-3.5 h-3.5" />
              Prospecto
            </Button>
          </div>
        </div>

        {/* Pipeline columns (horizontal kanban) */}
        <div className="grid grid-cols-4 gap-2">
          {prospectsByStage.map(stage => (
            <div
              key={stage.key}
              className={`rounded-2xl border transition-all min-h-[120px] ${
                dragOverStage === stage.key
                  ? `${stage.border} ${stage.bg} scale-[1.02]`
                  : 'border-border/50 bg-muted/10'
              }`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column header */}
              <div className="p-3 pb-2 text-center">
                <p className="text-sm">{stage.emoji}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${stage.color}`}>{stage.label}</p>
                <p className="text-lg font-bold text-foreground">{stage.prospects.length}</p>
              </div>

              {/* Cards in column */}
              <div className="px-1.5 pb-2 space-y-1.5">
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
                      className={`rounded-xl border border-border bg-card cursor-grab active:cursor-grabbing transition-all ${
                        isDragging ? 'opacity-40 scale-95' : 'hover:shadow-sm'
                      }`}
                    >
                      {/* Card main */}
                      <div
                        className="flex items-center gap-2 p-2.5"
                        onClick={() => setExpandedId(isExpanded ? null : prospect.id)}
                      >
                        <GripVertical className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
                        
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {coverImg ? (
                            <img src={coverImg} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-[11px] font-semibold text-foreground truncate">{prospect.name}</p>
                            {service?.type === 'suscripción' && <Repeat className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
                          </div>
                          <p className="text-[9px] text-muted-foreground truncate">{company?.name}</p>
                        </div>

                        <ChevronDown className={`w-3 h-3 text-muted-foreground/30 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2.5 pb-2.5 space-y-2 border-t border-border/30 pt-2" onClick={e => e.stopPropagation()}>
                              {/* Service & commission */}
                              <div className="flex justify-between text-[10px]">
                                <span className="text-muted-foreground">{service?.name}</span>
                                <span className="font-semibold text-primary">
                                  {service ? formatCOP(Math.round(service.priceCOP * service.vendorCommissionPct / 100)) : ''}
                                </span>
                              </div>

                              {/* Follow-up date */}
                              <div className="flex items-center gap-1.5">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className={cn(
                                      "flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg border transition-colors",
                                      prospect.followUpDate
                                        ? "border-primary/20 bg-primary/5 text-primary font-medium"
                                        : "border-border text-muted-foreground hover:bg-muted/50"
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
                                      className={cn("p-3 pointer-events-auto")}
                                    />
                                  </PopoverContent>
                                </Popover>

                                {prospect.phone && (
                                  <button
                                    onClick={() => window.open(`https://wa.me/57${prospect.phone?.replace(/\s/g, '')}`, '_blank')}
                                    className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors"
                                  >
                                    <MessageCircle className="w-2.5 h-2.5" />
                                    WhatsApp
                                  </button>
                                )}

                                <button
                                  onClick={() => removeProspect(prospect.id)}
                                  className="ml-auto flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Notes */}
                              {prospect.notes.length > 0 && (
                                <div className="space-y-1">
                                  {prospect.notes.map(note => (
                                    <div key={note.id} className="flex gap-1.5 text-[9px]">
                                      <span className="text-muted-foreground/50 flex-shrink-0">
                                        {format(new Date(note.date), "d/M", { locale: es })}
                                      </span>
                                      <span className="text-muted-foreground">{note.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add note inline */}
                              <div className="flex gap-1.5">
                                <Input
                                  placeholder="Agregar nota..."
                                  value={expandedId === prospect.id ? newNoteText : ""}
                                  onChange={(e) => setNewNoteText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') addNote(prospect.id); }}
                                  className="h-7 text-[10px] rounded-lg border-border/50 bg-muted/30"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 flex-shrink-0"
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

        {/* Empty state */}
        {prospects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Sin prospectos</p>
            <p className="text-xs text-muted-foreground mb-4">Agrega tu primer cliente potencial</p>
            <Button size="sm" className="rounded-xl" onClick={() => setShowAdd(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Agregar
            </Button>
          </div>
        )}
      </div>

      {/* Add prospect / Quick sale dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) setQuickSale(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              {quickSale ? (
                <><Zap className="w-4 h-4 text-primary" /> Registrar venta</>
              ) : (
                <><Plus className="w-4 h-4" /> Nuevo prospecto</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre del cliente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-xl h-10"
              autoFocus
            />
            {!quickSale && (
              <Input
                placeholder="Teléfono (opcional)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="rounded-xl h-10"
              />
            )}
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

            {quickSale && newService && (() => {
              const service = allServices.find(s => s.id === newService);
              if (!service) return null;
              const comm = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
              return (
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="font-medium">{formatCOP(service.priceCOP)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tu comisión ({service.vendorCommissionPct}%)</span>
                    <span className="font-bold text-primary">{formatCOP(comm)}</span>
                  </div>
                  {service.refundPolicy.refundWindowDays > 0 && (
                    <p className="text-[9px] text-muted-foreground">⏳ {service.refundPolicy.refundWindowDays} días de retención</p>
                  )}
                  {service.refundPolicy.refundWindowDays === 0 && (
                    <p className="text-[9px] text-emerald-600">⚡ Liberación inmediata</p>
                  )}
                </div>
              );
            })()}

            <Button
              className="w-full rounded-xl h-10 gap-2"
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
                ¿Ya cerraste la venta? → Registrar venta rápida
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </VendorTabLayout>
  );
}
