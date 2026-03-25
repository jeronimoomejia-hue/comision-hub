import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Key, Zap, Upload, AlertTriangle, Download } from "lucide-react";
import { formatCOP } from "@/data/mockData";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export default function CodigosTab({ service, addActivationCodes, currentPlan }: any) {
  const codes = service.activationCodes;
  const codesAvailable = codes.filter((c: any) => c.status === 'available').length;
  const codesDelivered = codes.filter((c: any) => c.status === 'delivered').length;
  const codesPct = codes.length > 0 ? (codesAvailable / codes.length) * 100 : 0;

  const [showAdd, setShowAdd] = useState(false);
  const [newCodes, setNewCodes] = useState("");

  const handleAdd = () => {
    const codeLines = newCodes.split('\n').map(c => c.trim()).filter(Boolean);
    if (codeLines.length === 0) { toast.error("Ingresa al menos un código"); return; }
    addActivationCodes(service.id, codeLines);
    toast.success(`${codeLines.length} códigos agregados`);
    setShowAdd(false);
    setNewCodes("");
  };

  return (
    <div className="space-y-5">
      {currentPlan === 'enterprise' && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Enterprise:</span> Los códigos se sincronizan automáticamente vía API.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{codes.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="p-3 rounded-xl border text-center bg-primary/5 border-primary/20">
          <p className="text-2xl font-bold text-primary">{codesAvailable}</p>
          <p className="text-[10px] text-muted-foreground">Disponibles</p>
        </div>
        <div className="p-3 rounded-xl border text-center">
          <p className="text-2xl font-bold">{codesDelivered}</p>
          <p className="text-[10px] text-muted-foreground">Entregados</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Stock disponible</span>
          <span className={codesAvailable < 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{codesAvailable} códigos</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${codesAvailable === 0 ? 'bg-destructive' : codesAvailable < 5 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${codesPct}%` }} />
        </div>
      </div>

      {/* Low stock alert */}
      {codesAvailable < 5 && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${codesAvailable === 0 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'}`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {codesAvailable === 0 ? 'Sin códigos. Las ventas no se completarán.' : `Quedan solo ${codesAvailable} códigos.`}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => setShowAdd(true)}>
          <Upload className="w-3.5 h-3.5 mr-1.5" /> Agregar códigos
        </Button>
        {codesDelivered > 0 && (
          <Button size="sm" variant="outline" onClick={() => toast.success("Exportación iniciada")}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar
          </Button>
        )}
      </div>

      {/* Recent delivered codes */}
      {codesDelivered > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Últimos entregados</h3>
          <div className="space-y-1">
            {codes.filter((c: any) => c.status === 'delivered').slice(0, 10).map((code: any) => (
              <div key={code.id} className="flex items-center justify-between p-2.5 rounded-lg border text-xs">
                <code className="font-mono text-muted-foreground">{code.code}</code>
                <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-0">Entregado</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available codes */}
      {codesAvailable > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Disponibles</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {codes.filter((c: any) => c.status === 'available').slice(0, 20).map((code: any) => (
              <div key={code.id} className="flex items-center justify-between p-2.5 rounded-lg border text-xs">
                <code className="font-mono text-muted-foreground">{code.code}</code>
                <Badge variant="outline" className="text-[9px]">Disponible</Badge>
              </div>
            ))}
            {codesAvailable > 20 && <p className="text-[10px] text-muted-foreground text-center pt-1">+{codesAvailable - 20} más</p>}
          </div>
        </section>
      )}

      {/* Add codes dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Agregar códigos de activación</DialogTitle>
            <DialogDescription className="text-xs">{service.name} — {codesAvailable} disponibles actualmente</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Códigos (uno por línea)</Label>
              <Textarea className="text-sm font-mono min-h-[200px]" rows={10} placeholder={"CODIGO-001\nCODIGO-002\nCODIGO-003\n..."} value={newCodes} onChange={e => setNewCodes(e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-[10px] text-muted-foreground">{newCodes.split('\n').filter(c => c.trim()).length} códigos listos</span>
              <span className="text-[10px] text-muted-foreground">Stock después: {codesAvailable + newCodes.split('\n').filter(c => c.trim()).length}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAdd}><Upload className="w-3.5 h-3.5 mr-1" /> Agregar códigos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
