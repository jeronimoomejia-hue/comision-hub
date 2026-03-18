import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "CEO, Poliza.ai",
    quote: "Con Mensualista montamos nuestra red de vendedores en 2 días. Ahora tenemos 47 vendedores activos vendiendo nuestro software sin que tuviéramos que contratar a nadie.",
    avatar: "MG",
  },
  {
    id: 2,
    name: "Roberto Mejía",
    role: "Dir. Comercial, LexIA",
    quote: "El plan Enterprise nos permitió integrar nuestro sistema de activación automática. Los vendedores reciben todo al instante y nosotros no tocamos nada.",
    avatar: "RM",
  },
  {
    id: 3,
    name: "Lucía Fernández",
    role: "Fundadora, Kreativo",
    quote: "Empezamos con el plan gratuito para probar y en 3 semanas ya teníamos 12 vendedores. La inversión del Premium se paga sola con las ventas que generan.",
    avatar: "LF",
  },
  {
    id: 4,
    name: "Andrés Paredes",
    role: "COO, Cierro.co",
    quote: "Los cupones de descuento del plan Premium fueron clave para que nuestros vendedores cerraran más. Duplicamos ventas en el primer mes.",
    avatar: "AP",
  },
  {
    id: 5,
    name: "Patricia Luna",
    role: "Head of Sales, Asista",
    quote: "Tener nuestra propia plataforma con nuestra marca le da seriedad al proceso. Los vendedores sienten que son parte de nuestra empresa.",
    avatar: "PL",
  },
  {
    id: 6,
    name: "Jorge Quispe",
    role: "CTO, NumeroIA",
    quote: "La integración API del Enterprise nos ahorró meses de desarrollo. Conectamos nuestro sistema de licencias en una tarde.",
    avatar: "JQ",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F6FF] relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            <Star className="w-4 h-4 fill-current" />
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Empresas que ya usan Mensualista
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Historias reales de empresas que escalaron sus ventas con su propia red de vendedores.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="card-premium p-6 relative group"
            >
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-8 h-8 text-primary" />
              </div>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-primary" />
                ))}
              </div>
              <p className="text-sm mb-6 leading-relaxed text-muted-foreground">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
