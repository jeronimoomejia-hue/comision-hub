import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye, RotateCcw, Shield, Edit3, Save, X, Info, AlertTriangle, Clock, Check
} from "lucide-react";
import { toast } from "sonner";

export default function ConfigTab({ service, updateService }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const startEdit = () => {
    setEditData({
      status: service.status,
      refundWindowDays: service.refundPolicy.refundWindowDays,
      autoRefund: service.refundPolicy.autoRefund,
      noRefund: service.refundPolicy.refundWindowDays === 0,
      requiresTraining: service.requiresTraining,
      trainingType: service.trainingType || 'pdf',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateService(service.id, {
      status: editData.status,
      refundPolicy: {
        autoRefund: editData.noRefund ? false : editData.autoRefund,
        refundWindowDays: editData.noRefund ? 0 : editData.refundWindowDays,
      },
      requiresTraining: editData.requiresTraining,
      trainingType: editData.trainingType,
    });
    setIsEditing(false);
    toast.success("Configuración guardada");
  };

  const refundWindowDays = service.refundPolicy.refundWindowDays;
  const noRefund = refundWindowDays === 0;

  return (
    <div className="space-y-5">
      {/* Actions */}
      <div className="flex items-center justify-end">
        {isEditing ? (
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setIsEditing(false)}>
              <X className="w-3.5 h-3.5 mr-1" /> Cancelar
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
              <Save className="w-3.5 h-3.5 mr-1" /> Guardar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={startEdit}>
            <Edit3 className="w-3.5 h-3.5 mr-1" /> Editar configuración
          </Button>
        )}
      </div>

      {/* Status */}
      <section className="p-4 rounded-xl border border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Estado del servicio</h3>
        {isEditing ? (
          <div className="flex items-center gap-3">
            <Switch checked={editData.status === 'activo'} onCheckedChange={v => setEditData({ ...editData, status: v ? 'activo' : 'pausado' })} />
            <div>
              <p className="text-sm font-medium">{editData.status === 'activo' ? 'Activo' : 'Pausado'}</p>
              <p className="text-[10px] text-muted-foreground">{editData.status === 'activo' ? 'Visible para vendedores y disponible para venta' : 'Oculto para vendedores, no se pueden registrar ventas'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${service.status === 'activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div>
              <p className="text-sm font-medium">{service.status === 'activo' ? 'Activo' : 'Pausado'}</p>
              <p className="text-[10px] text-muted-foreground">{service.status === 'activo' ? 'Visible para vendedores' : 'Oculto para vendedores'}</p>
            </div>
          </div>
        )}
      </section>

      {/* Refund Policy */}
      <section className="p-4 rounded-xl border border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><RotateCcw className="w-4 h-4 text-primary" /> Política de devoluciones</h3>
        {isEditing ? (
          <div className="space-y-4">
            {/* No refund toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Switch checked={editData.noRefund} onCheckedChange={v => setEditData({ ...editData, noRefund: v })} />
              <div>
                <p className="text-sm font-medium">Sin devoluciones</p>
                <p className="text-[10px] text-muted-foreground">Este servicio no ofrece devoluciones. Los fondos se liberan inmediatamente.</p>
              </div>
            </div>

            {!editData.noRefund && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Ventana de devolución</Label>
                  <div className="flex gap-2">
                    {[7, 14, 30].map(days => (
                      <button key={days} onClick={() => setEditData({ ...editData, refundWindowDays: days })}
                        className={`flex-1 py-3 rounded-xl text-center transition-colors border ${
                          editData.refundWindowDays === days
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted/50'
                        }`}>
                        <p className="text-lg font-bold">{days}</p>
                        <p className="text-[9px]">días</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" /> La ventana de devolución también define los días de retención de comisiones del vendedor.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={editData.autoRefund} onCheckedChange={v => setEditData({ ...editData, autoRefund: v })} />
                  <div>
                    <p className="text-sm font-medium">Devolución automática</p>
                    <p className="text-[10px] text-muted-foreground">{editData.autoRefund ? 'El sistema aprueba las devoluciones sin tu revisión' : 'Tú decides si apruebas o rechazas cada solicitud'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {noRefund ? (
              <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Sin devoluciones</p>
                  <p className="text-xs text-muted-foreground">Este servicio no ofrece devoluciones. Los fondos se liberan inmediatamente después de la venta.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border bg-muted/30">
                  <Clock className="w-4 h-4 text-muted-foreground mb-2" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ventana</p>
                  <p className="text-2xl font-bold mt-1">{refundWindowDays} <span className="text-sm font-normal text-muted-foreground">días</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1">Retención de comisiones</p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/30">
                  {service.refundPolicy.autoRefund ? <Check className="w-4 h-4 text-emerald-500 mb-2" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mb-2" />}
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Tipo</p>
                  <p className="text-2xl font-bold mt-1">{service.refundPolicy.autoRefund ? 'Auto' : 'Manual'}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{service.refundPolicy.autoRefund ? 'Sin revisión' : 'Requiere tu aprobación'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Training config */}
      <section className="p-4 rounded-xl border border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Capacitación</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={editData.requiresTraining} onCheckedChange={v => setEditData({ ...editData, requiresTraining: v })} />
              <div>
                <p className="text-sm font-medium">Requiere capacitación</p>
                <p className="text-[10px] text-muted-foreground">Los vendedores deben completar la capacitación antes de vender</p>
              </div>
            </div>
            {editData.requiresTraining && (
              <div className="space-y-1.5 pl-12">
                <Label className="text-xs">Tipo de contenido principal</Label>
                <Select value={editData.trainingType} onValueChange={v => setEditData({ ...editData, trainingType: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF / Documento</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${service.requiresTraining ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
            <div>
              <p className="text-sm font-medium">{service.requiresTraining ? 'Capacitación requerida' : 'Sin capacitación'}</p>
              <p className="text-[10px] text-muted-foreground">
                {service.requiresTraining ? `Tipo: ${service.trainingType?.toUpperCase() || 'PDF'} — Los vendedores deben completarla` : 'Los vendedores pueden vender sin capacitarse'}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
