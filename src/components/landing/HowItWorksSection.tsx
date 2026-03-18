import { motion } from "framer-motion";
import { CheckCircle, Zap, DollarSign, Briefcase, Rocket } from "lucide-react";

const steps = [
  { icon: Briefcase, title: "Elige un servicio", description: "Explora el catálogo y selecciona el servicio que quieras vender." },
  { icon: CheckCircle, title: "Capacítate en 10 min", description: "Completa el entrenamiento rápido para entender el producto." },
  { icon: Zap, title: "Vende con tu link", description: "Usa tu red de contactos para cerrar ventas con tu link personal." },
  { icon: DollarSign, title: "Gana comisión mensual", description: "Recibe comisiones recurrentes mientras el cliente siga activo." },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F6FF] relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
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
            En 4 pasos simples puedes empezar a generar ingresos recurrentes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              className="relative p-6 rounded-2xl card-premium group"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                {index + 1}
              </div>

              {/* Connector line */}
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

        {/* Mini Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="card-premium p-6 max-w-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-info flex items-center justify-center text-white font-bold">
                B
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Poliza IA</h4>
                <p className="text-xs text-muted-foreground">Asistente virtual para negocios</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Precio mensual</span>
              <span className="font-semibold text-foreground">$299.000 COP</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tu comisión</span>
              <span className="font-bold text-primary">15% recurrente</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;