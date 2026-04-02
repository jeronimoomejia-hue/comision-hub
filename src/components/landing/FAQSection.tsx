import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Building2, DollarSign, Users, HelpCircle } from "lucide-react";

type FAQCategory = "empresas" | "vendedores" | "pagos";

const faqData: Record<FAQCategory, { question: string; answer: string }[]> = {
  empresas: [
    {
      question: "¿Qué es Mensualista exactamente?",
      answer: "Mensualista es un software B2B que le permite a tu empresa tener su propia plataforma de vendedores independientes. Tú personalizas la plataforma con tu marca, publicas tus productos, invitas a tus vendedores y ellos venden por ti. Nosotros nos encargamos de la tecnología, comisiones y pagos.",
    },
    {
      question: "¿Puedo empezar sin pagar nada?",
      answer: "Sí, el plan Freemium es completamente gratis. Puedes registrar tu empresa, personalizar tu plataforma y publicar hasta 5 productos. Solo cobramos un 15% de fee por venta + los costos de pasarela (3% + $1.000 COP por transferencia).",
    },
    {
      question: "¿Qué diferencia hay entre los planes?",
      answer: "Freemium: hasta 5 productos, 12% + 3% por transacción. Premium ($305.000 COP/mes): productos ilimitados, 0% + 3% por transacción, cupones y chat con vendedores. Enterprise: todo Premium + integración API, calendario de horarios y soporte dedicado.",
    },
    {
      question: "¿Qué incluye el plan Enterprise?",
      answer: "El plan Enterprise incluye integración API para conectar tus sistemas, calendario de horarios para servicios por cita, y soporte dedicado con un ejecutivo asignado. Contacta a ventas para un plan personalizado.",
    },
  ],
  vendedores: [
    {
      question: "¿Cómo llegan los vendedores a mi plataforma?",
      answer: "Tú traes a tus vendedores por tus propios medios (redes sociales, referidos, etc.). Les compartes el enlace de tu plataforma personalizada y ellos se registran directamente. Mensualista NO es un marketplace de vendedores.",
    },
    {
      question: "¿Cuántos vendedores puedo tener?",
      answer: "No hay límite de vendedores en ningún plan. Puedes tener todos los que quieras.",
    },
    {
      question: "¿Los vendedores necesitan capacitarse?",
      answer: "Tú decides. Puedes subir materiales de entrenamiento (PDFs, videos) y requerirlos antes de que el vendedor pueda empezar a vender, o puedes dejarlo opcional.",
    },
    {
      question: "¿Los vendedores pueden vender para otras empresas?",
      answer: "No, en Mensualista cada empresa tiene su red privada de vendedores. Los vendedores que registras solo ven y venden tus productos.",
    },
  ],
  pagos: [
    {
      question: "¿Cómo funcionan los pagos a vendedores?",
      answer: "Los pagos se procesan automáticamente. Cuando un vendedor cierra una venta, la comisión se calcula y se programa para pago. Los costos de pasarela (3% + $1.000 COP) se descuentan de cada transacción.",
    },
    {
      question: "¿Qué es el fee del 15% en Freemium?",
      answer: "En el plan gratuito, Mensualista cobra un 15% adicional sobre cada venta como fee de plataforma, además de los costos de pasarela. Este fee NO aplica en Premium ni Enterprise.",
    },
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer: "Sí, puedes subir o bajar de plan cuando quieras. Si subes de plan, se te cobra la diferencia prorrateada. Si bajas, el cambio aplica al próximo ciclo de facturación.",
    },
    {
      question: "¿Qué cupones de descuento puedo crear?",
      answer: "En Premium y Enterprise puedes crear cupones de descuento que los vendedores aplican al registrar una venta. Esto incentiva a los vendedores a cerrar más ventas ofreciendo descuentos a clientes.",
    },
  ],
};

const categories: { id: FAQCategory; label: string; icon: React.ElementType }[] = [
  { id: "empresas", label: "Para empresas", icon: Building2 },
  { id: "vendedores", label: "Vendedores", icon: Users },
  { id: "pagos", label: "Pagos y planes", icon: DollarSign },
];

export const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("empresas");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/30 text-foreground"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {faqData[activeCategory].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-premium overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left group"
              >
                <span className="font-medium pr-4 text-foreground group-hover:text-primary transition-colors">{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? "auto" : 0, opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
