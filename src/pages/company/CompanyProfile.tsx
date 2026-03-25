import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, CreditCard, Users, TrendingUp, DollarSign, ShoppingCart,
  Save, Globe, User
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, companies, companyPayments } from "@/data/mockData";
import { toast } from "sonner";

export default function CompanyProfile() {
  const { sales, subscriptions, currentCompanyId } = useDemo();
  const company = companies.find(c => c.id === currentCompanyId);
  
  const [companyData, setCompanyData] = useState({
    name: company?.name || "Poliza.ai",
    nit: "900.123.456-7",
    industry: company?.industry || "IA para Seguros",
    city: "Bogotá",
    country: "Colombia",
    website: "https://poliza.ai",
    contactName: "María González",
    contactEmail: company?.contactEmail || "maria@poliza.ai",
    contactWhatsApp: company?.contactPhone || "+57 300 123 4567",
    status: company?.status || "active",
    bank: "bancolombia",
    accountType: "corriente",
    accountNumber: "****9012",
    accountHolder: "Poliza.ai S.A.S",
    billingEmail: "facturacion@poliza.ai"
  });

  const teamMembers = [
    { name: "María González", email: "maria@poliza.ai", role: "Admin" },
    { name: "Carlos Rodríguez", email: "carlos@poliza.ai", role: "Finanzas" },
    { name: "Ana Martínez", email: "ana@poliza.ai", role: "Operaciones" },
  ];

  const thisMonth = new Date();
  const companySales = sales.filter(s => s.companyId === currentCompanyId);
  const salesThisMonth = companySales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
  });
  const moneySoldThisMonth = salesThisMonth.filter(s => s.status !== 'REFUNDED').reduce((sum, s) => sum + s.amountCOP, 0);
  const activeSubscriptions = subscriptions.filter(
    s => companySales.some(sale => sale.id === s.saleId) && s.status === 'active'
  ).length;
  const paymentsThisMonth = companyPayments
    .filter(p => p.companyId === currentCompanyId && p.status === 'enviado')
    .filter(p => { const d = new Date(p.scheduledDate); return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear(); })
    .reduce((sum, p) => sum + p.amountCOP, 0);

  const handleSave = (section: string) => toast.success(`${section} actualizado`);

  const stats = [
    { icon: DollarSign, label: "Vendido", value: formatCOP(moneySoldThisMonth) },
    { icon: ShoppingCart, label: "Ventas", value: salesThisMonth.length },
    { icon: TrendingUp, label: "Suscripciones", value: activeSubscriptions },
    { icon: CreditCard, label: "Cobrado", value: formatCOP(paymentsThisMonth) },
  ];

  return (
    <DashboardLayout role="company" userName={companyData.contactName}>
      <div className="space-y-8 max-w-2xl">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: company?.primaryColor || 'hsl(var(--primary))' }}>
            <span className="text-2xl font-bold text-white">{companyData.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{companyData.name}</h1>
            <p className="text-sm text-muted-foreground">{companyData.industry}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Activa</Badge>
              <span className="text-[10px] text-muted-foreground">{companyData.city}, {companyData.country}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3.5 text-center">
              <stat.icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Company info */}
        <Section title="Información de la empresa" icon={Building2}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Nombre">
                <Input value={companyData.name} onChange={e => setCompanyData({...companyData, name: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="NIT">
                <Input value={companyData.nit} onChange={e => setCompanyData({...companyData, nit: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Industria">
                <Input value={companyData.industry} disabled className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="Sitio web">
                <Input value={companyData.website} onChange={e => setCompanyData({...companyData, website: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Ciudad">
                <Input value={companyData.city} onChange={e => setCompanyData({...companyData, city: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="País">
                <Input value={companyData.country} disabled className="h-9 text-sm" />
              </FieldRow>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSave('Empresa')}><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</Button>
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contacto principal" icon={User}>
          <div className="space-y-4">
            <FieldRow label="Nombre">
              <Input value={companyData.contactName} onChange={e => setCompanyData({...companyData, contactName: e.target.value})} className="h-9 text-sm" />
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Email">
                <Input value={companyData.contactEmail} onChange={e => setCompanyData({...companyData, contactEmail: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
              <FieldRow label="WhatsApp">
                <Input value={companyData.contactWhatsApp} onChange={e => setCompanyData({...companyData, contactWhatsApp: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSave('Contacto')}><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</Button>
            </div>
          </div>
        </Section>

        {/* Payment data */}
        <Section title="Datos de pago" icon={CreditCard}>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Las transferencias son <strong className="text-foreground">automáticas semanales</strong>. No necesitas solicitar retiros.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Banco">
                <Select value={companyData.bank} onValueChange={v => setCompanyData({...companyData, bank: v})}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bancolombia">Bancolombia</SelectItem>
                    <SelectItem value="davivienda">Davivienda</SelectItem>
                    <SelectItem value="bbva">BBVA</SelectItem>
                    <SelectItem value="banco_bogota">Banco de Bogotá</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de cuenta">
                <Select value={companyData.accountType} onValueChange={v => setCompanyData({...companyData, accountType: v})}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahorros">Ahorros</SelectItem>
                    <SelectItem value="corriente">Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Número de cuenta">
                <Input value={companyData.accountNumber} onChange={e => setCompanyData({...companyData, accountNumber: e.target.value})} className="h-9 text-sm font-mono" />
              </FieldRow>
              <FieldRow label="Razón social">
                <Input value={companyData.accountHolder} onChange={e => setCompanyData({...companyData, accountHolder: e.target.value})} className="h-9 text-sm" />
              </FieldRow>
            </div>
            <FieldRow label="Email de facturación">
              <Input value={companyData.billingEmail} onChange={e => setCompanyData({...companyData, billingEmail: e.target.value})} className="h-9 text-sm" />
            </FieldRow>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSave('Datos de pago')}><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</Button>
            </div>
          </div>
        </Section>

        {/* Team */}
        <Section title="Equipo" icon={Users}>
          <div className="space-y-0">
            {teamMembers.map((member, i) => (
              <div key={i} className={`flex items-center justify-between py-3 ${i < teamMembers.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{member.role}</Badge>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Building2; children: React.ReactNode }) {
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
