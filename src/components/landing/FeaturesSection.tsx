import { motion } from "framer-motion";
import { Palette, Users, BarChart3, Shield, MessageCircle, Tag, Globe, Code, Zap, CheckCircle } from "lucide-react";

const features = [
  { icon: Palette, title: "Tu marca, tu identidad", description: "Logo, colores primarios y secundarios. Tus vendedores ven tu marca, no la nuestra." },
  { icon: Users, title: "Red de vendedores privada", description: "Trae a tus vendedores por tus propios medios. Ellos se registran en tu plataforma personalizada." },
  { icon: BarChart3, title: "Dashboard en tiempo real", description: "Ve ventas, comisiones, rendimiento de vendedores y métricas clave al instante." },
  { icon: Shield, title: "Códigos de activación", description: "Gestiona la activación de servicios con códigos manuales o integración automática." },
  { icon: Tag, title: "Cupones de descuento", description: "Crea cupones para incentivar a tus vendedores a cerrar más ventas. (Premium+)" },
  { icon: MessageCircle, title: "Chat empresa-vendedor", description: "Comunicación directa con tus vendedores para resolver dudas y dar soporte. (Premium+)" },
  { icon: Globe, title: "Dominio personalizado", description: "Tu plataforma con tu propio dominio. Marca blanca completa. (Enterprise)" },
  { icon: Code, title: "Integraciones API", description: "Conecta la activación de códigos con tu sistema existente. (Enterprise)" },
];

export const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            <Zap className="w-4 h-4" />
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Todo lo que necesitas para escalar ventas
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Desde personalización hasta integraciones avanzadas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="card-premium p-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F4F0FA] flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
