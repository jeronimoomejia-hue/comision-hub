import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Crown, Building2, Lock, Tag, Globe, Code, Palette, Mail, Save, Settings, CheckCircle, Zap, StickyNote, MapPin, Phone, Instagram, Facebook, ExternalLink, MessageCircle, FileText, Upload, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { companies, CURRENT_COMPANY_ID, type CompanyPlan } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";

const planDetails: Record<CompanyPlan, { label: string; price: string; icon: typeof Zap; features: string[] }> = {
  freemium: { label: "Freemium", price: "Gratis", icon: Zap, features: ['Máximo 5 productos', 'Fee 15% por venta', 'Códigos manuales'] },
  premium: { label: "Premium", price: "€100/mes", icon: Crown, features: ['Productos ilimitados', 'Sin fee de plataforma', 'Cupones de descuento', 'Chat con vendedores'] },
  enterprise: { label: "Enterprise", price: "€300/mes", icon: Building2, features: ['Todo Premium', 'Dominio propio + marca blanca', 'Integración API', 'Códigos automáticos'] },
};

export default function CompanySettings() {
  const { currentCompanyPlan, setCurrentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const plan = planDetails[currentCompanyPlan];

  const [gig, setGig] = useState({
    description: company?.industry ? `Somos una empresa líder en ${company.industry.toLowerCase()} con presencia en ${company?.country}. Ofrecemos soluciones innovadoras para empresas y profesionales.` : '',
    preferredChannel: 'whatsapp',
    whatsapp: company?.contactPhone || '',
    instagram: '',
    facebook: '',
    website: '',
    address: '',
    supportHours: 'Lun-Vie 8:00-18:00',
    slaResponse: '24 horas hábiles',
  });

  const updateGig = (key: string, value: string) => setGig(prev => ({ ...prev, [key]: value }));

  const handleSave = () => toast.success("Configuración guardada");

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tu plan, perfil público y datos de empresa</p>
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

        {/* Company Gig — what vendors see */}
        <Section title="Personalización de marca" icon={Palette}>
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-3">
              <p className="text-xs text-foreground font-medium">Perfil público de tu empresa</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Esta información es lo que los vendedores ven cuando visitan tu empresa en su panel</p>
            </div>

            {/* Cover image upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Imagen de portada</label>
              <div
                className="relative rounded-xl border border-dashed border-border bg-muted/20 h-32 flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors overflow-hidden"
                onClick={() => toast.success("Selector de imagen abierto (demo)")}
              >
                <div className="text-center">
                  <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-foreground">Subir imagen</p>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG hasta 5MB · Recomendado: 1200×400</p>
                </div>
              </div>
            </div>

            <FieldRow label="Descripción de la empresa">
              <Textarea className="text-sm" rows={3} placeholder="Describe tu empresa, qué ofrecen y por qué deberían vender tus productos..." value={gig.description} onChange={e => updateGig('description', e.target.value)} />
            </FieldRow>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Canal de comunicación preferido</label>
              <Select value={gig.preferredChannel} onValueChange={v => updateGig('preferredChannel', v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <span className="flex items-center gap-1.5"><MessageCircle className="w-3 h-3" /> WhatsApp</span>
                  </SelectItem>
                  <SelectItem value="email">
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</span>
                  </SelectItem>
                  <SelectItem value="phone">
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> Teléfono</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium pt-2">Redes sociales y presencia</p>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Instagram">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input className="h-9 text-sm" placeholder="@tuempresa" value={gig.instagram} onChange={e => updateGig('instagram', e.target.value)} />
                </div>
              </FieldRow>
              <FieldRow label="Facebook">
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input className="h-9 text-sm" placeholder="facebook.com/tuempresa" value={gig.facebook} onChange={e => updateGig('facebook', e.target.value)} />
                </div>
              </FieldRow>
            </div>

            <FieldRow label="Sitio web">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input className="h-9 text-sm" placeholder="https://tuempresa.com" value={gig.website} onChange={e => updateGig('website', e.target.value)} />
              </div>
            </FieldRow>

            <FieldRow label="Dirección física">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input className="h-9 text-sm" placeholder="Calle 100 #15-20, Bogotá" value={gig.address} onChange={e => updateGig('address', e.target.value)} />
              </div>
            </FieldRow>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Horario de atención">
                <Input className="h-9 text-sm" placeholder="Lun-Vie 8:00-18:00" value={gig.supportHours} onChange={e => updateGig('supportHours', e.target.value)} />
              </FieldRow>
              <FieldRow label="Tiempo de respuesta">
                <Input className="h-9 text-sm" placeholder="24 horas hábiles" value={gig.slaResponse} onChange={e => updateGig('slaResponse', e.target.value)} />
              </FieldRow>
            </div>
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
          <Section title="Integraciones API" icon={Code}>
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">Conecta tu sistema para activación automática de códigos.</p>
              <FieldRow label="API Key">
                <Input defaultValue="mk_live_****************************" readOnly className="h-9 text-xs font-mono" />
              </FieldRow>
            </div>
          </Section>
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
