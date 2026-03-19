import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTutorial from "@/components/PageTutorial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CreditCard, 
  Shield, 
  Bell,
  BookOpen,
  Briefcase,
  TrendingUp,
  DollarSign,
  Save,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP } from "@/data/mockData";
import { toast } from "sonner";

export default function VendorProfile() {
  const { trainingProgress, services, sales, commissions, currentVendorId } = useDemo();
  
  // Mock editable vendor data
  const [vendorData, setVendorData] = useState({
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    whatsapp: "+57 300 123 4567",
    city: "Bogotá",
    country: "Colombia",
    vendorId: currentVendorId,
    status: "active" as const,
    
    // Payment data
    bank: "bancolombia",
    accountType: "ahorros",
    accountNumber: "****5678",
    documentType: "CC",
    documentNumber: "1234567890",
    accountHolder: "Juan Pérez",
    
    // Preferences
    whatsappNotifications: true,
    timezone: "America/Bogota"
  });

  // Calculate stats
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
    toast.success(`${section} guardado correctamente`);
  };

  const handleLogout = () => {
    toast.info("Cerrando sesión...");
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <DashboardLayout role="vendor" userName={vendorData.name}>
      <div className="space-y-6">
        <PageTutorial
          pageId="vendor-profile"
          title="Mi Perfil"
          description="Actualiza tu información personal, datos de pago y preferencias de notificación."
          steps={[
            "Asegúrate de tener tus datos bancarios actualizados para recibir pagos automáticos",
            "Activa las notificaciones por WhatsApp para enterarte de cada venta"
          ]}
        />
        <div>
          <h1 className="text-xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu información personal y configuración de pagos
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Datos básicos
                </CardTitle>
                <CardDescription>Tu información personal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input 
                      id="name" 
                      value={vendorData.name}
                      onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={vendorData.email}
                      onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input 
                      id="whatsapp" 
                      value={vendorData.whatsapp}
                      onChange={(e) => setVendorData({...vendorData, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input 
                      id="city" 
                      value={vendorData.city}
                      onChange={(e) => setVendorData({...vendorData, city: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" value={vendorData.country} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>ID Vendedor</Label>
                    <Input value={vendorData.vendorId} disabled className="font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Estado de cuenta:</span>
                    <Badge variant={vendorData.status === 'active' ? 'default' : 'secondary'}>
                      {vendorData.status === 'active' ? 'Activo' : 'Pausado'}
                    </Badge>
                  </div>
                  <Button onClick={() => handleSave('Datos básicos')}>
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
                  Cuenta bancaria para recibir tus pagos automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Nota:</strong> Los pagos se hacen por transferencia automática cada semana. 
                    No necesitas solicitar retiros.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Banco</Label>
                    <Select value={vendorData.bank} onValueChange={(v) => setVendorData({...vendorData, bank: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona banco" />
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de cuenta</Label>
                    <Select value={vendorData.accountType} onValueChange={(v) => setVendorData({...vendorData, accountType: v})}>
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
                      value={vendorData.accountNumber}
                      onChange={(e) => setVendorData({...vendorData, accountNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Nombre del titular</Label>
                    <Input 
                      id="accountHolder" 
                      value={vendorData.accountHolder}
                      onChange={(e) => setVendorData({...vendorData, accountHolder: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Tipo de documento</Label>
                    <Select value={vendorData.documentType} onValueChange={(v) => setVendorData({...vendorData, documentType: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">Número de documento</Label>
                    <Input 
                      id="documentNumber" 
                      value={vendorData.documentNumber}
                      onChange={(e) => setVendorData({...vendorData, documentNumber: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={() => handleSave('Datos de pago')}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cambiar contraseña</p>
                    <p className="text-sm text-muted-foreground">Actualiza tu contraseña de acceso</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info("Funcionalidad de demo")}>
                    Cambiar
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cerrar sesión</p>
                    <p className="text-sm text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
                  </div>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones por WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Recibe alertas de ventas y pagos</p>
                  </div>
                  <Switch 
                    checked={vendorData.whatsappNotifications}
                    onCheckedChange={(checked) => setVendorData({...vendorData, whatsappNotifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zona horaria</p>
                    <p className="text-sm text-muted-foreground">Bogotá (UTC-5)</p>
                  </div>
                  <Badge variant="secondary">Colombia</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado y Progreso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{completedTrainings}</p>
                    <p className="text-sm text-muted-foreground">Capacitaciones completadas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{activeServices}</p>
                    <p className="text-sm text-muted-foreground">Gigs activos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{salesThisMonth}</p>
                    <p className="text-sm text-muted-foreground">Ventas del mes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatCOP(commissionsThisMonth)}</p>
                    <p className="text-sm text-muted-foreground">Comisiones del mes</p>
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
