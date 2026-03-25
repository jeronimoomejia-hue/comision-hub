import { motion } from "framer-motion";
import { Building2, Palette, Users, DollarSign, Rocket } from "lucide-react";

const steps = [
  { icon: Building2, title: "Registra tu empresa", description: "Crea tu cuenta empresarial gratis y configura tu perfil en minutos." },
  { icon: Palette, title: "Personaliza tu plataforma", description: "Sube tu logo, elige tus colores y configura tus productos con sus comisiones." },
  { icon: Users, title: "Invita a tus vendedores", description: "Comparte el enlace de tu plataforma y tus vendedores se registran directamente." },
  { icon: DollarSign, title: "Gestiona y cobra", description: "Tus vendedores venden, tú ves todo en tiempo real. Pagos y comisiones automáticas." },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F6FF] relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            <Rocket className="w-4 h-4" />
            Fácil y rápido
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            ¿Cómo funciona?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            En 4 pasos tu empresa tiene su propia red de vendedores funcionando.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              className="relative p-6 rounded-2xl card-premium group"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                {index + 1}
              </div>
              {index < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30" />
              )}
              <div className="w-10 h-10 rounded-xl bg-[#F4F0FA] flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
