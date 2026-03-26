import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Code, Copy, Eye, EyeOff, RefreshCw, CheckCircle, Webhook, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { companies, CURRENT_COMPANY_ID } from "@/data/mockData";
import { toast } from "sonner";

export default function CompanyApi() {
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.poliza.ai/webhooks/mensualista');
  const [webhookActive, setWebhookActive] = useState(true);

  const apiKey = 'mk_live_5B6FE0a4b2c8d9e1f3g5h7j9k2m4n6p8';

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API Key copiada");
  };

  const regenerateKey = () => {
    toast.success("Nueva API Key generada");
  };

  const saveWebhook = () => {
    toast.success("Webhook guardado");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold">Integraciones API</h1>
          <p className="text-sm text-muted-foreground">Conecta tu sistema para automatizar códigos de activación y procesos</p>
        </div>

        {/* API Key */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">API Key</h3>
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50 gap-1">
              <CheckCircle className="w-3 h-3" /> Activa
            </Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Tu clave de API</Label>
            <div className="flex gap-2">
              <Input
                value={showKey ? apiKey : apiKey.replace(/./g, '•').slice(0, 20) + apiKey.slice(-4)}
                readOnly
                className="font-mono text-xs flex-1"
              />
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10" onClick={copyKey}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button variant="outline" size="sm" className="text-xs" onClick={regenerateKey}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Regenerar clave
          </Button>
        </div>

        {/* Webhooks */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Webhooks</h3>
            </div>
            <Switch checked={webhookActive} onCheckedChange={setWebhookActive} />
          </div>

          <p className="text-xs text-muted-foreground">
            Recibe notificaciones en tu sistema cuando ocurre una venta. Mensualista enviará un POST con los datos de la venta para que generes el código de activación automáticamente.
          </p>

          <div className="space-y-2">
            <Label className="text-xs">URL del Webhook</Label>
            <Input
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="font-mono text-xs"
              placeholder="https://tu-api.com/webhooks/mensualista"
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium text-muted-foreground mb-2">Eventos que se envían:</p>
            <div className="space-y-1.5">
              {[
                { event: 'sale.created', desc: 'Nueva venta registrada' },
                { event: 'sale.released', desc: 'Venta liberada (fin tiempo de devolución)' },
                { event: 'sale.refunded', desc: 'Venta devuelta' },
                { event: 'vendor.joined', desc: 'Nuevo vendedor en la red' },
              ].map(e => (
                <div key={e.event} className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-[10px] font-mono text-primary">{e.event}</span>
                  <span className="text-[10px] text-muted-foreground">— {e.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <Button size="sm" onClick={saveWebhook}>
            Guardar webhook
          </Button>
        </div>

        {/* Docs */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">Ejemplo de integración</h3>
          <div className="rounded-lg bg-foreground text-background p-4 font-mono text-xs overflow-x-auto">
            <pre>{`// Webhook payload (sale.created)
{
  "event": "sale.created",
  "sale_id": "sale-123",
  "service_id": "service-001",
  "client_name": "María García",
  "client_email": "maria@email.com",
  "amount_cop": 179000,
  "vendor_id": "vendor-001",
  "timestamp": "2026-03-18T10:30:00Z"
}

// Tu API responde con el código:
{
  "activation_code": "POL-2026-ABC123",
  "expires_at": "2026-04-18"
}`}</pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
