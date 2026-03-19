import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, Globe, Mail, Save, Palette, Crown, Lock, Tag, Code, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { companies, CURRENT_COMPANY_ID } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

export default function CompanySettings() {
  const { currentCompanyPlan, setCurrentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);

  const handleSave = () => {
    toast.success("Configuración guardada correctamente");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Administra tu empresa y plan</p>
        </div>

        {/* Plan info */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tu plan actual</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="text-sm">{currentCompanyPlan === 'freemium' ? 'Freemium' : currentCompanyPlan === 'premium' ? 'Premium — €100/mes' : 'Enterprise — €300/mes'}</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {currentCompanyPlan === 'freemium' && 'Máximo 5 gigs · Fee 15% por venta · Códigos manuales'}
                {currentCompanyPlan === 'premium' && 'Servicios ilimitados · Sin fee · Cupones · Chat · Códigos manuales'}
                {currentCompanyPlan === 'enterprise' && 'Todo Premium + Dominio propio · Marca blanca · API · Códigos automáticos'}
              </p>
            </div>
            {currentCompanyPlan !== 'enterprise' && (
              <Button size="sm" onClick={() => setCurrentCompanyPlan(currentCompanyPlan === 'freemium' ? 'premium' : 'enterprise')}>
                Mejorar plan
              </Button>
            )}
          </div>
        </div>

        {/* Personalización de marca */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Personalización de marca</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Personaliza cómo ven los vendedores tu plataforma. Sube tu logo y elige tus colores corporativos.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo de la empresa</Label>
              <Input type="file" accept="image/*" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Color principal</Label>
              <div className="flex gap-2">
                <Input type="color" defaultValue={company?.primaryColor || '#7c3aed'} className="w-12 h-9 p-1" />
                <Input defaultValue={company?.primaryColor || '#7c3aed'} className="h-9 text-sm font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color secundario</Label>
              <div className="flex gap-2">
                <Input type="color" defaultValue={company?.secondaryColor || '#a78bfa'} className="w-12 h-9 p-1" />
                <Input defaultValue={company?.secondaryColor || '#a78bfa'} className="h-9 text-sm font-mono" />
              </div>
            </div>
          </div>
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
              <Input defaultValue={company?.industry} />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Select defaultValue={company?.country.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="colombia">Colombia</SelectItem>
                  <SelectItem value="méxico">México</SelectItem>
                  <SelectItem value="argentina">Argentina</SelectItem>
                  <SelectItem value="chile">Chile</SelectItem>
                  <SelectItem value="españa">España</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Contacto</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue={company?.contactEmail} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input defaultValue={company?.contactPhone} />
            </div>
          </div>
        </div>

        {/* Premium+ features */}
        {currentCompanyPlan !== 'freemium' && (
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Cupones de descuento</h3>
              <Badge variant="outline" className="text-[9px]">Premium+</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Crea cupones que tus vendedores pueden aplicar al registrar ventas.</p>
            <Button size="sm" variant="outline" onClick={() => toast.info("Funcionalidad de demo")}>
              <Tag className="w-3.5 h-3.5 mr-1" /> Crear cupón
            </Button>
          </div>
        )}

        {/* Enterprise features */}
        {currentCompanyPlan === 'enterprise' && (
          <>
            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Dominio personalizado</h3>
                <Badge variant="outline" className="text-[9px]">Enterprise</Badge>
              </div>
              <div className="space-y-2">
                <Label>Tu dominio</Label>
                <Input defaultValue={company?.customDomain || 'ventas.tuempresa.com'} className="font-mono" />
                <p className="text-xs text-muted-foreground">Configura un CNAME apuntando a app.mensualista.com</p>
              </div>
            </div>

            <div className="card-premium p-6">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Integraciones API</h3>
                <Badge variant="outline" className="text-[9px]">Enterprise</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Conecta tu sistema para activación automática de códigos de gigs digitales.
              </p>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input defaultValue="mk_live_****************************" readOnly className="font-mono text-xs" />
              </div>
            </div>
          </>
        )}

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
