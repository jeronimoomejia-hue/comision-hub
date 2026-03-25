import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye, Plus, Copy, Users, TrendingUp, DollarSign, ShoppingCart, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sales, services, vendors, commissions, formatCOP, CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

export default function CompanyVendors() {
  const { currentCompanyPlan } = useDemo();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const vendorIds = new Set(companySales.map(s => s.vendorId));
  const companyVendors = vendors.filter(v => vendorIds.has(v.id));
  const inviteLink = `https://app.mensualista.com/join/${company?.id || 'demo'}`;

  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const getVendorStats = (vendorId: string) => {
    const vs = companySales.filter(s => s.vendorId === vendorId);
    const monthSales = vs.filter(s => new Date(s.createdAt) >= monthAgo);
    const gmv = monthSales.reduce((sum, s) => sum + s.amountCOP, 0);
    const vc = commissions.filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId));
    return { salesMonth: monthSales.length, totalSales: vs.length, gmv, commission: vc.reduce((sum, c) => sum + c.amountCOP, 0) };
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Enlace copiado");
  };

  const filteredVendors = companyVendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by monthly sales
  const sortedVendors = [...filteredVendors].sort((a, b) => 
    getVendorStats(b.id).salesMonth - getVendorStats(a.id).salesMonth
  );

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Red de vendedores</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{companyVendors.length} vendedores activos</p>
          </div>
          <Button size="sm" className="text-xs h-8" onClick={() => setShowInvite(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Invitar
          </Button>
        </div>

        {/* Invite banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Users className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Crece tu red</p>
            <p className="text-[11px] text-muted-foreground">Comparte el enlace para que nuevos vendedores se unan.</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs gap-1 flex-shrink-0" onClick={copyInviteLink}>
            <Copy className="w-3 h-3" /> Copiar
          </Button>
        </div>

        {/* Search */}
        {companyVendors.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar vendedor..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-card border-border rounded-xl text-xs" />
          </div>
        )}

        {/* Vendors list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/50">
          {sortedVendors.map(vendor => {
            const stats = getVendorStats(vendor.id);
            return (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor({ ...vendor, stats })}
                className="w-full flex items-center justify-between px-4 py-3.5 gap-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{vendor.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{vendor.name}</p>
                    <p className="text-[10px] text-muted-foreground">{stats.salesMonth} ventas este mes · {stats.totalSales} total</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{formatCOP(stats.commission)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
              </button>
            );
          })}
          {sortedVendors.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {searchQuery ? 'Sin resultados' : 'Sin vendedores. Invita al primero.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vendor detail modal */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Detalle del vendedor</DialogTitle></DialogHeader>
          {selectedVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{selectedVendor.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedVendor.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedVendor.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShoppingCart, label: "Ventas", value: selectedVendor.stats.salesMonth },
                  { icon: DollarSign, label: "GMV", value: formatCOP(selectedVendor.stats.gmv) },
                  { icon: TrendingUp, label: "Comisión", value: formatCOP(selectedVendor.stats.commission) },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-2.5 text-center">
                    <s.icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite modal */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Invitar vendedor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Enlace de invitación</Label>
              <div className="flex gap-2 mt-1">
                <Input value={inviteLink} readOnly className="h-8 text-xs font-mono" />
                <Button size="sm" variant="outline" className="h-8" onClick={copyInviteLink}><Copy className="w-3.5 h-3.5" /></Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Comparte este enlace con tus vendedores.</p>
            </div>
            <div>
              <Label className="text-xs">O invita por email</Label>
              <Input placeholder="vendedor@email.com" className="h-8 text-sm mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" className="text-xs" onClick={() => { setShowInvite(false); toast.success("Invitación enviada"); }}>
              Enviar invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
