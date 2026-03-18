import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sales, services, vendors, commissions, formatCOP, CURRENT_COMPANY_ID } from "@/data/mockData";

export default function CompanyVendors() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const companySales = sales.filter(s => s.companyId === CURRENT_COMPANY_ID);
  const vendorIds = new Set(companySales.map(s => s.vendorId));
  const companyVendors = vendors.filter(v => vendorIds.has(v.id));

  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const getVendorStats = (vendorId: string) => {
    const vs = companySales.filter(s => s.vendorId === vendorId);
    const monthSales = vs.filter(s => new Date(s.createdAt) >= monthAgo);
    const gmv = monthSales.reduce((sum, s) => sum + s.amountCOP, 0);
    const vc = commissions.filter(c => c.vendorId === vendorId && companySales.some(s => s.id === c.saleId));
    return { salesMonth: monthSales.length, gmv, commission: vc.reduce((sum, c) => sum + c.amountCOP, 0) };
  };

  return (
    <DashboardLayout role="company" userName="Poliza.ai">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Vendedores</h1>

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
          {companyVendors.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Sin vendedores</p>}
        </div>

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
      </div>
    </DashboardLayout>
  );
}