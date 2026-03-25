import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tag, Lock, Copy, Plus, X, Save } from "lucide-react";
import { formatCOP } from "@/data/mockData";
import { toast } from "sonner";
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
        <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{coupons.filter(c => c.active).length} cupones activos</p>
        <Button size="sm" className="h-8 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Crear cupón
        </Button>
      </div>

      {coupons.length > 0 ? (
        <div className="space-y-2">
          {coupons.map(coupon => (
            <div key={coupon.id} className={`p-4 rounded-xl border ${coupon.active ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30 opacity-60'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-primary bg-card px-2.5 py-1 rounded-lg border border-border">{coupon.code}</code>
                  <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Código copiado"); }}>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[9px] border-0 ${coupon.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                    {coupon.active ? 'Activo' : 'Expirado'}
                  </Badge>
                  {coupon.active && (
                    <Button size="sm" variant="ghost" className="h-6 text-[9px] text-destructive px-1.5"
                      onClick={() => setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: false } : c))}>
                      Desactivar
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-sm font-bold">{coupon.type === 'porcentaje' ? `${coupon.discount}%` : formatCOP(coupon.discount)}</p>
                  <p className="text-[9px] text-muted-foreground">Descuento</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{coupon.uses}/{coupon.maxUses}</p>
                  <p className="text-[9px] text-muted-foreground">Usos</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{new Date(coupon.expires).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-[9px] text-muted-foreground">Vence</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Sin cupones</p>
          <p className="text-xs text-muted-foreground">Crea tu primer cupón para este producto</p>
        </div>
      )}

      {/* Create coupon dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Crear cupón — {service.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Código</Label>
              <Input className="h-9 font-mono uppercase" placeholder="PROMO20" value={newCoupon.code}
                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de descuento</Label>
                <Select value={newCoupon.type} onValueChange={v => setNewCoupon({ ...newCoupon, type: v as any })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                    <SelectItem value="fijo">Monto fijo (COP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{newCoupon.type === 'porcentaje' ? 'Porcentaje' : 'Monto COP'}</Label>
                <Input type="number" className="h-9" placeholder={newCoupon.type === 'porcentaje' ? '20' : '50000'}
                  value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Máximo de usos</Label>
                <Input type="number" className="h-9" placeholder="100" value={newCoupon.maxUses}
                  onChange={e => setNewCoupon({ ...newCoupon, maxUses: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fecha de expiración</Label>
                <Input type="date" className="h-9" value={newCoupon.expires}
                  onChange={e => setNewCoupon({ ...newCoupon, expires: e.target.value })} />
              </div>
            </div>
            {newCoupon.discount && newCoupon.code && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Precio con cupón: <span className="font-bold text-primary">
                    {formatCOP(newCoupon.type === 'porcentaje'
                      ? service.priceCOP - (service.priceCOP * Number(newCoupon.discount) / 100)
                      : service.priceCOP - Number(newCoupon.discount)
                    )}
                  </span>
                  <span className="line-through ml-2 text-muted-foreground">{formatCOP(service.priceCOP)}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleCreateCoupon}><Save className="w-3.5 h-3.5 mr-1" /> Crear cupón</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
