import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye, Plus, Copy, Link2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    return { salesMonth: monthSales.length, gmv, commission: vc.reduce((sum, c) => sum + c.amountCOP, 0) };
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Enlace copiado al portapapeles");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mi Red de Vendedores</h1>
            <p className="text-xs text-muted-foreground">{companyVendors.length} vendedores activos</p>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={() => setShowInvite(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Invitar vendedor
          </Button>
        </div>

        {/* Invite banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Crece tu red de vendedores</p>
              <p className="text-xs text-muted-foreground">
                Comparte el enlace de invitación para que nuevos vendedores se unan a tu red privada.
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={copyInviteLink}>
              <Copy className="w-3 h-3" />
              Copiar enlace
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {companyVendors.map(vendor => {
            const stats = getVendorStats(vendor.id);
            return (
              <div key={vendor.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{vendor.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{vendor.name}</p>
                    <p className="text-[10px] text-muted-foreground">{stats.salesMonth} ventas · {formatCOP(stats.gmv)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{formatCOP(stats.commission)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedVendor({ ...vendor, stats })}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {companyVendors.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Sin vendedores. Invita al primero.</p>
            </div>
          )}
        </div>

        {/* Vendor detail modal */}
        <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Vendedor</DialogTitle></DialogHeader>
            {selectedVendor && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {selectedVendor.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedVendor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold">{selectedVendor.stats.salesMonth}</p>
                    <p className="text-[10px] text-muted-foreground">Ventas</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold">{formatCOP(selectedVendor.stats.gmv)}</p>
                    <p className="text-[10px] text-muted-foreground">GMV</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold text-primary">{formatCOP(selectedVendor.stats.commission)}</p>
                    <p className="text-[10px] text-muted-foreground">Comisión</p>
                  </div>
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
                  <Button size="sm" variant="outline" className="h-8" onClick={copyInviteLink}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Comparte este enlace con tus vendedores para que se registren en tu red.</p>
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
      </div>
    </DashboardLayout>
  );
}
