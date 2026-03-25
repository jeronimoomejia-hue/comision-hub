import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Tag, Plus, Trash2, Copy, Lock, ShoppingCart, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { companies, CURRENT_COMPANY_ID, formatCOP } from "@/data/mockData";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'porcentaje' | 'fijo';
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  serviceId?: string;
}

const initialCoupons: Coupon[] = [
  { id: '1', code: 'BIENVENIDO20', discount: 20, type: 'porcentaje', maxUses: 50, usedCount: 12, expiresAt: '2026-06-30', isActive: true },
  { id: '2', code: 'PROMO10', discount: 10, type: 'porcentaje', maxUses: 100, usedCount: 45, expiresAt: '2026-04-30', isActive: true },
  { id: '3', code: 'ESPECIAL50K', discount: 50000, type: 'fijo', maxUses: 10, usedCount: 10, expiresAt: '2026-02-28', isActive: false },
];

export default function CompanyCoupons() {
  const { currentCompanyPlan, services } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'porcentaje' as 'porcentaje' | 'fijo', maxUses: '', expiresAt: '2026-12-31', serviceId: 'all' });

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
    if (!newCoupon.code.trim() || !newCoupon.discount) { toast.error("Completa los campos requeridos"); return; }
    setCoupons(prev => [...prev, {
      id: `coupon-${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discount: Number(newCoupon.discount),
      type: newCoupon.type,
      maxUses: Number(newCoupon.maxUses) || 100,
      usedCount: 0,
      expiresAt: newCoupon.expiresAt,
      isActive: true,
      serviceId: newCoupon.serviceId === 'all' ? undefined : newCoupon.serviceId,
    }]);
    setShowCreate(false);
    setNewCoupon({ code: '', discount: '', type: 'porcentaje', maxUses: '', expiresAt: '2026-12-31', serviceId: 'all' });
    toast.success("Cupón creado");
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
              const discountLabel = coupon.type === 'porcentaje' ? `${coupon.discount}%` : formatCOP(coupon.discount);

              return (
                <div
                  key={coupon.id}
                  className={`rounded-xl border bg-card p-4 transition-all space-y-3 ${
                    coupon.isActive && !isExpired ? 'border-border' : 'border-border/50 opacity-60'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <code className="text-sm font-mono font-bold text-foreground tracking-wide">{coupon.code}</code>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {discountLabel} off
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Código copiado"); }}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <Switch checked={coupon.isActive}
                        onCheckedChange={() => setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))} />
                      <button onClick={() => { setCoupons(prev => prev.filter(c => c.id !== coupon.id)); toast.success("Cupón eliminado"); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{coupon.usedCount}/{coupon.maxUses} usos</span>
                      <span>Vence {new Date(coupon.expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                    </div>
                  </div>

                  {linkedService && (
                    <p className="text-[10px] text-muted-foreground">Aplica a: {linkedService.name}</p>
                  )}

                  {/* Register sale with coupon */}
                  {coupon.isActive && !isExpired && (
                    <button
                      onClick={() => toast.success(`Registrar venta con cupón ${coupon.code}`, { description: 'Funcionalidad disponible en cada producto' })}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Registrar venta con este cupón
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
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
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select value={newCoupon.type} onValueChange={v => setNewCoupon({ ...newCoupon, type: v as any })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                      <SelectItem value="fijo">Monto fijo (COP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{newCoupon.type === 'porcentaje' ? 'Porcentaje' : 'Monto COP'}</Label>
                  <Input type="number" className="h-9 text-sm" placeholder={newCoupon.type === 'porcentaje' ? '20' : '50000'}
                    value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Máx. usos</Label>
                  <Input type="number" className="h-9 text-sm" placeholder="100" value={newCoupon.maxUses}
                    onChange={e => setNewCoupon({ ...newCoupon, maxUses: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Expira</Label>
                  <Input type="date" className="h-9 text-sm" value={newCoupon.expiresAt}
                    onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Producto</Label>
                <Select value={newCoupon.serviceId} onValueChange={v => setNewCoupon({ ...newCoupon, serviceId: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los productos</SelectItem>
                    {companyServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newCoupon.discount && newCoupon.code && companyServices[0] && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    Ejemplo: <span className="font-bold text-primary">
                      {formatCOP(newCoupon.type === 'porcentaje'
                        ? companyServices[0].priceCOP - (companyServices[0].priceCOP * Number(newCoupon.discount) / 100)
                        : companyServices[0].priceCOP - Number(newCoupon.discount)
                      )}
                    </span>
                    <span className="line-through ml-2 text-muted-foreground/60">{formatCOP(companyServices[0].priceCOP)}</span>
                    <span className="ml-1 text-muted-foreground/60">({companyServices[0].name})</span>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button size="sm" className="text-xs" onClick={handleCreate}><Save className="w-3.5 h-3.5 mr-1" /> Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
