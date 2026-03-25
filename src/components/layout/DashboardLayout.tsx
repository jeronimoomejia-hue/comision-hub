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
  MessageCircle,
  Tag,
  Globe,
  Code,
  Crown,
  Zap,
  Lock,
  Palette
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

function getVendorNav(plan: CompanyPlan) {
  const base = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/vendor" },
    { icon: Package, label: "Productos", href: "/vendor/services" },
    { icon: ShoppingCart, label: "Mis Ventas", href: "/vendor/sales" },
    { icon: DollarSign, label: "Pagos", href: "/vendor/payments" },
    { icon: BookOpen, label: "Entrenamientos", href: "/vendor/trainings" },
    { icon: User, label: "Mi Perfil", href: "/vendor/profile" },
  ];

  // Premium & Enterprise: Chat con empresa
  if (plan !== 'freemium') {
    base.push({ icon: MessageCircle, label: "Chat Empresa", href: "/vendor/support" });
  }

  return base;
}

function getCompanyNav(plan: CompanyPlan) {
  const base = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/company" },
    { icon: Package, label: "Productos", href: "/company/services" },
    { icon: Users, label: "Vendedores", href: "/company/vendors" },
    { icon: DollarSign, label: "Pagos", href: "/company/payments" },
    { icon: Settings, label: "Configuración", href: "/company/settings" },
  ];

  // Premium & Enterprise: Chat
  if (plan !== 'freemium') {
    base.push({ icon: MessageCircle, label: "Chat", href: "/company/chat" });
  }

  // Enterprise: Dominio & API
  if (plan === 'enterprise') {
    base.push({ icon: Globe, label: "Dominio", href: "/company/domain" });
    base.push({ icon: Code, label: "API", href: "/company/api" });
  }

  return base;
}

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: UserCheck, label: "Vendedores", href: "/admin/vendors" },
  { icon: Building2, label: "Empresas", href: "/admin/companies" },
  { icon: Activity, label: "Transacciones", href: "/admin/transactions" },
  { icon: Package, label: "Productos", href: "/admin/services" },
  { icon: BookOpen, label: "Entrenamientos", href: "/admin/trainings" },
  { icon: ShoppingCart, label: "Ventas", href: "/admin/sales" },
  { icon: DollarSign, label: "Pagos", href: "/admin/payments" },
  { icon: Users, label: "Usuarios", href: "/admin/users" },
  { icon: Settings, label: "Configuración", href: "/admin/settings" },
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
      : getVendorNav(currentCompanyPlan);

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
          {/* Logo / Company branding */}
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
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">M</span>
                  </div>
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
          
          {/* Role + Plan Badge */}
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
          
          {/* Navigation */}
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
