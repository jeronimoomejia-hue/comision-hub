import { useState } from "react";
import TutorialOverlay from "@/components/TutorialOverlay";
import { vendorCRMTutorial } from "@/data/tutorialData";
import { motion, AnimatePresence } from "framer-motion";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Plus, MessageCircle, GripVertical, StickyNote, Zap, Calendar, X, ChevronDown, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/contexts/DemoContext";
import { services as allServices, companies, CURRENT_VENDOR_ID, vendorCompanyLinks, formatCOP } from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Stage = 'sin_contactar' | 'contactado' | 'interesado' | 'negociando' | 'cerrado';

interface Note {
  id: string;
  text: string;
  date: string;
}

interface Prospect {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  context?: string;
  serviceId: string;
  stage: Stage;
  createdAt: string;
  notes: Note[];
  followUpDate?: string;
}

const STAGES: { key: Stage; label: string; color: string; bg: string; dotColor: string; border: string }[] = [
  { key: 'sin_contactar', label: 'Sin contactar', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-500/10', dotColor: 'bg-gray-400', border: 'border-gray-200 dark:border-gray-500/20' },
  { key: 'contactado', label: 'Contactado', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', dotColor: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-500/20' },
  { key: 'interesado', label: 'Interesado', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', dotColor: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-500/20' },
  { key: 'negociando', label: 'Negociando', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', dotColor: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-500/20' },
  { key: 'cerrado',    label: 'Cerrado',    color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dotColor: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-500/20' },
];

const INITIAL_PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Andrea Ruiz', phone: '300 123 4567', serviceId: 'service-025', stage: 'interesado', createdAt: '2026-03-23', notes: [{ id: 'n1', text: 'Quiere plan gym para ella y su esposo', date: '2026-03-23' }], followUpDate: '2026-03-27' },
  { id: 'p2', name: 'Felipe Mora', phone: '311 987 6543', serviceId: 'service-028', stage: 'contactado', createdAt: '2026-03-24', notes: [] },
  { id: 'p3', name: 'Juliana Castro', serviceId: 'service-034', stage: 'negociando', createdAt: '2026-03-20', notes: [{ id: 'n2', text: 'Pidio descuento del 10%', date: '2026-03-20' }, { id: 'n3', text: 'Le mande propuesta con cupon', date: '2026-03-22' }] },
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

  const linkedCompanyIds = vendorCompanyLinks
    .filter(l => l.vendorId === (currentVendorId || CURRENT_VENDOR_ID) && l.status === 'active')
    .map(l => l.companyId);
  const availableServices = allServices.filter(s => linkedCompanyIds.includes(s.companyId) && s.status === 'activo');

  const getServiceInfo = (serviceId: string) => {
    const service = allServices.find(s => s.id === serviceId);
    const company = service ? companies.find(c => c.id === service.companyId) : null;
    return { service, company };
  };

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

  const changeStage = (prospectId: string, stage: Stage) => {
    setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, stage } : p));
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
          serviceId: newService, companyId: service.companyId, vendorId: currentVendorId || CURRENT_VENDOR_ID,
          clientName: newName.trim(), clientEmail: `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@email.com`,
          clientPhone: newPhone.trim() || undefined, grossAmount: gross, sellerCommissionAmount: comm,
          mensualistaFeeAmount: mFee, providerNetAmount: gross - comm - mFee,
          holdStartAt: new Date().toISOString().split('T')[0], holdEndAt: holdEnd.toISOString().split('T')[0],
          status: service.refundPolicy.refundWindowDays === 0 ? 'COMPLETED' : 'HELD',
          paymentProvider: 'Stripe', mpPaymentId: `STR-QS-${Date.now()}`,
          isSubscription: service.type === 'suscripción', subscriptionActive: service.type === 'suscripción', amountCOP: gross,
        });
        toast.success(`Venta registrada — Comision: ${formatCOP(comm)}`);
      }
    } else {
      const prospect: Prospect = {
        id: `p-${Date.now()}`, name: newName.trim(), phone: newPhone.trim() || undefined,
        serviceId: newService, stage: 'contactado', createdAt: new Date().toISOString().split('T')[0], notes: [],
      };
      setProspects(prev => [prospect, ...prev]);
      toast.success("Prospecto agregado");
    }
    setShowAdd(false); setNewName(""); setNewPhone(""); setNewService(""); setQuickSale(false);
  };

  const removeProspect = (id: string) => { setProspects(prev => prev.filter(p => p.id !== id)); toast.success("Eliminado"); };

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
       <div className="max-w-5xl mx-auto space-y-5">
        <TutorialOverlay pageId="vendor-crm" steps={vendorCRMTutorial} />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Mis Clientes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {prospects.length} prospectos · {formatCOP(totalValue)} potencial
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4 gap-1.5 text-[11px] font-medium" onClick={() => { setQuickSale(true); setShowAdd(true); }}>
              <Zap className="w-3 h-3" /> Venta rapida
            </Button>
            <Button size="sm" className="rounded-full h-8 px-4 gap-1.5 text-[11px] font-medium" onClick={() => setShowAdd(true)}>
              <Plus className="w-3 h-3" /> Agregar
            </Button>
          </div>
        </div>

        {/* CRM toggle */}
        <div className="flex items-center gap-3">
          <Switch checked={crmEnabled} onCheckedChange={setCrmEnabled} />
          <div>
            <p className="text-xs font-medium text-foreground">Panel de clientes</p>
            <p className="text-[10px] text-muted-foreground">Opcional — organiza tus prospectos</p>
          </div>
        </div>

        {crmEnabled && (
          <div className="space-y-4">
            {prospectsByStage.map(stage => {
              if (stage.prospects.length === 0) return null;
              return (
                <div key={stage.key}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.dotColor)} />
                    <span className={cn("text-xs font-semibold", stage.color)}>{stage.label}</span>
                    <span className="text-[10px] text-muted-foreground">({stage.prospects.length})</span>
                  </div>

                  <div className="space-y-2">
                    {stage.prospects.map(prospect => {
                      const { service, company } = getServiceInfo(prospect.serviceId);
                      const coverImg = service?.category ? categoryCovers[service.category] : null;
                      const potentialEarning = service ? Math.round(service.priceCOP * service.vendorCommissionPct / 100) : 0;
                      const isExpanded = expandedId === prospect.id;
                      const daysSinceCreated = Math.floor((Date.now() - new Date(prospect.createdAt).getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <motion.div
                          key={prospect.id}
                          layout
                          className={cn("rounded-xl border bg-card overflow-hidden", stage.border)}
                        >
                          {/* Main row */}
                          <div
                            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : prospect.id)}
                          >
                            {/* Avatar */}
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", stage.bg)}>
                              <span className={cn("text-sm font-bold", stage.color)}>{prospect.name[0]}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">{prospect.name}</p>
                                {prospect.followUpDate && (
                                  <Badge variant="outline" className="text-[8px] gap-0.5 px-1.5">
                                    <Calendar className="w-2 h-2" />
                                    {format(new Date(prospect.followUpDate), "d MMM", { locale: es })}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {service?.name} · {company?.name}
                              </p>
                            </div>

                            {/* Right metrics */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-xs font-bold text-primary">{formatCOP(potentialEarning)}</p>
                                <p className="text-[9px] text-muted-foreground">{daysSinceCreated}d</p>
                              </div>
                              {prospect.phone && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-emerald-600 hover:bg-emerald-50"
                                  onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/57${prospect.phone?.replace(/\s/g, '')}`, '_blank'); }}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground/30 transition-transform", isExpanded && "rotate-180")} />
                            </div>
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
                                <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                                  {/* Contact info */}
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    {prospect.phone && (
                                      <div className="flex items-center gap-1.5">
                                        <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                                        <span className="text-foreground">{prospect.phone}</span>
                                      </div>
                                    )}
                                    {prospect.email && (
                                      <div className="flex items-center gap-1.5">
                                        <Mail className="w-2.5 h-2.5 text-muted-foreground" />
                                        <span className="text-foreground">{prospect.email}</span>
                                      </div>
                                    )}
                                    <div><span className="text-muted-foreground">Creado:</span> <span className="font-medium">{prospect.createdAt}</span></div>
                                    <div><span className="text-muted-foreground">Comision:</span> <span className="font-medium text-primary">{service?.vendorCommissionPct}%</span></div>
                                  </div>

                                  {/* Stage selector */}
                                  <div className="flex gap-1 overflow-x-auto">
                                    {STAGES.map(s => (
                                      <button
                                        key={s.key}
                                        onClick={() => changeStage(prospect.id, s.key)}
                                        className={cn(
                                          "px-2.5 py-1 rounded-full text-[9px] font-medium whitespace-nowrap transition-colors",
                                          prospect.stage === s.key
                                            ? `${s.bg} ${s.color} border ${s.border}`
                                            : "text-muted-foreground hover:bg-muted/30"
                                        )}
                                      >
                                        {s.label}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Notes */}
                                  {prospect.notes.length > 0 && (
                                    <div className="space-y-1">
                                      {prospect.notes.map(note => (
                                        <div key={note.id} className="flex items-start gap-2 text-[10px]">
                                          <StickyNote className="w-2.5 h-2.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                          <div>
                                            <span className="text-foreground">{note.text}</span>
                                            <span className="text-muted-foreground ml-1.5">{note.date}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add note */}
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Agregar nota..."
                                      value={expandedId === prospect.id ? newNoteText : ""}
                                      onChange={e => setNewNoteText(e.target.value)}
                                      className="h-7 text-[10px] rounded-lg flex-1"
                                      onKeyDown={e => { if (e.key === 'Enter') addNote(prospect.id); }}
                                    />
                                    <Button size="sm" variant="outline" className="h-7 text-[9px] px-2 rounded-lg" onClick={() => addNote(prospect.id)}>
                                      Nota
                                    </Button>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-full flex-1 gap-1">
                                          <Calendar className="w-3 h-3" /> Seguimiento
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarUI
                                          mode="single"
                                          selected={prospect.followUpDate ? new Date(prospect.followUpDate) : undefined}
                                          onSelect={(date) => setFollowUp(prospect.id, date)}
                                          locale={es}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    {prospect.phone && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] rounded-full flex-1 gap-1 text-emerald-600 border-emerald-200"
                                        onClick={() => window.open(`https://wa.me/57${prospect.phone?.replace(/\s/g, '')}`, '_blank')}
                                      >
                                        <MessageCircle className="w-3 h-3" /> WhatsApp
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-[10px] px-2 text-destructive hover:text-destructive"
                                      onClick={() => removeProspect(prospect.id)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm">{quickSale ? 'Venta rapida' : 'Nuevo prospecto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nombre del cliente" value={newName} onChange={e => setNewName(e.target.value)} className="h-9 text-sm" />
              <Input placeholder="Telefono (opcional)" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-9 text-sm" />
              <Select value={newService} onValueChange={setNewService}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Producto" /></SelectTrigger>
                <SelectContent>
                  {availableServices.map(s => {
                    const company = companies.find(c => c.id === s.companyId);
                    return <SelectItem key={s.id} value={s.id} className="text-xs">{s.name} · {company?.name}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch checked={quickSale} onCheckedChange={setQuickSale} />
                <span className="text-[11px] text-muted-foreground">Registrar como venta directa</span>
              </div>
              <Button className="w-full h-9 text-xs rounded-full" onClick={handleAdd} disabled={!newName.trim() || !newService}>
                {quickSale ? 'Registrar venta' : 'Agregar prospecto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </VendorTabLayout>
  );
}
