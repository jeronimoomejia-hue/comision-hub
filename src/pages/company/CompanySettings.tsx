import DashboardLayout from "@/components/layout/DashboardLayout";
import { Crown, Building2, Lock, Tag, Globe, Code, Palette, Mail, Save, Settings, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { companies, CURRENT_COMPANY_ID, type CompanyPlan } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

const planDetails: Record<CompanyPlan, { label: string; price: string; icon: typeof Zap; features: string[] }> = {
  freemium: { label: "Freemium", price: "Gratis", icon: Zap, features: ['Máximo 5 servicios', 'Fee 15% por venta', 'Códigos manuales'] },
  premium: { label: "Premium", price: "€100/mes", icon: Crown, features: ['Servicios ilimitados', 'Sin fee de plataforma', 'Cupones de descuento', 'Chat con vendedores'] },
  enterprise: { label: "Enterprise", price: "€300/mes", icon: Building2, features: ['Todo Premium', 'Dominio propio + marca blanca', 'Integración API', 'Códigos automáticos'] },
};

export default function CompanySettings() {
  const { currentCompanyPlan, setCurrentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const plan = planDetails[currentCompanyPlan];

  const handleSave = () => toast.success("Configuración guardada");

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tu plan y personalización de marca</p>
        </div>

        {/* Current plan */}
        <Section title="Tu plan" icon={plan.icon}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-foreground">{plan.label}</span>
                  <Badge variant="outline" className="text-[10px]">{plan.price}</Badge>
                </div>
                <div className="space-y-1 mt-2">
                  {plan.features.map((f, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </p>
                  ))}
                </div>
              </div>
              {currentCompanyPlan !== 'enterprise' && (
                <Button size="sm" className="text-xs" onClick={() => setCurrentCompanyPlan(currentCompanyPlan === 'freemium' ? 'premium' : 'enterprise')}>
                  Mejorar plan
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* Brand customization */}
        <Section title="Personalización de marca" icon={Palette}>
          <div className="space-y-4">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Personaliza cómo ven los vendedores tu plataforma. Logo y colores corporativos.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Logo de la empresa">
                <Input type="file" accept="image/*" className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Color principal">
                <div className="flex gap-2">
                  <Input type="color" defaultValue={company?.primaryColor || '#7c3aed'} className="w-10 h-9 p-1" />
                  <Input defaultValue={company?.primaryColor || '#7c3aed'} className="h-9 text-sm font-mono flex-1" />
                </div>
              </FieldRow>
            </div>
            <FieldRow label="Color secundario">
              <div className="flex gap-2 max-w-xs">
                <Input type="color" defaultValue={company?.secondaryColor || '#a78bfa'} className="w-10 h-9 p-1" />
                <Input defaultValue={company?.secondaryColor || '#a78bfa'} className="h-9 text-sm font-mono flex-1" />
              </div>
            </FieldRow>
          </div>
        </Section>

        {/* Company info */}
        <Section title="Datos de la empresa" icon={Building2}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Nombre">
                <Input defaultValue={company?.name} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Industria">
                <Input defaultValue={company?.industry} className="h-9 text-sm" />
              </FieldRow>
            </div>
            <FieldRow label="País">
              <Select defaultValue={company?.country.toLowerCase()}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="colombia">Colombia</SelectItem>
                  <SelectItem value="méxico">México</SelectItem>
                  <SelectItem value="argentina">Argentina</SelectItem>
                  <SelectItem value="chile">Chile</SelectItem>
                  <SelectItem value="españa">España</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contacto" icon={Mail}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Email">
                <Input type="email" defaultValue={company?.contactEmail} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Teléfono">
                <Input defaultValue={company?.contactPhone} className="h-9 text-sm" />
              </FieldRow>
            </div>
          </div>
        </Section>

        {/* Premium+ features */}
        {currentCompanyPlan !== 'freemium' && (
          <Section title="Cupones de descuento" icon={Tag}>
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">Crea cupones que tus vendedores pueden aplicar al registrar ventas.</p>
              <Button size="sm" variant="outline" className="text-xs" asChild>
                <a href="/company/coupons"><Tag className="w-3 h-3 mr-1.5" />Ir a Cupones</a>
              </Button>
            </div>
          </Section>
        )}

        {/* Enterprise features */}
        {currentCompanyPlan === 'enterprise' && (
          <>
            <Section title="Dominio personalizado" icon={Globe}>
              <div className="space-y-3">
                <FieldRow label="Tu dominio">
                  <Input defaultValue={company?.customDomain || 'ventas.tuempresa.com'} className="h-9 text-sm font-mono" />
                </FieldRow>
                <p className="text-[10px] text-muted-foreground">Configura un CNAME apuntando a app.mensualista.com</p>
              </div>
            </Section>

            <Section title="Integraciones API" icon={Code}>
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">Conecta tu sistema para activación automática de códigos.</p>
                <FieldRow label="API Key">
                  <Input defaultValue="mk_live_****************************" readOnly className="h-9 text-xs font-mono" />
                </FieldRow>
              </div>
            </Section>
          </>
        )}

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1.5" />Guardar cambios</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Settings; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
