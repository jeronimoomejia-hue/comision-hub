import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Percent, Clock, Globe, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

export default function AdminSettings() {
  const { resetDemoData } = useDemo();

  const handleReset = () => {
    resetDemoData();
    toast.success("Datos de demo reiniciados");
  };

  const handleSave = () => {
    toast.success("Configuración guardada");
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuración global</h1>

        {/* Comisiones */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Motor de comisiones</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Take rate Mensualista (%)</Label>
              <Input type="number" defaultValue="8" min="0" max="100" />
            </div>
            <div className="space-y-2">
              <Label>Días para liberar comisión</Label>
              <Input type="number" defaultValue="14" min="1" max="60" />
            </div>
            <div className="space-y-2">
              <Label>Mínimo para retiro (USD)</Label>
              <Input type="number" defaultValue="50" min="1" />
            </div>
          </div>
        </div>

        {/* Reglas */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Reglas de liberación</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Liberar después de</Label>
              <Select defaultValue="payment_confirmed">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale_approved">Venta aprobada</SelectItem>
                  <SelectItem value="payment_confirmed">Pago confirmado</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Periodo de gracia (días)</Label>
              <Input type="number" defaultValue="7" />
            </div>
          </div>
        </div>

        {/* Globales */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Configuración general</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moneda por defecto</Label>
              <Select defaultValue="usd">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="mxn">MXN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp soporte</Label>
              <Input defaultValue="+52 55 1234 5678" />
            </div>
          </div>
        </div>

        {/* Demo */}
        <div className="card-premium p-6 border-dashed border-2 border-warning/50 bg-warning/5">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">Modo Demo</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Reinicia todos los datos a sus valores iniciales para una nueva demostración.
          </p>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar datos demo
          </Button>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar configuración
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
