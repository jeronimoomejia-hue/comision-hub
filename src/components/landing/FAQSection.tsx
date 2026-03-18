import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Briefcase, Building2, DollarSign, HelpCircle } from "lucide-react";

type FAQCategory = "vendedores" | "empresas" | "pagos";

const faqData: Record<FAQCategory, { question: string; answer: string }[]> = {
  vendedores: [
    {
      question: "¿Necesito experiencia en ventas?",
      answer: "No, no necesitas experiencia previa. Cada servicio incluye capacitaciones cortas (10-15 minutos) que te enseñan todo lo que necesitas saber para vender. Además, tienes materiales de apoyo y guiones de venta.",
    },
    {
      question: "¿Cómo funciona la comisión recurrente?",
      answer: "Cuando vendes un servicio por suscripción, recibes tu porcentaje de comisión cada mes mientras el cliente siga activo. Si vendes 10 clientes, cobras por los 10 todos los meses.",
    },
    {
      question: "¿Cuántos servicios puedo vender?",
      answer: "Puedes vender tantos servicios como quieras. No hay límite. Entre más servicios actives y más clientes consigas, más comisiones generas.",
    },
    {
      question: "¿Qué pasa si un cliente cancela?",
      answer: "Si un cliente cancela su suscripción, dejas de recibir la comisión correspondiente a ese cliente. Pero tus otros clientes activos siguen generándote ingresos normalmente.",
    },
  ],
  empresas: [
    {
      question: "¿Cómo publico mi servicio?",
      answer: "Crea tu cuenta de empresa, completa el perfil con información de tu servicio (precio, comisión, materiales) y lo revisamos en menos de 24 horas. Una vez aprobado, los vendedores pueden empezar a promocionarlo.",
    },
    {
      question: "¿Cuánto cuesta usar Mensualista?",
      answer: "Mensualista cobra una comisión sobre cada venta realizada. No hay costos fijos mensuales ni pagos por adelantado. Solo pagas cuando vendes.",
    },
    {
      question: "¿Cómo se gestionan los pagos a vendedores?",
      answer: "Mensualista se encarga de todo. Tú nos transfieres el monto de las comisiones y nosotros distribuimos automáticamente a cada vendedor según sus ventas.",
    },
    {
      question: "¿Puedo seleccionar qué vendedores promocionan mi servicio?",
      answer: "Por defecto, todos los vendedores activos pueden ver y promocionar tu servicio. Si necesitas un modelo más exclusivo, contáctanos para opciones personalizadas.",
    },
  ],
  pagos: [
    {
      question: "¿Cuándo recibo mis pagos?",
      answer: "Los pagos se procesan mensualmente, entre el 1 y el 5 de cada mes.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Transferimos a cuentas bancarias colombianas (Bancolombia, Davivienda, Nequi, Daviplata, etc.). Para otros países, usamos transferencias internacionales o billeteras digitales.",
    },
    {
      question: "¿Hay un mínimo para retirar?",
      answer: "Sí, el mínimo para solicitar retiro es de $50.000 COP. Esto nos permite mantener los costos de transacción bajos para todos.",
    },
    {
      question: "¿Cómo veo mis comisiones acumuladas?",
      answer: "En tu dashboard tienes un panel completo donde ves: comisiones pendientes, comisiones disponibles para retiro, historial de pagos y desglose por servicio.",
    },
  ],
};

const categories: { id: FAQCategory; label: string; icon: React.ElementType }[] = [
  { id: "vendedores", label: "Vendedores", icon: Briefcase },
  { id: "empresas", label: "Empresas", icon: Building2 },
  { id: "pagos", label: "Pagos / Comisiones", icon: DollarSign },
];

export const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("vendedores");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F6FF] relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative">
        {/* Header */}
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
            Encuentra respuestas a las dudas más comunes.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIndex(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-[hsl(292,100%,50%)] to-[hsl(287,100%,19%)] text-white"
                  : "bg-background border border-border hover:border-primary/30 text-foreground"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
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
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;