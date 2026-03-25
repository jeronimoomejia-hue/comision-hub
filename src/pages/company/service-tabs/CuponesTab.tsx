import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Lock, Copy, Plus, Save, ShoppingCart, Trash2 } from "lucide-react";
import { formatCOP } from "@/data/mockData";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CuponesTab({ service, currentPlan }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'NUEVO20', discount: 20, type: 'porcentaje' as const, expires: '2026-04-30', uses: 12, maxUses: 50, active: true },
    { id: '2', code: 'PROMO10', discount: 10, type: 'porcentaje' as const, expires: '2026-05-15', uses: 5, maxUses: 100, active: true },
    { id: '3', code: 'LAUNCH50K', discount: 50000, type: 'fijo' as const, expires: '2026-03-31', uses: 3, maxUses: 10, active: false },
  ]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'porcentaje' as 'porcentaje' | 'fijo', maxUses: '', expires: '' });

  if (currentPlan === 'freemium') {
    return (
      <div className="text-center py-12 rounded-xl border border-border bg-card">
        <Lock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Cupones no disponibles</p>
        <p className="text-xs text-muted-foreground">Mejora a Premium o Enterprise para crear cupones.</p>
      </div>
    );
  }

  const handleCreateCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount) { toast.error("Completa los campos requeridos"); return; }
    setCoupons(prev => [...prev, {
      id: String(Date.now()),
      code: newCoupon.code.toUpperCase(),
      discount: Number(newCoupon.discount),
      type: newCoupon.type,
      expires: newCoupon.expires || '2026-12-31',
      uses: 0,
      maxUses: Number(newCoupon.maxUses) || 100,
      active: true,
    }]);
    toast.success("Cupón creado");
    setShowCreate(false);
    setNewCoupon({ code: '', discount: '', type: 'porcentaje', maxUses: '', expires: '' });
  };

  const activeCoupons = coupons.filter(c => c.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{activeCoupons.length} activos</p>
        <Button size="sm" className="h-8 text-xs rounded-full" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo
        </Button>
      </div>

      {coupons.length > 0 ? (
        <div className="space-y-2">
          {coupons.map(coupon => {
            const isExpired = new Date(coupon.expires) < new Date();
            const usagePercent = Math.round((coupon.uses / coupon.maxUses) * 100);
            const discountLabel = coupon.type === 'porcentaje' ? `${coupon.discount}%` : formatCOP(coupon.discount);
            const priceWithDiscount = coupon.type === 'porcentaje'
              ? service.priceCOP - (service.priceCOP * coupon.discount / 100)
              : service.priceCOP - coupon.discount;

            return (
              <div
                key={coupon.id}
                className={`rounded-xl border bg-card p-4 transition-all space-y-3 ${
                  coupon.active && !isExpired ? 'border-border' : 'border-border/50 opacity-60'
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
                    <Switch checked={coupon.active}
                      onCheckedChange={() => setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c))} />
                    <button onClick={() => { setCoupons(prev => prev.filter(c => c.id !== coupon.id)); toast.success("Cupón eliminado"); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Usage bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{coupon.uses}/{coupon.maxUses} usos</span>
                    <span>Vence {new Date(coupon.expires).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                  </div>
                </div>

                {/* Price preview */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground">Precio con cupón:</span>
                  <span className="font-semibold text-primary">{formatCOP(Math.max(0, priceWithDiscount))}</span>
                  <span className="line-through text-muted-foreground/60">{formatCOP(service.priceCOP)}</span>
                </div>

                {/* Register sale with coupon */}
                {coupon.active && !isExpired && (
                  <button
                    onClick={() => toast.success(`Registrar venta con cupón ${coupon.code}`, { description: 'Funcionalidad disponible para vendedores' })}
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
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Tag className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin cupones</p>
          <p className="text-xs text-muted-foreground">Crea tu primer cupón para este producto</p>
        </div>
      )}

      {/* Create coupon dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Nuevo cupón — {service.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Código</Label>
              <Input className="h-9 font-mono uppercase text-sm" placeholder="PROMO20" value={newCoupon.code}
                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
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
                <Input type="date" className="h-9 text-sm" value={newCoupon.expires}
                  onChange={e => setNewCoupon({ ...newCoupon, expires: e.target.value })} />
              </div>
            </div>
            {newCoupon.discount && newCoupon.code && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Precio con cupón: <span className="font-bold text-primary">
                    {formatCOP(newCoupon.type === 'porcentaje'
                      ? service.priceCOP - (service.priceCOP * Number(newCoupon.discount) / 100)
                      : service.priceCOP - Number(newCoupon.discount)
                    )}
                  </span>
                  <span className="line-through ml-2 text-muted-foreground/60">{formatCOP(service.priceCOP)}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button size="sm" className="text-xs" onClick={handleCreateCoupon}><Save className="w-3.5 h-3.5 mr-1" /> Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
