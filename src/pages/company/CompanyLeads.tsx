import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Users, Phone, Mail, ChevronDown, Trash2, Package, DollarSign, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { companies, CURRENT_COMPANY_ID, formatCOP } from "@/data/mockData";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  context: string;
}

interface LeadPackage {
  id: string;
  name: string;
  description: string;
  priceCOP: number;
  leads: Lead[];
  status: 'active' | 'sold';
  soldTo?: string;
  soldAt?: string;
  createdAt: string;
}

const INITIAL_PACKAGES: LeadPackage[] = [
  {
    id: 'lp1',
    name: 'Pack Fitness - Marzo',
    description: 'Leads interesados en planes de gimnasio y bienestar en Bogotá',
    priceCOP: 150000,
    status: 'active',
    createdAt: '2026-03-20',
    leads: [
      { id: 'l1', name: 'Carolina Méndez', phone: '300 111 2233', email: 'carolina@email.com', context: 'Preguntó por planes mensuales de gimnasio. Zona norte de Bogotá.' },
      { id: 'l2', name: 'Andrés Patiño', phone: '311 444 5566', context: 'Interesado en plan familiar. Tiene 2 hijos.' },
      { id: 'l3', name: 'Valentina Ríos', phone: '315 777 8899', email: 'val.rios@email.com', context: 'Busca gimnasio con piscina. Presupuesto $200.000/mes.' },
      { id: 'l4', name: 'Diego Morales', phone: '320 222 3344', context: 'Quiere empezar a entrenar. Nunca ha ido a un gimnasio.' },
      { id: 'l5', name: 'Sofía Herrera', phone: '318 666 7788', email: 'sofia.h@email.com', context: 'Interesada en clases de yoga y pilates.' },
    ],
  },
  {
    id: 'lp2',
    name: 'Pack Belleza Premium',
    description: 'Clientes potenciales para servicios de peluquería y estética',
    priceCOP: 200000,
    status: 'sold',
    soldTo: 'Juan Torres',
    soldAt: '2026-03-22',
    createdAt: '2026-03-18',
    leads: [
      { id: 'l6', name: 'Mariana López', phone: '312 333 4455', context: 'Busca colorista profesional para rubio platino.' },
      { id: 'l7', name: 'Camila Ortiz', phone: '316 555 6677', context: 'Quiere tratamiento capilar. Cabello maltratado.' },
    ],
  },
];

