import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Globe, CheckCircle, AlertCircle, Copy, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { companies, CURRENT_COMPANY_ID } from "@/data/mockData";
import { toast } from "sonner";

export default function CompanyDomain() {
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [domain, setDomain] = useState(company?.customDomain || 'ventas.tuempresa.com');
  const [isVerified, setIsVerified] = useState(!!company?.customDomain);

  const handleVerify = () => {
    setTimeout(() => {
      setIsVerified(true);
      toast.success("Dominio verificado correctamente");
    }, 1500);
    toast.info("Verificando DNS...");
  };

  const handleSave = () => {
    toast.success("Dominio guardado");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold">Dominio personalizado</h1>
          <p className="text-sm text-muted-foreground">Configura un dominio propio para tu panel de vendedores</p>
        </div>

        {/* Current domain */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tu dominio</h3>
            {isVerified && <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50 gap-1"><CheckCircle className="w-3 h-3" /> Verificado</Badge>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Dominio personalizado</Label>
            <Input
              value={domain}
              onChange={e => { setDomain(e.target.value); setIsVerified(false); }}
              className="font-mono"
              placeholder="ventas.tuempresa.com"
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-700">Configuración DNS requerida</p>
            </div>
            <p className="text-[10px] text-amber-600">
              Agrega un registro CNAME apuntando <span className="font-mono font-bold">{domain}</span> a <span className="font-mono font-bold">app.mensualista.com</span>
            </p>
            <div className="bg-white rounded-md p-2 border border-amber-200">
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><p className="text-muted-foreground">Tipo</p><p className="font-mono font-bold">CNAME</p></div>
                <div><p className="text-muted-foreground">Nombre</p><p className="font-mono font-bold">{domain.split('.')[0]}</p></div>
                <div><p className="text-muted-foreground">Valor</p><p className="font-mono font-bold">app.mensualista.com</p></div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleVerify} disabled={isVerified}>
              {isVerified ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Verificado</> : 'Verificar DNS'}
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-3.5 h-3.5 mr-1" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">Vista previa</h3>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Tus vendedores accederán desde:</p>
            <p className="text-lg font-mono font-bold text-primary">https://{domain}</p>
            <p className="text-[10px] text-muted-foreground mt-2">El panel mostrará tu logo, colores y marca</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
