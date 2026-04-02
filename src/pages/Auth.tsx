import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Phone, Building2, Globe, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import logoMensualista from "@/assets/logo.png";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get("mode") || "login";
  const initialRole = searchParams.get("role") || "vendor";

  const [mode, setMode] = useState<"login" | "register">(initialMode as "login" | "register");
  const [role, setRole] = useState<"vendor" | "company">(initialRole as "vendor" | "company");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error("Error al iniciar con Google");
        console.error(error);
      }
    } catch (err) {
      toast.error("Error al conectar con Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "register") {
        const metadata: Record<string, string> = {
          full_name: role === "company" ? companyName : fullName,
          role: role,
          phone: phone,
        };
        if (role === "company") {
          metadata.company_name = companyName;
          if (website) metadata.website = website;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.user) {
          // If company, create the company record
          if (role === "company") {
            const { error: compError } = await supabase.from("companies").insert({
              owner_id: data.user.id,
              name: companyName,
              contact_email: email,
              contact_phone: phone,
              website_url: website || null,
            });
            if (compError) console.error("Company creation error:", compError);
          }

          toast.success("¡Cuenta creada! Revisa tu correo para confirmar.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message === "Invalid login credentials" ? "Credenciales incorrectas" : error.message);
          return;
        }

        if (data.user) {
          // Fetch role and redirect
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .limit(1);

          const userRole = roles?.[0]?.role || "vendor";
          toast.success("¡Bienvenido de vuelta!");

          if (userRole === "company") {
            navigate("/company");
          } else if (userRole === "admin") {
            navigate("/admin");
          } else {
            navigate("/vendor");
          }
        }
      }
    } catch (err) {
      toast.error("Error inesperado");
      console.error(err);
    } finally {
      setIsLoading(false);
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
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            <div className="flex items-center gap-2 mb-8">
              <img src={logoMensualista} alt="Mensualista" className="w-10 h-10 object-contain" />
              <span className="font-bold text-2xl text-foreground">Mensualista</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
              {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {mode === "login"
                ? "Accede a tu panel de control"
                : role === "vendor"
                  ? "Empieza a vender y ganar comisiones"
                  : "Publica tus productos y encuentra vendedores"
              }
            </p>

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full mb-4 h-11 gap-2 text-sm font-medium"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </Button>

            {/* Apple Sign In */}
            <Button
              variant="outline"
              className="w-full mb-4 h-11 gap-2 text-sm font-medium"
              onClick={() => toast.info("Apple Sign In disponible próximamente")}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continuar con Apple
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o con email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 text-sm mb-4">
              <span className="text-muted-foreground">
                {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              </span>
              <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary font-medium hover:underline">
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>

            {/* Role Tabs (only for register) */}
            {mode === "register" && (
              <Tabs value={role} onValueChange={(v) => setRole(v as "vendor" | "company")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vendor" className="gap-2"><User className="w-4 h-4" />Vendedor</TabsTrigger>
                  <TabsTrigger value="company" className="gap-2"><Building2 className="w-4 h-4" />Empresa</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">{role === "vendor" ? "Nombre completo" : "Nombre de la empresa"}</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder={role === "vendor" ? "Juan Pérez" : "Mi Empresa S.A."}
                        className="pl-10"
                        required
                        value={role === "vendor" ? fullName : companyName}
                        onChange={(e) => role === "vendor" ? setFullName(e.target.value) : setCompanyName(e.target.value)}
                      />
                      {role === "vendor"
                        ? <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        : <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                  </div>

                  {role === "company" && (
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio web (opcional)</Label>
                      <div className="relative">
                        <Input id="website" type="url" placeholder="https://miempresa.com" className="pl-10" value={website} onChange={(e) => setWebsite(e.target.value)} />
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Input id="phone" type="tel" placeholder="+57 300 123 4567" className="pl-10" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Input id="email" type="email" placeholder="tu@email.com" className="pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" className="mt-1" required />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    Acepto los <a href="#" className="text-primary hover:underline">términos</a> y la <a href="#" className="text-primary hover:underline">política de privacidad</a>
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
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
            {role === "vendor" ? "Transforma tu tiempo en ingresos" : "Escala tu equipo de ventas sin contratar"}
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
