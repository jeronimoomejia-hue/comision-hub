import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Carolina Mejía",
    role: "Vendedora independiente",
    quote: "En 3 meses pasé de no saber nada de ventas a tener 12 clientes activos que me generan comisión cada mes. Mensualista me cambió la vida.",
    avatar: "CM",
  },
  {
    id: 2,
    name: "Valentina Ríos",
    role: "Vendedora de SaaS",
    quote: "Lo mejor es que no tengo que preocuparme por nada técnico. Mensualista se encarga de todo y yo solo me concentro en vender.",
    avatar: "VR",
  },
  {
    id: 3,
    name: "María José Herrera",
    role: "Freelancer",
    quote: "Vendo 2-3 servicios al mes y con eso pago mi arriendo. Las capacitaciones son súper claras y el soporte siempre está disponible.",
    avatar: "MH",
  },
  {
    id: 4,
    name: "Andrés Gómez",
    role: "Vendedor digital",
    quote: "Nunca pensé que podría generar ingresos recurrentes sin tener mi propio negocio. Ahora tengo 8 clientes activos y cada mes crece.",
    avatar: "AG",
  },
  {
    id: 5,
    name: "Diego Ramírez",
    role: "Estudiante universitario",
    quote: "Perfecto para hacer plata mientras estudio. Comparto mi link, la gente compra y yo gano cada mes. Así de simple.",
    avatar: "DR",
  },
  {
    id: 6,
    name: "Sebastián Castro",
    role: "Ex-freelancer",
    quote: "Dejé de buscar clientes para proyectos y ahora vendo servicios con comisión recurrente. Es un modelo brutal para ingresos estables.",
    avatar: "SC",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
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
            Lo que dicen nuestros vendedores
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Historias reales de personas que están generando ingresos recurrentes con Mensualista.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
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
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-8 h-8 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm mb-6 leading-relaxed text-muted-foreground">
                "{testimonial.quote}"
              </p>

              {/* Author */}
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