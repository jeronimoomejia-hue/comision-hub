import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Phone, Building2, Globe, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoMensualista from "@/assets/logo.png";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "login";
  const initialRole = searchParams.get("role") || "vendor";
  
  const [mode, setMode] = useState<"login" | "register">(initialMode as "login" | "register");
  const [role, setRole] = useState<"vendor" | "company">(initialRole as "vendor" | "company");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(mode === "login" ? "¡Bienvenido de vuelta!" : "¡Cuenta creada exitosamente!");
    setIsLoading(false);
    
    if (role === "vendor") {
      window.location.href = "/vendor/home";
    } else if (role === "company") {
      window.location.href = "/company";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Link */}
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <img src={logoMensualista} alt="Mensualista" className="w-10 h-10 object-contain" />
              <span className="font-bold text-2xl text-foreground">Mensualista</span>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
              {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {mode === "login" 
                ? "Accede a tu panel de control" 
                : role === "vendor" 
                  ? "Empieza a vender y ganar comisiones"
                  : "Publica tus productos y encuentra vendedores"
              }
            </p>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 text-sm mb-6">
              <span className="text-muted-foreground">
                {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary font-medium hover:underline"
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>
            
            {/* Role Tabs (only for register) */}
            {mode === "register" && (
              <Tabs value={role} onValueChange={(v) => setRole(v as "vendor" | "company")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vendor" className="gap-2">
                    <User className="w-4 h-4" />
                    Vendedor
                  </TabsTrigger>
                  <TabsTrigger value="company" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Empresa
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {role === "vendor" ? "Nombre completo" : "Nombre de la empresa"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder={role === "vendor" ? "Juan Pérez" : "Mi Empresa S.A."}
                        className="pl-10"
                        required
                      />
                      {role === "vendor" ? (
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {role === "company" && (
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio web (opcional)</Label>
                      <div className="relative">
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://miempresa.com"
                          className="pl-10"
                        />
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+52 55 1234 5678"
                        className="pl-10"
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
              
              {mode === "register" && (
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" className="mt-1" required />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    Acepto los{" "}
                    <a href="#" className="text-primary hover:underline">términos de producto</a>
                    {" "}y la{" "}
                    <a href="#" className="text-primary hover:underline">política de privacidad</a>
                  </label>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  mode === "login" ? "Iniciar sesión" : "Crear cuenta"
                )}
              </Button>
            </form>
            
            {/* Demo Links */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">Acceso rápido a demos:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/vendor">
                  <Button variant="outline" size="sm">Panel Vendedor</Button>
                </Link>
                <Link to="/company">
                  <Button variant="outline" size="sm">Panel Empresa</Button>
                </Link>
                <Link to="/admin">
                  <Button variant="outline" size="sm">Panel Admin</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative text-primary-foreground max-w-lg"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <img src={logoMensualista} alt="Mensualista" className="w-14 h-14 object-contain brightness-0 invert" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {role === "vendor" 
              ? "Transforma tu tiempo en ingresos"
              : "Escala tu equipo de ventas sin contratar"
            }
          </h2>
          
          <p className="text-lg opacity-90 mb-8">
            {role === "vendor"
              ? "Únete a cientos de vendedores que ya generan ingresos extra vendiendo productos de empresas líderes."
              : "Accede a una red de vendedores motivados listos para vender tus productos. Solo pagas por resultados."
            }
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <p className="text-2xl font-bold">$2M+</p>
              <p className="text-sm opacity-70">En comisiones pagadas</p>
            </div>
            <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm opacity-70">Vendedores activos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;