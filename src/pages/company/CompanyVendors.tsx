import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Copy, Users, Search,
  Star, BookOpen, CheckCircle2, Clock,
  Crown, Shield,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  sales, services, vendors, commissions, commissionTiers,
  vendorCommissionAssignments, formatCOP, CURRENT_COMPANY_ID, companies
} from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face",
];

function getAvatar(index: number) {
  return AVATAR_PHOTOS[index % AVATAR_PHOTOS.length];
}

const tierIcon = (order: number) => {
  if (order === 3) return <Crown className="w-2.5 h-2.5 text-purple-500" />;
  if (order === 2) return <Star className="w-2.5 h-2.5 text-amber-500" />;
  return <Shield className="w-2.5 h-2.5 text-muted-foreground" />;
};

const tierColor = (order: number) => {
  if (order === 3) return 'border-purple-300/40 bg-purple-500/5 text-purple-700';
  if (order === 2) return 'border-amber-300/40 bg-amber-500/5 text-amber-700';
  return 'border-border bg-muted/30 text-muted-foreground';
};

export default function CompanyVendors() {
  const { trainingProgress } = useDemo();
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'todos' | 'activos' | 'capacitandose' | 'inactivos'>('todos');
  
  // Invite flow state
  const [inviteService, setInviteService] = useState('');
  const [inviteTier, setInviteTier] = useState('');

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const vendorIds = new Set(companySales.map(s => s.vendorId));
  const serviceIds = new Set(companyServices.map(s => s.id));
  trainingProgress.filter(tp => serviceIds.has(tp.serviceId)).forEach(tp => vendorIds.add(tp.vendorId));
  const companyVendors = vendors.filter(v => vendorIds.has(v.id));
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Tiers for invite
  const selectedServiceTiers = inviteService 
    ? commissionTiers.filter(t => t.serviceId === inviteService).sort((a, b) => a.tierOrder - b.tierOrder)
    : [];

  const getInviteLink = () => {
    let link = `https://app.mensualista.com/join/${company?.id || 'demo'}`;
    if (inviteService) link += `?service=${inviteService}`;
    if (inviteTier) link += `&tier=${inviteTier}`;
    return link;
  };

  const getVendorData = (vendorId: string) => {
    const vs = companySales.filter(s => s.vendorId === vendorId);
    const monthSales = vs.filter(s => new Date(s.createdAt) >= monthAgo);
    const gmv = monthSales.reduce((sum, s) => sum + (s.amountCOP || s.grossAmount), 0);
    const vendorTrainings = trainingProgress.filter(tp => tp.vendorId === vendorId && serviceIds.has(tp.serviceId));
    const totalTrainings = vendorTrainings.length;
    const assignments = vendorCommissionAssignments.filter(a => a.vendorId === vendorId && serviceIds.has(a.serviceId));
    let bestTierOrder = 1;
    let bestTierName = 'Basico';
    assignments.forEach(a => {
      const tier = commissionTiers.find(t => t.id === a.tierId);
      if (tier && tier.tierOrder > bestTierOrder) { bestTierOrder = tier.tierOrder; bestTierName = tier.name; }
    });

    let status: 'top' | 'activo' | 'capacitandose' | 'inactivo' = 'inactivo';
    if (monthSales.length >= 3) status = 'top';
    else if (monthSales.length > 0) status = 'activo';
    else if (totalTrainings > 0) status = 'capacitandose';

    return { salesMonth: monthSales.length, gmv, status, bestTierOrder, bestTierName };
  };

  const vendorsWithData = companyVendors.map((v, i) => ({
    ...v, avatarUrl: getAvatar(i), data: getVendorData(v.id)
  })).sort((a, b) => b.data.salesMonth - a.data.salesMonth);

  const filteredVendors = vendorsWithData.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'todos') return true;
    if (filter === 'activos') return v.data.status === 'top' || v.data.status === 'activo';
    if (filter === 'capacitandose') return v.data.status === 'capacitandose';
    if (filter === 'inactivos') return v.data.status === 'inactivo';
    return true;
  });

  const activeVendors = vendorsWithData.filter(v => v.data.salesMonth > 0).length;

  const statusConfig: Record<string, { label: string; cls: string }> = {
    top: { label: 'Top', cls: 'bg-amber-500/10 text-amber-600' },
    activo: { label: 'Activo', cls: 'bg-emerald-500/10 text-emerald-600' },
    capacitandose: { label: 'Entrenando', cls: 'bg-blue-500/10 text-blue-600' },
    inactivo: { label: 'Inactivo', cls: 'bg-muted text-muted-foreground' },
  };

  const filters = [
    { id: 'todos', label: 'Todos', count: vendorsWithData.length },
    { id: 'activos', label: 'Activos', count: vendorsWithData.filter(v => v.data.status === 'top' || v.data.status === 'activo').length },
    { id: 'capacitandose', label: 'Entrenando', count: vendorsWithData.filter(v => v.data.status === 'capacitandose').length },
    { id: 'inactivos', label: 'Inactivos', count: vendorsWithData.filter(v => v.data.status === 'inactivo').length },
  ];

  const copyInviteLink = () => { navigator.clipboard.writeText(getInviteLink()); toast.success("Enlace copiado"); };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">Mi Red</h1>
            <p className="text-[9px] text-muted-foreground">{companyVendors.length} vendedores · {activeVendors} activos este mes</p>
          </div>
          <Button size="sm" className="h-7 text-[9px] rounded-full px-3" onClick={() => { setShowInvite(true); setInviteService(''); setInviteTier(''); }}>
            <Plus className="w-2.5 h-2.5 mr-1" /> Invitar
          </Button>
        </div>

        <div className="space-y-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input placeholder="Buscar vendedor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-7 bg-card border-border rounded-lg text-[10px]" />
          </div>
          <div className="flex gap-1">
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredVendors.map((vendor) => {
              const d = vendor.data;
              const sc = statusConfig[d.status];
              return (
                <div
                  key={vendor.id}
                  onClick={() => navigate(`/company/vendors/${vendor.id}`)}
                  className={`rounded-2xl border bg-card p-3 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group ${d.bestTierOrder === 3 ? 'border-purple-200/50' : d.bestTierOrder === 2 ? 'border-amber-200/50' : 'border-border'}`}
                >
                  <div className="flex flex-col items-center text-center mb-2.5">
                    <div className="relative mb-2">
                      <img src={vendor.avatarUrl} alt={vendor.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card ${d.bestTierOrder === 3 ? 'bg-purple-500/10' : d.bestTierOrder === 2 ? 'bg-amber-500/10' : 'bg-muted'}`}>
                        {tierIcon(d.bestTierOrder)}
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground leading-tight truncate w-full">{vendor.name.split(' ')[0]}</p>
                    <p className="text-[8px] text-muted-foreground truncate w-full">{vendor.name.split(' ').slice(1).join(' ')}</p>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Badge className={`text-[7px] border-0 px-1.5 py-0 ${sc.cls}`}>{sc.label}</Badge>
                    {d.bestTierOrder > 1 && (
                      <Badge className={`text-[7px] border px-1.5 py-0 ${tierColor(d.bestTierOrder)}`}>{d.bestTierName}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-muted/40 p-1.5 text-center">
                      <p className="text-[11px] font-bold text-foreground">{d.salesMonth}</p>
                      <p className="text-[7px] text-muted-foreground">ventas</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-1.5 text-center">
                      <p className="text-[11px] font-bold text-primary">{formatCOP(d.gmv).replace(' COP', '')}</p>
                      <p className="text-[7px] text-muted-foreground">GMV</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-[10px] font-medium text-muted-foreground">{searchQuery ? 'Sin resultados' : 'Sin vendedores en tu red'}</p>
          </div>
        )}
      </div>

      {/* Invite Dialog with service + tier selection */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-foreground">Invitar vendedor</h3>
              <p className="text-[9px] text-muted-foreground">Crea una invitacion personalizada</p>
            </div>

            {/* Service selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground">Servicio (opcional)</label>
              <Select value={inviteService} onValueChange={v => { setInviteService(v); setInviteTier(''); }}>
                <SelectTrigger className="h-8 text-[10px]">
                  <SelectValue placeholder="Todos los servicios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  {companyServices.filter(s => s.status === 'activo').map(svc => (
                    <SelectItem key={svc.id} value={svc.id}>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> {svc.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tier selector (only if service selected) */}
            {inviteService && inviteService !== 'all' && selectedServiceTiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Nivel de comision</label>
                <Select value={inviteTier} onValueChange={setInviteTier}>
                  <SelectTrigger className="h-8 text-[10px]">
                    <SelectValue placeholder="Nivel publico" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedServiceTiers.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-1.5">
                          {tierIcon(t.tierOrder)} {t.name} ({t.commissionPct}%)
                          {t.isPublic && <span className="text-[8px] text-muted-foreground ml-1">publico</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Generated link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground">Link de invitacion</label>
              <div className="flex gap-2">
                <Input value={getInviteLink()} readOnly className="h-7 text-[9px] font-mono rounded-lg" />
                <Button size="sm" variant="outline" className="h-7 text-[9px] gap-1 rounded-lg flex-shrink-0" onClick={copyInviteLink}>
                  <Copy className="w-2.5 h-2.5" /> Copiar
                </Button>
              </div>
            </div>

            {inviteService && inviteService !== 'all' && inviteTier && (
              <p className="text-[9px] text-muted-foreground bg-muted/30 rounded-lg p-2">
                El vendedor sera asignado automaticamente al nivel seleccionado en este servicio al registrarse.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
