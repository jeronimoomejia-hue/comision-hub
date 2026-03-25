import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User, CreditCard, Shield, Bell, LogOut, ChevronRight
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VendorProfile() {
  const { trainingProgress, services, sales, commissions, currentVendorId } = useDemo();

  const [vendorData, setVendorData] = useState({
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    whatsapp: "+57 300 123 4567",
    city: "Bogotá",
    country: "Colombia",
    vendorId: currentVendorId,
    bank: "bancolombia",
    accountType: "ahorros",
    accountNumber: "****5678",
    documentType: "CC",
    documentNumber: "1234567890",
    accountHolder: "Juan Pérez",
    whatsappNotifications: true,
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
             c.status === 'COMPLETED';
    })
    .reduce((sum, c) => sum + c.amountCOP, 0);

  const handleSave = (section: string) => {
    toast.success(`${section} actualizado`);
  };

  const handleLogout = () => {
    toast.info("Cerrando sesión...");
    setTimeout(() => { window.location.href = '/'; }, 1000);
  };

  return (
    <VendorTabLayout>
      <div className="max-w-lg mx-auto space-y-8 pb-8">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-3xl font-semibold text-primary">{vendorData.name[0]}</span>
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">{vendorData.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{vendorData.email}</p>
          <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">{vendorData.vendorId}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Entrenamientos", value: completedTrainings },
            { label: "Productos", value: activeServices },
            { label: "Ventas", value: salesThisMonth },
            { label: "Comisiones", value: formatCOP(commissionsThisMonth) },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-muted/30 p-3 text-center">
              <p className="text-base font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Personal info */}
        <Card title="Información personal">
          <Field label="Nombre completo">
            <Input
              value={vendorData.name}
              onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
              className="h-9 text-sm rounded-xl bg-muted/20 border-border/40"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={vendorData.email}
              onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
              className="h-9 text-sm rounded-xl bg-muted/20 border-border/40"
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              value={vendorData.whatsapp}
              onChange={(e) => setVendorData({ ...vendorData, whatsapp: e.target.value })}
              className="h-9 text-sm rounded-xl bg-muted/20 border-border/40"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad">
              <Input
                value={vendorData.city}
                onChange={(e) => setVendorData({ ...vendorData, city: e.target.value })}
                className="h-9 text-sm rounded-xl bg-muted/20 border-border/40"
              />
            </Field>
            <Field label="País">
              <Input value={vendorData.country} disabled className="h-9 text-sm rounded-xl bg-muted/20 border-border/40" />
            </Field>
          </div>
          <div className="flex justify-end pt-1">
            <Button size="sm" className="rounded-full h-8 px-5 text-[11px] font-semibold" onClick={() => handleSave('Datos personales')}>
              Guardar
            </Button>
          </div>
        </Card>

        {/* Payment */}
        <Card title="Datos de pago">
          <p className="text-[11px] text-muted-foreground leading-relaxed -mt-1 mb-1">
            Los pagos se realizan por transferencia automática cada semana.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Banco">
              <Select value={vendorData.bank} onValueChange={(v) => setVendorData({ ...vendorData, bank: v })}>
                <SelectTrigger className="h-9 text-sm rounded-xl bg-muted/20 border-border/40">
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
            </Field>
            <Field label="Tipo de cuenta">
              <Select value={vendorData.accountType} onValueChange={(v) => setVendorData({ ...vendorData, accountType: v })}>
                <SelectTrigger className="h-9 text-sm rounded-xl bg-muted/20 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ahorros">Ahorros</SelectItem>
                  <SelectItem value="corriente">Corriente</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Número de cuenta">
            <Input
              value={vendorData.accountNumber}
              onChange={(e) => setVendorData({ ...vendorData, accountNumber: e.target.value })}
              className="h-9 text-sm font-mono rounded-xl bg-muted/20 border-border/40"
            />
          </Field>
          <Field label="Titular">
            <Input
              value={vendorData.accountHolder}
              onChange={(e) => setVendorData({ ...vendorData, accountHolder: e.target.value })}
              className="h-9 text-sm rounded-xl bg-muted/20 border-border/40"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo documento">
              <Select value={vendorData.documentType} onValueChange={(v) => setVendorData({ ...vendorData, documentType: v })}>
                <SelectTrigger className="h-9 text-sm rounded-xl bg-muted/20 border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">C.C.</SelectItem>
                  <SelectItem value="CE">C.E.</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Número">
              <Input
                value={vendorData.documentNumber}
                onChange={(e) => setVendorData({ ...vendorData, documentNumber: e.target.value })}
                className="h-9 text-sm font-mono rounded-xl bg-muted/20 border-border/40"
              />
            </Field>
          </div>
          <div className="flex justify-end pt-1">
            <Button size="sm" className="rounded-full h-8 px-5 text-[11px] font-semibold" onClick={() => handleSave('Datos de pago')}>
              Guardar
            </Button>
          </div>
        </Card>

        {/* Preferences */}
        <Card title="Preferencias">
          <Row
            label="Notificaciones WhatsApp"
            sub="Alertas de ventas y pagos"
            right={
              <Switch
                checked={vendorData.whatsappNotifications}
                onCheckedChange={(checked) => setVendorData({ ...vendorData, whatsappNotifications: checked })}
              />
            }
          />
          <Row
            label="Zona horaria"
            sub="Bogotá (UTC-5)"
            right={<span className="text-[11px] text-muted-foreground">Colombia</span>}
            last
          />
        </Card>

        {/* Security */}
        <Card title="Seguridad">
          <Row
            label="Cambiar contraseña"
            sub="Actualiza tu contraseña de acceso"
            right={
              <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[11px] font-medium" onClick={() => toast.info("Funcionalidad de demo")}>
                Cambiar
              </Button>
            }
          />
          <Row
            label="Cerrar sesión"
            sub="Salir de tu cuenta"
            right={
              <Button variant="ghost" size="sm" className="rounded-full h-8 px-4 text-[11px] font-medium text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Salir
              </Button>
            }
            last
          />
        </Card>
      </div>
    </VendorTabLayout>
  );
}

/* ── Helper components ── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/30">
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5 space-y-3.5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, sub, right, last }: { label: string; sub: string; right: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-3", !last && "border-b border-border/20")}>
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
      {right}
    </div>
  );
}
