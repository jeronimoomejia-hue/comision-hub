import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, CreditCard, Shield, Bell, BookOpen, Briefcase,
  TrendingUp, DollarSign, Save, LogOut, ChevronRight,
  MapPin, Mail, Phone, Building2
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP } from "@/data/mockData";
import { toast } from "sonner";

export default function VendorProfile() {
  const { trainingProgress, services, sales, commissions, currentVendorId } = useDemo();
  
  const [vendorData, setVendorData] = useState({
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    whatsapp: "+57 300 123 4567",
    city: "Bogotá",
    country: "Colombia",
    vendorId: currentVendorId,
    status: "active" as const,
    bank: "bancolombia",
    accountType: "ahorros",
    accountNumber: "****5678",
    documentType: "CC",
    documentNumber: "1234567890",
    accountHolder: "Juan Pérez",
    whatsappNotifications: true,
    timezone: "America/Bogota"
  });

  const completedTrainings = trainingProgress.filter(
    tp => tp.vendorId === currentVendorId && tp.status === 'declared_completed'
  ).length;
  
  const activeServices = services.filter(s => {
    const training = trainingProgress.find(
      tp => tp.vendorId === currentVendorId && tp.serviceId === s.id
    );
    return s.status === 'activo' && (!s.requiresTraining || training?.status === 'declared_completed');
  }).length;

  const thisMonth = new Date();
  const vendorSales = sales.filter(s => s.vendorId === currentVendorId);
  const salesThisMonth = vendorSales.filter(s => {
    const saleDate = new Date(s.createdAt);
    return saleDate.getMonth() === thisMonth.getMonth() && 
           saleDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  const vendorCommissions = commissions.filter(c => c.vendorId === currentVendorId);
  const commissionsThisMonth = vendorCommissions
    .filter(c => {
      const date = new Date(c.createdAt);
      return date.getMonth() === thisMonth.getMonth() && 
             date.getFullYear() === thisMonth.getFullYear() &&
             c.status === 'RELEASED';
    })
    .reduce((sum, c) => sum + c.amountCOP, 0);

  const handleSave = (section: string) => {
    toast.success(`${section} actualizado`);
  };

  const handleLogout = () => {
    toast.info("Cerrando sesión...");
    setTimeout(() => { window.location.href = '/'; }, 1000);
  };

  const stats = [
    { icon: BookOpen, label: "Capacitaciones", value: completedTrainings, color: "text-primary" },
    { icon: Briefcase, label: "Servicios activos", value: activeServices, color: "text-primary" },
    { icon: TrendingUp, label: "Ventas del mes", value: salesThisMonth, color: "text-primary" },
    { icon: DollarSign, label: "Comisiones del mes", value: formatCOP(commissionsThisMonth), color: "text-primary" },
  ];

  return (
    <VendorTabLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary">{vendorData.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{vendorData.name}</h1>
            <p className="text-sm text-muted-foreground">{vendorData.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                Activo
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">{vendorData.vendorId}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3.5 text-center">
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Personal info section */}
        <Section title="Información personal" icon={User}>
          <div className="space-y-4">
            <FieldRow label="Nombre completo">
              <Input 
                value={vendorData.name}
                onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                className="h-9 text-sm"
              />
            </FieldRow>
            <FieldRow label="Email">
              <Input 
                type="email"
                value={vendorData.email}
                onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                className="h-9 text-sm"
              />
            </FieldRow>
            <FieldRow label="WhatsApp">
              <Input 
                value={vendorData.whatsapp}
                onChange={(e) => setVendorData({...vendorData, whatsapp: e.target.value})}
                className="h-9 text-sm"
              />
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Ciudad">
                <Input 
                  value={vendorData.city}
                  onChange={(e) => setVendorData({...vendorData, city: e.target.value})}
                  className="h-9 text-sm"
                />
              </FieldRow>
              <FieldRow label="País">
                <Input value={vendorData.country} disabled className="h-9 text-sm" />
              </FieldRow>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSave('Datos personales')}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Guardar
              </Button>
            </div>
          </div>
        </Section>

        {/* Payment info */}
        <Section title="Datos de pago" icon={CreditCard}>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Los pagos se hacen por <strong className="text-foreground">transferencia automática</strong> cada semana. No necesitas solicitar retiros.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Banco">
                <Select value={vendorData.bank} onValueChange={(v) => setVendorData({...vendorData, bank: v})}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bancolombia">Bancolombia</SelectItem>
                    <SelectItem value="davivienda">Davivienda</SelectItem>
                    <SelectItem value="bbva">BBVA</SelectItem>
                    <SelectItem value="banco_bogota">Banco de Bogotá</SelectItem>
                    <SelectItem value="nequi">Nequi</SelectItem>
                    <SelectItem value="daviplata">Daviplata</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Tipo de cuenta">
                <Select value={vendorData.accountType} onValueChange={(v) => setVendorData({...vendorData, accountType: v})}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahorros">Ahorros</SelectItem>
                    <SelectItem value="corriente">Corriente</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>

            <FieldRow label="Número de cuenta">
              <Input 
                value={vendorData.accountNumber}
                onChange={(e) => setVendorData({...vendorData, accountNumber: e.target.value})}
                className="h-9 text-sm font-mono"
              />
            </FieldRow>
            <FieldRow label="Titular">
              <Input 
                value={vendorData.accountHolder}
                onChange={(e) => setVendorData({...vendorData, accountHolder: e.target.value})}
                className="h-9 text-sm"
              />
            </FieldRow>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Tipo documento">
                <Select value={vendorData.documentType} onValueChange={(v) => setVendorData({...vendorData, documentType: v})}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">C.C.</SelectItem>
                    <SelectItem value="CE">C.E.</SelectItem>
                    <SelectItem value="NIT">NIT</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Número">
                <Input 
                  value={vendorData.documentNumber}
                  onChange={(e) => setVendorData({...vendorData, documentNumber: e.target.value})}
                  className="h-9 text-sm font-mono"
                />
              </FieldRow>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSave('Datos de pago')}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Guardar
              </Button>
            </div>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferencias" icon={Bell}>
          <div className="space-y-0">
            <SettingRow
              label="Notificaciones WhatsApp"
              description="Alertas de ventas y pagos"
              action={
                <Switch 
                  checked={vendorData.whatsappNotifications}
                  onCheckedChange={(checked) => setVendorData({...vendorData, whatsappNotifications: checked})}
                />
              }
            />
            <SettingRow
              label="Zona horaria"
              description="Bogotá (UTC-5)"
              action={
                <Badge variant="outline" className="text-[10px]">Colombia</Badge>
              }
            />
          </div>
        </Section>

        {/* Security */}
        <Section title="Seguridad" icon={Shield}>
          <div className="space-y-0">
            <SettingRow
              label="Cambiar contraseña"
              description="Actualiza tu contraseña de acceso"
              action={
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.info("Funcionalidad de demo")}>
                  Cambiar
                </Button>
              }
            />
            <SettingRow
              label="Cerrar sesión"
              description="Salir de tu cuenta"
              action={
                <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Salir
                </Button>
              }
              noBorder
            />
          </div>
        </Section>
      </div>
    </VendorTabLayout>
  );
}

// --- Helper components ---

function Section({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">
        {children}
      </div>
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

function SettingRow({ label, description, action, noBorder }: { 
  label: string; description: string; action: React.ReactNode; noBorder?: boolean 
}) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${noBorder ? '' : 'border-b border-border/50'}`}>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
