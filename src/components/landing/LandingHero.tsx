import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, Zap, Shield, ChevronDown, TrendingUp, DollarSign, BarChart3, CheckCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  return (
    <section className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl mx-auto space-y-10 relative z-10"
      >
        <div className="text-center space-y-6">
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4F0FA] border border-border">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Software para gestionar tu fuerza de ventas
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
              <span className="block">Tu red de vendedores,</span>
              <span className="block text-primary">tu marca, tu control.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Mensualista es el software que le da a tu empresa su propia plataforma de vendedores independientes.{" "}
              <span className="font-semibold text-foreground">Personaliza, gestiona y escala tu fuerza de ventas.</span>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=register&role=company">
              <Button size="lg" className="px-8 py-6 text-base group w-full sm:w-auto">
                <Building2 className="mr-2 w-5 h-5" />
                Registrar mi empresa gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#planes">
              <Button size="lg" variant="outline" className="px-8 py-6 text-base w-full sm:w-auto">
                Ver planes y precios
              </Button>
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "0€", label: "Plan gratuito" },
              { value: "∞", label: "Vendedores ilimitados" },
              { value: "100%", label: "Tu marca" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-[#F4F0FA]">
                <p className="text-xl sm:text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Mockup - Company Panel Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 60 }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-6"
          >
            <p className="text-sm text-muted-foreground">
              Tu empresa tiene su <span className="text-primary font-semibold">panel personalizado</span> para gestionar vendedores, ventas y comisiones.
            </p>
          </motion.div>

          <div className="relative bg-foreground/95 rounded-2xl p-2 shadow-2xl">
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
                    tuempresa.mensualista.com/admin
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold">Panel de TuEmpresa 🏢</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Gestión de vendedores y ventas</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[9px] font-medium">En vivo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: "Vendedores activos", value: "47", icon: Users },
                    { label: "Ventas este mes", value: "128", icon: TrendingUp },
                    { label: "Ingresos", value: "$38.4M", icon: DollarSign },
                    { label: "Tasa conversión", value: "24%", icon: BarChart3 },
                  ].map((stat, i) => (
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
                      </div>
                      <p className="text-base sm:text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-card border border-border/50">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      Funcionalidades incluidas
                    </h4>
                    <div className="space-y-1.5">
                      {["Tu logo y colores", "Panel de vendedores", "Gestión de comisiones", "Reportes en tiempo real"].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-success" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/50">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                      <Globe className="w-3 h-3 text-primary" />
                      Personalización
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary" />
                        <div className="w-4 h-4 rounded bg-foreground" />
                        <div className="w-4 h-4 rounded bg-muted" />
                        <span className="text-[9px] text-muted-foreground">Tus colores</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Dominio: <span className="font-mono text-foreground">ventas.tuempresa.com</span>
                      </div>
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
          <div className="flex justify-center -mt-0.5">
            <div className="w-40 h-2 bg-foreground/80 rounded-b-xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium">Descubre más</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default LandingHero;
