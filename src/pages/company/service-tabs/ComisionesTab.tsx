import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Crown, Star, Shield, Plus, Trash2, Check, Copy, 
  Users, Eye, EyeOff, Pencil, Save, X 
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CommissionTier } from "@/data/mockData";

const tierStyles: Record<number, { icon: React.ElementType; border: string; bg: string; text: string; label: string }> = {
  1: { icon: Shield, border: 'border-border', bg: 'bg-muted/30', text: 'text-muted-foreground', label: 'Básico' },
  2: { icon: Star, border: 'border-amber-400/40', bg: 'bg-amber-500/5', text: 'text-amber-600', label: 'Premium' },
  3: { icon: Crown, border: 'border-primary/40', bg: 'bg-primary/5', text: 'text-primary', label: 'Elite' },
};

export default function ComisionesTab({ service }: { service: any }) {
  const { commissionTiers, vendorCommissionAssignments, addCommissionTier, updateCommissionTier, removeCommissionTier } = useDemo();
  const serviceTiers = commissionTiers.filter(t => t.serviceId === service.id).sort((a, b) => a.tierOrder - b.tierOrder);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPct, setEditPct] = useState("");
  const [newTierName, setNewTierName] = useState("");
  const [newTierPct, setNewTierPct] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const canAddMore = serviceTiers.length < 3;
  const nextOrder = serviceTiers.length > 0 ? Math.max(...serviceTiers.map(t => t.tierOrder)) + 1 : 1;

  const getAssignedVendorCount = (tierId: string) => {
    return vendorCommissionAssignments.filter(a => a.tierId === tierId).length;
  };

  const handleCreateTier = () => {
    if (!newTierName.trim() || !newTierPct) return;
    const pct = parseFloat(newTierPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Porcentaje inválido");
      return;
    }
    addCommissionTier({
      serviceId: service.id,
      name: newTierName.trim(),
      commissionPct: pct,
      isPublic: serviceTiers.length === 0,
      tierOrder: (nextOrder as 1 | 2 | 3),
    });
    setNewTierName("");
    setNewTierPct("");
    setShowCreate(false);
    toast.success("Nivel de comisión creado");
  };

  const handleSetPublic = (tierId: string) => {
    serviceTiers.forEach(t => {
      if (t.id === tierId) {
        updateCommissionTier(t.id, { isPublic: true });
      } else if (t.isPublic) {
        updateCommissionTier(t.id, { isPublic: false });
      }
    });
    toast.success("Nivel público actualizado");
  };

  const handleStartEdit = (tier: CommissionTier) => {
    setEditingId(tier.id);
    setEditName(tier.name);
    setEditPct(tier.commissionPct.toString());
  };

  const handleSaveEdit = (tierId: string) => {
    const pct = parseFloat(editPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Porcentaje inválido");
      return;
    }
    updateCommissionTier(tierId, { name: editName.trim(), commissionPct: pct });
    setEditingId(null);
    toast.success("Nivel actualizado");
  };

  const handleDelete = (tierId: string) => {
    const assigned = getAssignedVendorCount(tierId);
    if (assigned > 0) {
      toast.error(`No puedes eliminar: ${assigned} vendedores asignados`);
      return;
    }
    removeCommissionTier(tierId);
    toast.success("Nivel eliminado");
  };

  const copyTierLink = (tierId: string) => {
    const link = `${window.location.origin}/join/${service.id}?tier=${tierId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Niveles de comisión</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Crea hasta 3 niveles. Un nivel es público (visible para todos), los demás son por invitación.
          </p>
        </div>
        {canAddMore && !showCreate && (
          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-full" onClick={() => setShowCreate(true)}>
            <Plus className="w-3 h-3 mr-1" /> Crear nivel
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {serviceTiers.map(tier => {
            const style = tierStyles[tier.tierOrder] || tierStyles[1];
            const TierIcon = style.icon;
            const isEditing = editingId === tier.id;
            const assignedCount = getAssignedVendorCount(tier.id);

            return (
              <motion.div
                key={tier.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn("rounded-xl border p-4 transition-all", style.border, style.bg)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", style.bg)}>
                      <TierIcon className={cn("w-4 h-4", style.text)} />
                    </div>
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Input 
                          value={editName} 
                          onChange={e => setEditName(e.target.value)} 
                          className="h-7 text-sm w-32"
                        />
                        <div className="flex items-center gap-1">
                          <Input 
                            value={editPct} 
                            onChange={e => setEditPct(e.target.value)} 
                            className="h-7 text-sm w-16" 
                            type="number"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                        <p className={cn("text-lg font-bold", style.text)}>{tier.commissionPct}%</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(tier.id)}>
                          <Save className="w-3 h-3 text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStartEdit(tier)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(tier.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{assignedCount} vendedor{assignedCount !== 1 ? 'es' : ''}</span>
                  </div>

                  {tier.isPublic ? (
                    <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-0">
                      <Eye className="w-2.5 h-2.5 mr-0.5" /> Público
                    </Badge>
                  ) : (
                    <button onClick={() => handleSetPublic(tier.id)} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                      <EyeOff className="w-3 h-3" /> Privado · <span className="underline">Hacer público</span>
                    </button>
                  )}

                  {!tier.isPublic && (
                    <button onClick={() => copyTierLink(tier.id)} className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                      <Copy className="w-3 h-3" /> Copiar link
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Nuevo nivel de comisión</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Nombre</Label>
                  <Input 
                    value={newTierName} 
                    onChange={e => setNewTierName(e.target.value)} 
                    placeholder={tierStyles[nextOrder]?.label || 'Nivel'} 
                    className="h-8 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Comisión (%)</Label>
                  <Input 
                    value={newTierPct} 
                    onChange={e => setNewTierPct(e.target.value)} 
                    placeholder="15" 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="h-8 text-sm" 
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[10px] rounded-full" onClick={handleCreateTier}>
                  <Check className="w-3 h-3 mr-1" /> Crear
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-full" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {serviceTiers.length === 0 && !showCreate && (
        <div className="text-center py-10 rounded-xl border border-dashed border-border">
          <Crown className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin niveles de comisión</p>
          <p className="text-xs text-muted-foreground mb-4">
            Crea niveles para ofrecer diferentes comisiones a tus vendedores
          </p>
          <Button size="sm" className="h-8 text-xs rounded-full" onClick={() => setShowCreate(true)}>
            <Plus className="w-3 h-3 mr-1" /> Crear primer nivel
          </Button>
        </div>
      )}

      {serviceTiers.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 p-3.5">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">¿Cómo funciona?</strong> El nivel <strong>público</strong> es el que ven todos los vendedores al descubrir tu servicio. 
            Los niveles privados solo son accesibles vía link de invitación. Puedes asignar vendedores a niveles superiores desde la pestaña de Vendedores.
          </p>
        </div>
      )}
    </div>
  );
}
