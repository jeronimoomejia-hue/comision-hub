import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, Globe, Mail, Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companies, CURRENT_COMPANY_ID } from "@/data/mockData";
import { toast } from "sonner";

export default function CompanySettings() {
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);

  const handleSave = () => {
    toast.success("Configuración guardada correctamente");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Administra los datos de tu empresa</p>
        </div>

        {/* Datos de empresa */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Información de la empresa</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la empresa</Label>
              <Input defaultValue={company?.name} />
            </div>
            <div className="space-y-2">
              <Label>Industria</Label>
              <Select defaultValue={company?.industry.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="ciberseguridad">Ciberseguridad</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="hr">Recursos Humanos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Select defaultValue={company?.country.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="méxico">México</SelectItem>
                  <SelectItem value="colombia">Colombia</SelectItem>
                  <SelectItem value="argentina">Argentina</SelectItem>
                  <SelectItem value="chile">Chile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zona horaria</Label>
              <Select defaultValue="america_mexico">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="america_mexico">América/Ciudad de México</SelectItem>
                  <SelectItem value="america_bogota">América/Bogotá</SelectItem>
                  <SelectItem value="america_santiago">América/Santiago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Información de contacto</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email de facturación</Label>
              <Input type="email" defaultValue={company?.contactEmail} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input defaultValue={company?.contactPhone} />
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Preferencias</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moneda predeterminada</Label>
              <Select defaultValue="usd">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - Dólar estadounidense</SelectItem>
                  <SelectItem value="mxn">MXN - Peso mexicano</SelectItem>
                  <SelectItem value="cop">COP - Peso colombiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select defaultValue="es">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Integraciones placeholder */}
        <div className="card-premium p-6">
          <h3 className="font-semibold mb-2">Integraciones</h3>
          <p className="text-sm text-muted-foreground">Próximamente: Conecta con Stripe, HubSpot, Slack y más.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
