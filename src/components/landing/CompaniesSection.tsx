import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, DollarSign, BarChart3, CheckCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  { icon: CheckCircle, text: "Publica tu oferta en minutos" },
  { icon: DollarSign, text: "Pagas solo por ventas cerradas" },
  { icon: Users, text: "Accede a +500 vendedores activos" },
  { icon: BarChart3, text: "Dashboard de seguimiento en tiempo real" },
  { icon: Shield, text: "Vendedores capacitados en tu producto" },
  { icon: Zap, text: "Pagos y comisiones automáticas" },
];

export const CompaniesSection = () => {
  return (
    <section id="empresas" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F6FF] relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
              <Building2 className="w-4 h-4" />
              Para empresas
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              ¿Eres empresa de gigs?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Conecta tu SaaS o gig digital con una red de vendedores independientes. Paga solo por resultados.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <item.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/auth?mode=register&role=company">
              <Button size="lg" className="group">
                Registrar mi empresa
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right - Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <div className="card-premium p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Panel de empresa</h4>
                  <p className="text-xs text-muted-foreground">Vista en tiempo real</p>
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Vendedores activos", value: "47" },
                  { label: "Ventas este mes", value: "128" },
                  { label: "Ingresos", value: "$38.4M" },
                  { label: "Tasa conversión", value: "24%" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-3 rounded-xl bg-[#F4F0FA]"
                  >
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold text-primary">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar mock */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Meta mensual</span>
                  <span className="font-medium text-foreground">84%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#F4F0FA] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "84%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;