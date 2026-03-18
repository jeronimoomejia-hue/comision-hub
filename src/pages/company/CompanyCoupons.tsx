import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Tag, Plus, Trash2, Copy, Lock, Percent, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { companies, CURRENT_COMPANY_ID, formatCOP } from "@/data/mockData";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discountPct: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  serviceId?: string;
}

const initialCoupons: Coupon[] = [
  { id: '1', code: 'BIENVENIDO20', discountPct: 20, maxUses: 50, usedCount: 12, expiresAt: '2026-06-30', isActive: true },
  { id: '2', code: 'PROMO10', discountPct: 10, maxUses: 100, usedCount: 45, expiresAt: '2026-04-30', isActive: true },
  { id: '3', code: 'ESPECIAL30', discountPct: 30, maxUses: 10, usedCount: 10, expiresAt: '2026-02-28', isActive: false },
];

export default function CompanyCoupons() {
  const { currentCompanyPlan, services } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPct: 10, maxUses: 50, expiresAt: '2026-12-31', serviceId: 'all' });

  const companyServices = services.filter(s => s.companyId === CURRENT_COMPANY_ID);

  if (currentCompanyPlan === 'freemium') {
    return (
      <DashboardLayout role="company" userName={company?.name}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Cupones no disponibles</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Los cupones de descuento no están disponibles en el plan Freemium. Mejora a Premium para habilitarlos.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreate = () => {
    if (!newCoupon.code.trim()) { toast.error("Ingresa un código"); return; }
    setCoupons(prev => [...prev, {
      id: `coupon-${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discountPct: newCoupon.discountPct,
      maxUses: newCoupon.maxUses,
      usedCount: 0,
      expiresAt: newCoupon.expiresAt,
      isActive: true,
      serviceId: newCoupon.serviceId === 'all' ? undefined : newCoupon.serviceId,
    }]);
    setShowCreate(false);
    setNewCoupon({ code: '', discountPct: 10, maxUses: 50, expiresAt: '2026-12-31', serviceId: 'all' });
    toast.success("Cupón creado correctamente");
  };

  const toggleCoupon = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast.success("Cupón eliminado");
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Cupones de descuento</h1>
            <p className="text-xs text-muted-foreground">{coupons.filter(c => c.isActive).length} cupones activos</p>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nuevo cupón
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Tag className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{coupons.length}</p>
            <p className="text-[10px] text-muted-foreground">Total cupones</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Percent className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold">{coupons.filter(c => c.isActive).length}</p>
            <p className="text-[10px] text-muted-foreground">Activos</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold">{coupons.reduce((s, c) => s + c.usedCount, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Usos totales</p>
          </div>
        </div>

        {/* Coupons list */}
        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          {coupons.map(coupon => (
            <div key={coupon.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coupon.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Tag className={`w-5 h-5 ${coupon.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold">{coupon.code}</p>
                    <Badge variant={coupon.isActive ? "default" : "secondary"} className="text-[9px]">
                      {coupon.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {coupon.discountPct}% descuento · {coupon.usedCount}/{coupon.maxUses} usos · Vence {coupon.expiresAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCouponCode(coupon.code)}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Switch checked={coupon.isActive} onCheckedChange={() => toggleCoupon(coupon.id)} />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCoupon(coupon.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Sin cupones. Crea el primero.</p>
          )}
        </div>

        {/* Create modal */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-base">Crear cupón</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Código</Label>
                <Input
                  className="h-8 text-sm mt-1 font-mono uppercase"
                  placeholder="PROMO20"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Descuento %</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={newCoupon.discountPct}
                    onChange={e => setNewCoupon({ ...newCoupon, discountPct: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Máx. usos</Label>
                  <Input type="number" className="h-8 text-sm mt-1" value={newCoupon.maxUses}
                    onChange={e => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Fecha de expiración</Label>
                  <Input type="date" className="h-8 text-sm mt-1" value={newCoupon.expiresAt}
                    onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Servicio</Label>
                  <Select value={newCoupon.serviceId} onValueChange={v => setNewCoupon({ ...newCoupon, serviceId: v })}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los servicios</SelectItem>
                      {companyServices.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" className="text-xs" onClick={handleCreate}>Crear cupón</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