export default function CompanyLeads() {
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [packages, setPackages] = useState<LeadPackage[]>(INITIAL_PACKAGES);
  const [showCreate, setShowCreate] = useState(false);
  const [viewPackage, setViewPackage] = useState<LeadPackage | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New package form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newLeads, setNewLeads] = useState<Lead[]>([]);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadContext, setLeadContext] = useState("");

  const addLead = () => {
    if (!leadName.trim() || !leadPhone.trim()) return;
    setNewLeads(prev => [...prev, {
      id: `nl-${Date.now()}`,
      name: leadName.trim(),
      phone: leadPhone.trim(),
      email: leadEmail.trim() || undefined,
      context: leadContext.trim(),
    }]);
    setLeadName(""); setLeadPhone(""); setLeadEmail(""); setLeadContext("");
  };

  const removeLead = (id: string) => setNewLeads(prev => prev.filter(l => l.id !== id));

  const handleCreate = () => {
    if (!newName.trim() || !newPrice || newLeads.length === 0) return;
    const pkg: LeadPackage = {
      id: `lp-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      priceCOP: parseInt(newPrice),
      leads: newLeads,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPackages(prev => [pkg, ...prev]);
    setShowCreate(false);
    setNewName(""); setNewDesc(""); setNewPrice(""); setNewLeads([]);
    toast.success("Paquete de leads creado");
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    toast.success("Paquete eliminado");
  };

  const activePackages = packages.filter(p => p.status === 'active');
  const soldPackages = packages.filter(p => p.status === 'sold');
  const totalRevenue = soldPackages.reduce((acc, p) => acc + p.priceCOP, 0);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Venta de Leads</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Crea paquetes de leads y véndelos a tus vendedores</p>
          </div>
          <Button size="sm" className="rounded-full h-9 px-5 gap-1.5 text-xs font-semibold" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            Nuevo paquete
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Paquetes activos", value: activePackages.length, icon: Package },
            { label: "Paquetes vendidos", value: soldPackages.length, icon: Users },
            { label: "Ingresos por leads", value: formatCOP(totalRevenue), icon: DollarSign },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active packages */}
        {activePackages.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Disponibles</p>
            <div className="grid gap-3">
              {activePackages.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  expanded={expandedId === pkg.id}
                  onToggle={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
                  onView={() => setViewPackage(pkg)}
                  onDelete={() => deletePackage(pkg.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sold packages */}
        {soldPackages.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendidos</p>
            <div className="grid gap-3">
              {soldPackages.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  expanded={expandedId === pkg.id}
                  onToggle={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
                  onView={() => setViewPackage(pkg)}
                  onDelete={() => deletePackage(pkg.id)}
                />
              ))}
            </div>
          </div>
        )}

        {packages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Sin paquetes</p>
            <p className="text-[11px] text-muted-foreground mb-4">Crea tu primer paquete de leads para vendérselo a tus vendedores</p>
            <Button size="sm" className="rounded-full" onClick={() => setShowCreate(true)}>
              <Plus className="w-3 h-3 mr-1.5" /> Crear paquete
            </Button>
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Nuevo paquete de leads
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nombre del paquete</label>
              <Input placeholder="Ej: Pack Fitness - Abril" value={newName} onChange={e => setNewName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Textarea placeholder="Describe el tipo de leads que incluye este paquete..." value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Precio del paquete (COP)</label>
              <Input type="number" placeholder="150000" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="h-9 text-sm" />
            </div>

            {/* Add lead form */}
            <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Agregar lead</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Nombre" value={leadName} onChange={e => setLeadName(e.target.value)} className="h-8 text-xs" />
                <Input placeholder="Teléfono" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} className="h-8 text-xs" />
              </div>
              <Input placeholder="Email (opcional)" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} className="h-8 text-xs" />
              <Textarea placeholder="Contexto del lead (qué busca, presupuesto, notas...)" value={leadContext} onChange={e => setLeadContext(e.target.value)} rows={2} className="text-xs" />
              <Button size="sm" variant="outline" className="rounded-full h-7 px-4 text-[10px] gap-1" onClick={addLead} disabled={!leadName.trim() || !leadPhone.trim()}>
                <Plus className="w-3 h-3" /> Agregar lead
              </Button>
            </div>

            {/* Lead list */}
            {newLeads.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{newLeads.length} leads agregados</p>
                {newLeads.map(lead => (
                  <div key={lead.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{lead.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{lead.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{lead.phone} {lead.email && `· ${lead.email}`}</p>
                    </div>
                    <button onClick={() => removeLead(lead.id)} className="p-1 hover:bg-destructive/10 rounded-full transition-colors">
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full rounded-full h-10 text-xs font-semibold" onClick={handleCreate} disabled={!newName.trim() || !newPrice || newLeads.length === 0}>
              Crear paquete · {newLeads.length} leads
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View package detail */}
      <Dialog open={!!viewPackage} onOpenChange={() => setViewPackage(null)}>
        <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          {viewPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">{viewPackage.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">{viewPackage.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={viewPackage.status === 'active' ? 'default' : 'secondary'}>
                    {viewPackage.status === 'active' ? 'Disponible' : `Vendido a ${viewPackage.soldTo}`}
                  </Badge>
                  <span className="text-sm font-bold text-foreground">{formatCOP(viewPackage.priceCOP)}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{viewPackage.leads.length} leads</p>
                  {viewPackage.leads.map(lead => (
                    <div key={lead.id} className="rounded-xl border border-border/50 bg-muted/5 p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">{lead.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{lead.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Phone className="w-2.5 h-2.5" /> {lead.phone}
                            {lead.email && <><Mail className="w-2.5 h-2.5 ml-1" /> {lead.email}</>}
                          </div>
                        </div>
                      </div>
                      {lead.context && (
                        <p className="text-[10px] text-muted-foreground bg-muted/20 rounded-lg px-2.5 py-1.5">{lead.context}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function PackageCard({ pkg, expanded, onToggle, onView, onDelete }: {
  pkg: LeadPackage;
  expanded: boolean;
  onToggle: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={onToggle}>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{pkg.name}</p>
            <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">
              {pkg.status === 'active' ? 'Disponible' : 'Vendido'}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{pkg.leads.length} leads · {formatCOP(pkg.priceCOP)}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
              <p className="text-[11px] text-muted-foreground">{pkg.description}</p>

              {pkg.status === 'sold' && (
                <div className="rounded-lg bg-muted/20 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Vendido a <span className="font-semibold text-foreground">{pkg.soldTo}</span> el {pkg.soldAt}</p>
                </div>
              )}

              <div className="space-y-1.5">
                {pkg.leads.slice(0, 3).map(lead => (
                  <div key={lead.id} className="flex items-center gap-2 text-[11px]">
                    <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-muted-foreground">{lead.name[0]}</span>
                    </div>
                    <span className="text-foreground font-medium">{lead.name}</span>
                    <span className="text-muted-foreground">· {lead.phone}</span>
                  </div>
                ))}
                {pkg.leads.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">+{pkg.leads.length - 3} más</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-[10px] gap-1" onClick={onView}>
                  <Eye className="w-3 h-3" /> Ver todos
                </Button>
                {pkg.status === 'active' && (
                  <Button variant="ghost" size="sm" className="rounded-full h-7 px-3 text-[10px] gap-1 text-destructive hover:text-destructive" onClick={onDelete}>
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
