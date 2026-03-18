import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Briefcase, Users, Zap, Shield, ChevronDown, TrendingUp, DollarSign, ShoppingCart, Bell, Search, BarChart3, ArrowUpRight, ChevronRight, Package, Star, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const MiniBar = ({ height, delay }: { height: number; delay: number }) => (
  <motion.div
    initial={{ height: 0 }}
    whileInView={{ height }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className="w-full rounded-t-sm bg-primary"
    style={{ maxHeight: height }}
  />
);

const MiniLine = () => (
  <svg viewBox="0 0 200 60" className="w-full h-16">
    <motion.path
      d="M0,50 C30,45 40,20 70,25 C100,30 110,10 140,15 C170,20 180,5 200,8"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay: 0.3 }}
    />
    <motion.path
      d="M0,50 C30,45 40,20 70,25 C100,30 110,10 140,15 C170,20 180,5 200,8 L200,60 L0,60 Z"
      fill="url(#purpleGradHero)"
      opacity="0.15"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.15 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.8 }}
    />
    <defs>
      <linearGradient id="purpleGradHero" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export const LandingHero = () => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const stats = [
    { label: "Ventas del mes", value: "$4.2M", change: "+23%", icon: ShoppingCart },
    { label: "Comisiones", value: "$630K", change: "+18%", icon: DollarSign },
    { label: "Vendedores", value: "127", change: "+5", icon: Users },
    { label: "Tasa de éxito", value: "94%", change: "+2%", icon: TrendingUp },
  ];

  const recentSales = [
    { name: "María García", service: "Poliza IA", amount: "$299.000", time: "Hace 2 min" },
    { name: "Carlos Ruiz", service: "DataFlow Pro", amount: "$450.000", time: "Hace 8 min" },
  ];

  const serviceCards = [
    { name: "Poliza IA", category: "Asistente IA", price: "$299.000/mes", commission: "15%", icon: Bot, color: "bg-primary/10 text-primary" },
    { name: "DataFlow Pro", category: "Analítica", price: "$450.000/mes", commission: "12%", icon: BarChart3, color: "bg-primary/8 text-primary" },
    { name: "CloudSync", category: "Almacenamiento", price: "$189.000/mes", commission: "18%", icon: Zap, color: "bg-primary/10 text-primary" },
    { name: "SecureVault", category: "Seguridad", price: "$350.000/mes", commission: "10%", icon: Star, color: "bg-primary/8 text-primary" },
  ];

  const barHeights = [28, 42, 35, 55, 48, 62, 45];
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <section className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 overflow-hidden bg-background">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl mx-auto space-y-10 relative z-10"
      >
        {/* Top section: Text + CTA */}
        <div className="text-center space-y-6">
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4F0FA] border border-border">
              <span className="text-sm font-medium text-foreground">
                La plataforma #1 de ventas por comisión
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
              <span className="block">Vende servicios y</span>
              <span className="block text-primary">gana comisión mensual.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Vende servicios digitales por suscripción y gana{" "}
              <span className="font-semibold text-foreground">comisión recurrente cada mes.</span>
            </p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=register&role=vendor">
              <Button size="lg" className="px-8 py-6 text-base group w-full sm:w-auto">
                <Briefcase className="mr-2 w-5 h-5" />
                Empezar a vender
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth?mode=register&role=company">
              <Button size="lg" variant="outline" className="px-8 py-6 text-base w-full sm:w-auto">
                <Building2 className="mr-2 w-5 h-5" />
                Soy empresa
              </Button>
            </Link>
          </motion.div>

          {/* Mini explanation stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "15%", label: "Comisión promedio" },
              { value: "10", label: "Min. capacitación" },
              { value: "$0", label: "Inversión inicial" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-[#F4F0FA]">
                <p className="text-xl sm:text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Mockup - Computer frame */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 60 }}
          className="relative"
        >
          {/* Explanation overlay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-6"
          >
            <p className="text-sm text-muted-foreground">
              Elige un servicio, <span className="text-primary font-semibold">capacítate en 10 minutos</span> y empieza a vender. Ganas comisión cada mes mientras el cliente siga activo.
            </p>
          </motion.div>

          {/* Monitor bezel */}
          <div className="relative bg-foreground/95 rounded-2xl p-2 shadow-2xl">
            {/* Screen */}
            <div className="bg-background rounded-xl overflow-hidden border border-border/30">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  </div>
                  <div className="ml-3 px-3 py-1 rounded-md bg-muted/50 text-[10px] text-muted-foreground font-mono">
                    app.mensualista.com/dashboard
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-muted/50 flex items-center justify-center">
                    <Search className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="w-5 h-5 rounded-md bg-muted/50 flex items-center justify-center relative">
                    <Bell className="w-3 h-3 text-muted-foreground" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                    M
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Greeting */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold">¡Hola, María! 👋</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Resumen de tu desempeño</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                    <span className="text-[9px] font-medium">En vivo</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="p-2.5 sm:p-3 rounded-xl bg-card border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[9px] font-medium text-primary flex items-center gap-0.5">
                          {stat.change}
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <p className="text-base sm:text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        Ingresos semanales
                      </h4>
                      <span className="text-[9px] text-muted-foreground">Últimos 30 días</span>
                    </div>
                    <MiniLine />
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-primary" />
                        Ventas por día
                      </h4>
                      <span className="text-[9px] text-muted-foreground">Esta semana</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {barHeights.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <MiniBar height={h} delay={0.7 + i * 0.08} />
                          <span className="text-[7px] text-muted-foreground">{days[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom row: Services + Recent Sales */}
                <div className="grid sm:grid-cols-5 gap-3">
                  <div className="sm:col-span-3 rounded-xl bg-card border border-border/50 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-primary" />
                        Servicios disponibles
                      </h4>
                      <span className="text-[9px] text-primary flex items-center gap-0.5">
                        Ver catálogo <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2.5">
                      {serviceCards.map((svc, i) => (
                        <motion.div
                          key={svc.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7 + i * 0.08 }}
                          className="p-2.5 rounded-lg border border-border/40 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${svc.color}`}>
                              <svc.icon className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold leading-tight">{svc.name}</p>
                              <p className="text-[8px] text-muted-foreground">{svc.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-muted-foreground">{svc.price}</span>
                            <span className="text-[8px] font-bold text-primary">{svc.commission}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-xl bg-card border border-border/50 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <ShoppingCart className="w-3 h-3 text-primary" />
                        Recientes
                      </h4>
                      <span className="text-[9px] text-primary flex items-center gap-0.5">
                        Ver todas <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="divide-y divide-border/30">
                      {recentSales.map((sale, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="flex items-center justify-between px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                              {sale.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-[10px] font-medium">{sale.name}</p>
                              <p className="text-[8px] text-muted-foreground">{sale.service}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-semibold">{sale.amount}</p>
                            <p className="text-[8px] text-muted-foreground">{sale.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monitor stand */}
          <div className="flex justify-center">
            <div className="w-24 h-4 bg-foreground/90 rounded-b-lg" />
          </div>
          <div className="flex justify-center">
            <div className="w-40 h-2 bg-foreground/80 rounded-b-xl" />
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div variants={itemVariants} className="pt-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {[
              { icon: Users, text: "+500 vendedores activos" },
              { icon: Building2, text: "+30 empresas verificadas" },
              { icon: Zap, text: "Pagos automáticos" },
              { icon: Shield, text: "Sin experiencia necesaria" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-background border border-border"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-12 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium">Descubre más</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default LandingHero;
