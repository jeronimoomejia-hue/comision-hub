import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, 
  CreditCard, 
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Save,
  Globe
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, companies, companyPayments } from "@/data/mockData";
import { toast } from "sonner";

export default function CompanyProfile() {
  const { sales, subscriptions, currentCompanyId } = useDemo();
  
  const company = companies.find(c => c.id === currentCompanyId);
  
  // Mock editable company data
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
    
    // Payment data
    bank: "bancolombia",
    accountType: "corriente",
    accountNumber: "****9012",
    accountHolder: "Poliza.ai S.A.S",
    billingEmail: "facturacion@poliza.ai"
  });

  // Mock team members
  const teamMembers = [
    { name: "María González", email: "maria@poliza.ai", role: "Administrador" },
    { name: "Carlos Rodríguez", email: "carlos@poliza.ai", role: "Finanzas" },
    { name: "Ana Martínez", email: "ana@poliza.ai", role: "Operaciones" },
    { name: "Luis Pérez", email: "luis@poliza.ai", role: "Soporte" }
  ];

  // Calculate stats
  const thisMonth = new Date();
  const companySales = sales.filter(s => s.companyId === currentCompanyId);
  const salesThisMonth = companySales.filter(s => {
    const saleDate = new Date(s.createdAt);
    return saleDate.getMonth() === thisMonth.getMonth() && 
           saleDate.getFullYear() === thisMonth.getFullYear();
  });

  const moneySoldThisMonth = salesThisMonth
    .filter(s => s.status !== 'REFUNDED')
    .reduce((sum, s) => sum + s.amountCOP, 0);

  const activeSubscriptions = subscriptions.filter(
    s => companySales.some(sale => sale.id === s.saleId) && s.status === 'active'
  ).length;

  const companyPaymentsThisMonth = companyPayments
    .filter(p => p.companyId === currentCompanyId && p.status === 'enviado')
    .filter(p => {
      const date = new Date(p.scheduledDate);
      return date.getMonth() === thisMonth.getMonth() && 
             date.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((sum, p) => sum + p.amountCOP, 0);

  const handleSave = (section: string) => {
    toast.success(`${section} guardado correctamente`);
  };

  return (
    <DashboardLayout role="company" userName={companyData.contactName}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mi Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la información de tu empresa y configuración de pagos
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Información de la empresa
                </CardTitle>
                <CardDescription>Datos de tu empresa en Mensualista</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la empresa</Label>
                    <Input 
                      id="companyName" 
                      value={companyData.name}
                      onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT</Label>
                    <Input 
                      id="nit" 
                      value={companyData.nit}
                      onChange={(e) => setCompanyData({...companyData, nit: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industria</Label>
                    <Input 
                      id="industry" 
                      value={companyData.industry}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Página web</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="website" 
                        value={companyData.website}
                        onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input 
                      id="city" 
                      value={companyData.city}
                      onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" value={companyData.country} disabled />
                  </div>
                </div>

                <Separator />

                <h4 className="font-medium">Contacto principal</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nombre</Label>
                    <Input 
                      id="contactName" 
                      value={companyData.contactName}
                      onChange={(e) => setCompanyData({...companyData, contactName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={companyData.contactEmail}
                      onChange={(e) => setCompanyData({...companyData, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactWhatsApp">WhatsApp</Label>
                    <Input 
                      id="contactWhatsApp" 
                      value={companyData.contactWhatsApp}
                      onChange={(e) => setCompanyData({...companyData, contactWhatsApp: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge variant={companyData.status === 'active' ? 'default' : 'secondary'}>
                      {companyData.status === 'active' ? 'Activa' : 'Pausada'}
                    </Badge>
                  </div>
                  <Button onClick={() => handleSave('Información de empresa')}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Datos de pago
                </CardTitle>
                <CardDescription>
                  Cuenta bancaria para recibir los pagos automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Nota:</strong> Mensualista hace transferencias automáticas semanales. 
                    No hay retiros manuales.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Banco</Label>
                    <Select value={companyData.bank} onValueChange={(v) => setCompanyData({...companyData, bank: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona banco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bancolombia">Bancolombia</SelectItem>
                        <SelectItem value="davivienda">Davivienda</SelectItem>
                        <SelectItem value="bbva">BBVA</SelectItem>
                        <SelectItem value="banco_bogota">Banco de Bogotá</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de cuenta</Label>
                    <Select value={companyData.accountType} onValueChange={(v) => setCompanyData({...companyData, accountType: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ahorros">Ahorros</SelectItem>
                        <SelectItem value="corriente">Corriente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Número de cuenta</Label>
                    <Input 
                      id="accountNumber" 
                      value={companyData.accountNumber}
                      onChange={(e) => setCompanyData({...companyData, accountNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Razón social / Titular</Label>
                    <Input 
                      id="accountHolder" 
                      value={companyData.accountHolder}
                      onChange={(e) => setCompanyData({...companyData, accountHolder: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Email de facturación</Label>
                  <Input 
                    id="billingEmail" 
                    type="email"
                    value={companyData.billingEmail}
                    onChange={(e) => setCompanyData({...companyData, billingEmail: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Solo para notificaciones, no para cobros</p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={() => handleSave('Datos de pago')}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Equipo
                </CardTitle>
                <CardDescription>Usuarios con acceso al panel de empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del mes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatCOP(moneySoldThisMonth)}</p>
                    <p className="text-sm text-muted-foreground">Dinero vendido</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{salesThisMonth.length}</p>
                    <p className="text-sm text-muted-foreground">Ventas del mes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeSubscriptions}</p>
                    <p className="text-sm text-muted-foreground">Suscripciones activas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatCOP(companyPaymentsThisMonth)}</p>
                    <p className="text-sm text-muted-foreground">Pagos recibidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
