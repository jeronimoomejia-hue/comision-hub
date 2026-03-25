import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Tag, Plus, Trash2, Copy, Lock, ShoppingCart } from "lucide-react";
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
          <Lock className="w-10 h-10 text-muted-foreground/20 mb-4" />
          <h2 className="text-base font-semibold mb-1">Cupones no disponibles</h2>
          <p className="text-xs text-muted-foreground max-w-xs">Mejora a Premium para crear cupones de descuento.</p>
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
    toast.success("Cupón creado");
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

  const activeCoupons = coupons.filter(c => c.isActive);
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Cupones</h1>
            <p className="text-xs text-muted-foreground">{activeCoupons.length} activos · {totalUses} usos totales</p>
          </div>
          <Button size="sm" className="h-8 text-xs rounded-full" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo
          </Button>
        </div>

        {/* Coupons list */}
        {coupons.length > 0 ? (
          <div className="space-y-2">
            {coupons.map(coupon => {
              const linkedService = coupon.serviceId ? companyServices.find(s => s.id === coupon.serviceId) : null;
              const isExpired = new Date(coupon.expiresAt) < new Date();
              const usagePercent = Math.round((coupon.usedCount / coupon.maxUses) * 100);

              return (
                <div
                  key={coupon.id}
                  className={`rounded-2xl border bg-card p-4 transition-all ${
                    coupon.isActive && !isExpired ? 'border-border' : 'border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <code className="text-sm font-mono font-bold text-foreground tracking-wide">{coupon.code}</code>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {coupon.discountPct}% off
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => copyCouponCode(coupon.code)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <Switch checked={coupon.isActive} onCheckedChange={() => toggleCoupon(coupon.id)} />
                      <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2.5">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{coupon.usedCount} de {coupon.maxUses} usos</span>
                      <span>Vence {new Date(coupon.expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                    </div>
                  </div>

                  {linkedService && (
                    <p className="text-[10px] text-muted-foreground">Aplica a: {linkedService.name}</p>
                  )}

                  {/* Quick action: register sale with this coupon */}
                  {coupon.isActive && !isExpired && (
                    <button
                      onClick={() => toast.success(`Registrar venta con cupón ${coupon.code}`, { description: 'Funcionalidad disponible en cada producto' })}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Registrar venta con este cupón
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-border bg-card">
            <Tag className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Sin cupones</p>
            <p className="text-xs text-muted-foreground">Crea tu primer cupón de descuento</p>
          </div>
        )}

        {/* Create modal */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Nuevo cupón</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Código</Label>
                <Input
                  className="h-9 text-sm font-mono uppercase"
                  placeholder="PROMO20"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Descuento %</Label>
                  <Input type="number" className="h-9 text-sm" value={newCoupon.discountPct}
                    onChange={e => setNewCoupon({ ...newCoupon, discountPct: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Máx. usos</Label>
                  <Input type="number" className="h-9 text-sm" value={newCoupon.maxUses}
                    onChange={e => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Expira</Label>
                  <Input type="date" className="h-9 text-sm" value={newCoupon.expiresAt}
                    onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Producto</Label>
                  <Select value={newCoupon.serviceId} onValueChange={v => setNewCoupon({ ...newCoupon, serviceId: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {companyServices.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button size="sm" className="text-xs" onClick={handleCreate}>Crear cupón</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
