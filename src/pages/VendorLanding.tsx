import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, BookOpen, Shield, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import dashboardMockup from "@/assets/mockups/vendor-dashboard-mockup.jpg";
import mobileMockup from "@/assets/mockups/vendor-mobile-mockup.jpg";
import companiesMockup from "@/assets/mockups/vendor-companies-mockup.jpg";
import logoMensualista from "@/assets/logo-mensualista.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function VendorLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 relative">
              <img src={logoMensualista} alt="Mensualista" className="w-full h-full object-contain" />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth?role=vendor">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link to="/auth?mode=register&role=vendor">
              <Button size="sm">Empezar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <Zap className="w-3 h-3" /> Para vendedores independientes
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Vende servicios.<br />
                <span className="text-primary">Gana comisiones.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Sin inventario, sin inversión. Elige empresas, capacítate y empieza a ganar.
              </p>
              <Link to="/auth?mode=register&role=vendor">
                <Button size="lg" className="px-8 group">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img
                src={dashboardMockup}
                alt="Panel de vendedor"
                className="rounded-2xl shadow-2xl border border-border w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works - 3 steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold mb-12 text-foreground">
            Así de simple
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Regístrate", desc: "Crea tu cuenta gratis en 30 segundos" },
              { step: "2", title: "Elige empresas", desc: "Explora servicios y capacítate" },
              { step: "3", title: "Vende y gana", desc: "Cada venta genera comisión automática" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockup: Mobile */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.img
              src={mobileMockup}
              alt="App móvil"
              className="rounded-2xl shadow-xl border border-border w-full max-w-md mx-auto"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            />
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Tu negocio en el bolsillo</h2>
              <div className="space-y-4">
                {[
                  { icon: DollarSign, text: "Comisiones rastreadas en tiempo real" },
                  { icon: BookOpen, text: "Capacítate desde tu celular" },
                  { icon: Shield, text: "Pagos automáticos y seguros" },
                  { icon: CheckCircle, text: "Sin metas mínimas ni presión" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mockup: Companies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Empresas que ya confían en Mensualista</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Accede a servicios de IA de empresas líderes y vende con respaldo.
            </p>
            <img
              src={companiesMockup}
              alt="Empresas disponibles"
              className="rounded-2xl shadow-xl border border-border w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="container mx-auto max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Listo para ganar?</h2>
          <p className="text-lg opacity-90 mb-8">Crea tu cuenta, elige una empresa y haz tu primera venta hoy.</p>
          <Link to="/auth?mode=register&role=vendor">
            <Button size="lg" variant="secondary" className="px-8 group">
              Crear mi cuenta gratis
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">© 2025 Mensualista. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
