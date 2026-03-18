import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  ShoppingCart,
  DollarSign,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Building2,
  Users,
  Settings,
  ChevronDown,
  Activity,
  UserCheck,
  Plus,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemo } from "@/contexts/DemoContext";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "vendor" | "company" | "admin";
  userName?: string;
}

const navigationItems = {
  vendor: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/vendor" },
    { icon: Package, label: "Servicios", href: "/vendor/services", hasSubItems: true },
    { icon: ShoppingCart, label: "Mis Ventas", href: "/vendor/sales" },
    { icon: User, label: "Mi perfil", href: "/vendor/profile" },
    { icon: HelpCircle, label: "Soporte", href: "/vendor/support" },
  ],
  company: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/company" },
    { icon: Package, label: "Servicios", href: "/company/services" },
    { icon: ShoppingCart, label: "Ventas", href: "/company/sales" },
    { icon: Users, label: "Vendedores", href: "/company/vendors" },
    { icon: DollarSign, label: "Pagos", href: "/company/payments" },
    { icon: Building2, label: "Mi empresa", href: "/company/profile" },
    { icon: Settings, label: "Configuración", href: "/company/settings" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: UserCheck, label: "Vendedores", href: "/admin/vendors" },
    { icon: Building2, label: "Empresas", href: "/admin/companies" },
    { icon: Activity, label: "Transacciones Live", href: "/admin/transactions" },
    { icon: Package, label: "Servicios", href: "/admin/services" },
    { icon: BookOpen, label: "Capacitaciones", href: "/admin/trainings" },
    { icon: ShoppingCart, label: "Ventas", href: "/admin/sales" },
    { icon: DollarSign, label: "Pagos", href: "/admin/payments" },
    { icon: Users, label: "Usuarios", href: "/admin/users" },
    { icon: Settings, label: "Configuración", href: "/admin/settings" },
  ],
};

const roleLabels = {
  vendor: "Vendedor",
  company: "Empresa",
  admin: "Administrador",
};

export default function DashboardLayout({ children, role, userName = "Usuario" }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(
    location.pathname.startsWith('/vendor/services')
  );
  const items = navigationItems[role];

  const { services, trainingProgress, currentVendorId, companies, pinnedServices } = useDemo();
  
  const vendorSidebarServices = role === 'vendor' 
    ? services.filter(s => s.status === 'activo' && pinnedServices.includes(s.id)).map(service => {
        const training = trainingProgress.find(
          tp => tp.vendorId === currentVendorId && tp.serviceId === service.id
        );
        const isCompleted = !service.requiresTraining || training?.status === 'declared_completed';
        const company = companies.find(c => c.id === service.companyId);
        
        return {
          ...service,
          isCompleted,
          companyName: company?.name || 'Sin empresa',
          trainingId: training?.id,
          link: isCompleted ? `/vendor/services/${service.id}` : (training ? `/vendor/trainings/${training.id}` : `/vendor/services`),
        };
      })
    : [];

  const servicesByCompany = vendorSidebarServices.reduce((acc, service) => {
    if (!acc[service.companyName]) acc[service.companyName] = [];
    acc[service.companyName].push(service);
    return acc;
  }, {} as Record<string, typeof vendorSidebarServices>);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-lg text-foreground">Mensualista</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Role Badge */}
          <div className="px-4 py-3 border-b border-border">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {role === "vendor" && <User className="w-3 h-3" />}
              {role === "company" && <Building2 className="w-3 h-3" />}
              {role === "admin" && <Settings className="w-3 h-3" />}
              {roleLabels[role]}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              const isServiceSection = 'hasSubItems' in item && item.hasSubItems;
              const isInServiceSection = location.pathname.startsWith('/vendor/services');
              
              if (isServiceSection && role === 'vendor') {
                return (
                  <div key={item.href}>
                    <div className="flex items-center">
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${isInServiceSection
                            ? 'bg-[#F4F0FA] text-foreground font-semibold border-l-[3px] border-l-primary' 
                            : 'text-muted-foreground hover:bg-[#FAF7FF] hover:text-foreground'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                      <button
                        onClick={() => setServicesExpanded(!servicesExpanded)}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesExpanded ? '' : '-rotate-90'}`} />
                      </button>
                    </div>
                    
                    {servicesExpanded && Object.keys(servicesByCompany).length > 0 && (
                      <div className="ml-4 mt-1 space-y-2 border-l-2 border-border pl-3">
                        {Object.entries(servicesByCompany).map(([companyName, companyServices]) => (
                          <div key={companyName}>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1">
                              {companyName}
                            </p>
                            {companyServices.map(service => {
                              const isServiceActive = location.pathname === service.link;
                              return (
                                <Link
                                  key={service.id}
                                  to={service.link}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`
                                    flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium transition-colors
                                    ${isServiceActive
                                      ? 'bg-[#F4F0FA] text-foreground font-semibold'
                                      : 'text-muted-foreground hover:bg-[#FAF7FF] hover:text-foreground'
                                    }
                                  `}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${service.isCompleted ? 'bg-[#00B87A]' : 'bg-[#F59E0B]'}`} />
                                  <span className="truncate">{service.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                        <Link
                          to="/vendor/services"
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium text-primary hover:bg-primary/5 transition-colors mt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Explorar más servicios</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#F4F0FA] text-foreground font-semibold border-l-[3px] border-l-primary' 
                      : 'text-muted-foreground hover:bg-[#FAF7FF] hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* User Section */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/92 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-secondary rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold hidden sm:block">
                {items.find(item => item.href === location.pathname)?.label || "Dashboard"}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
              
              <Link to="/">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Ir al inicio
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}