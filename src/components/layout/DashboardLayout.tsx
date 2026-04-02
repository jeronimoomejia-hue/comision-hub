import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
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
  MessageCircle,
  Crown,
  Zap,
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
import { Badge } from "@/components/ui/badge";
import type { CompanyPlan } from "@/data/mockData";
import logoMensualista from "@/assets/logo.png";
import LanguageSelector from "@/components/LanguageSelector";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "vendor" | "company" | "admin";
  userName?: string;
}

const planConfig: Record<CompanyPlan, { label: string; icon: React.ElementType }> = {
  freemium: { label: "Freemium", icon: Zap },
  premium: { label: "Premium", icon: Crown },
  enterprise: { label: "Enterprise", icon: Building2 },
};

const roleLabels = {
  vendor: "Vendedor",
  company: "Empresa",
  admin: "Administrador",
};

function getVendorNav() {
  return [
    { icon: LayoutDashboard, label: "Inicio", href: "/vendor" },
    { icon: Package, label: "Productos", href: "/vendor/products" },
    { icon: ShoppingCart, label: "Ventas", href: "/vendor/payments" },
    { icon: Users, label: "Clientes", href: "/vendor/crm" },
    { icon: HelpCircle, label: "Soporte", href: "/vendor/support" },
    { icon: User, label: "Mi Perfil", href: "/vendor/profile" },
  ];
}

function getCompanyNav(plan: CompanyPlan) {
  const base = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/company" },
    { icon: Package, label: "Mis Productos", href: "/company/services" },
    { icon: ShoppingCart, label: "Ventas", href: "/company/payments" },
    { icon: Users, label: "Mi Red", href: "/company/vendors" },
  ];

  if (plan !== 'freemium') {
    base.push({ icon: MessageCircle, label: "Chat", href: "/company/chat" });
  }

  base.push(
    { icon: Settings, label: "Configuracion", href: "/company/settings" },
  );

  return base;
}

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Building2, label: "Empresas", href: "/admin/companies" },
  { icon: UserCheck, label: "Vendedores", href: "/admin/vendors" },
  { icon: Activity, label: "Transacciones", href: "/admin/transactions" },
  { icon: Package, label: "Productos", href: "/admin/services" },
  { icon: ShoppingCart, label: "Ventas", href: "/admin/sales" },
  { icon: DollarSign, label: "Comisiones", href: "/admin/payments" },
  { icon: MessageCircle, label: "Soporte", href: "/admin/support" },
  { icon: Users, label: "Usuarios", href: "/admin/users" },
  { icon: Settings, label: "Configuracion", href: "/admin/settings" },
];

export default function DashboardLayout({ children, role, userName = "Usuario" }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentCompanyPlan, companies, currentCompanyId } = useDemo();

  const company = companies.find(c => c.id === currentCompanyId);
  const pc = planConfig[currentCompanyPlan];

  const items = role === 'admin'
    ? adminNav
    : role === 'company'
      ? getCompanyNav(currentCompanyPlan)
      : getVendorNav();

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              {role === 'vendor' && company ? (
                <>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}>
                    <span className="text-white font-bold text-lg">{company.name[0]}</span>
                  </div>
                  <span className="font-bold text-lg text-foreground truncate">{company.name}</span>
                </>
              ) : (
                <>
                  <img src={logoMensualista} alt="Mensualista" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-lg text-foreground">Mensualista</span>
                </>
              )}
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {role === "vendor" && <User className="w-3 h-3" />}
                {role === "company" && <Building2 className="w-3 h-3" />}
                {role === "admin" && <Settings className="w-3 h-3" />}
                {roleLabels[role]}
              </div>
              {role !== 'admin' && (
                <Badge variant="outline" className="text-[9px] gap-1">
                  <pc.icon className="w-3 h-3" />
                  {pc.label}
                </Badge>
              )}
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-foreground font-semibold border-l-[3px] border-l-primary' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
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
                  Configuracion
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
      
      <div className="lg:pl-64">
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
              <LanguageSelector />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            </div>
          </div>
        </header>
        
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
