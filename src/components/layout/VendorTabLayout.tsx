import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, DollarSign, User, Bell, LogOut, ChevronLeft, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";
import { vendors, CURRENT_VENDOR_ID } from "@/data/mockData";
import logoMensualista from "@/assets/logo-mensualista.png";

interface VendorTabLayoutProps {
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
}

const tabs = [
  { icon: Home, label: "Inicio", href: "/vendor" },
  { icon: ShoppingBag, label: "Productos", href: "/vendor/products" },
  { icon: Users, label: "Clientes", href: "/vendor/crm" },
  { icon: DollarSign, label: "Pagos", href: "/vendor/payments" },
  { icon: User, label: "Perfil", href: "/vendor/profile" },
];

export default function VendorTabLayout({ children, backTo, backLabel }: VendorTabLayoutProps) {
  const location = useLocation();
  const { currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === (currentVendorId || CURRENT_VENDOR_ID));
  const firstName = vendor?.name.split(' ')[0] || 'Vendedor';

  const isTabActive = (href: string) => {
    if (href === "/vendor") return location.pathname === "/vendor";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            {backTo ? (
              <Link to={backTo} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel || "Volver"}</span>
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <img src={logoMensualista} alt="Mensualista" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-lg text-foreground hidden sm:block">Mensualista</span>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative w-9 h-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </Button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{firstName[0]}</span>
              </div>
              <span className="text-sm font-medium hidden sm:block">{firstName}</span>
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="max-w-5xl mx-auto flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
