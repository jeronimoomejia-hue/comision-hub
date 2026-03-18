import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Crown, Zap, Building2, MessageCircle, Globe, Tag, Code, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Currency = "EUR" | "COP";

const EXCHANGE_RATE = 4600; // Approx EUR to COP

const plans = [
  {
    id: "freemium",
    name: "Freemium",
    icon: Zap,
    priceEUR: 0,
    priceCOP: 0,
    period: "Gratis para siempre",
    description: "Ideal para negocios pequeños que quieren empezar sin inversión.",
    badge: null,
    features: [
      { text: "Máximo 5 servicios", included: true },
      { text: "Personalización básica (logo y colores)", included: true },
      { text: "Panel de vendedores", included: true },
      { text: "Reportes básicos", included: true },
      { text: "Códigos de activación manuales", included: true },
      { text: "Cupones de descuento", included: false },
      { text: "Chat vendedor-empresa", included: false },
      { text: "Integración automática de códigos", included: false },
      { text: "Dominio personalizado", included: false },
    ],
    fees: "15% fee Mensualista + 3% + $1.000 COP por transferencia",
    feesShort: "15% + costos de pasarela",
    cta: "Empezar gratis",
    variant: "outline" as const,
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    priceEUR: 100,
    priceCOP: 460000,
    period: "/mes",
    description: "Para empresas que necesitan funciones avanzadas y sin fee por venta.",
    badge: "Más popular",
    features: [
      { text: "Servicios ilimitados", included: true },
      { text: "Personalización completa", included: true },
      { text: "Panel de vendedores avanzado", included: true },
      { text: "Reportes detallados", included: true },
      { text: "Códigos de activación manuales", included: true },
      { text: "Cupones de descuento para vendedores", included: true },
      { text: "Chat vendedor-empresa", included: true },
      { text: "Integración automática de códigos", included: false },
      { text: "Dominio personalizado", included: false },
    ],
    fees: "Solo 3% + $1.000 COP por transferencia (costos de pasarela)",
    feesShort: "Solo costos de pasarela",
    cta: "Elegir Premium",
    variant: "default" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    priceEUR: 300,
    priceCOP: 1380000,
    period: "/mes",
    description: "Para empresas digitales con integración automática y marca blanca.",
    badge: "Más completo",
    features: [
      { text: "Servicios ilimitados", included: true },
      { text: "Personalización completa", included: true },
      { text: "Panel de vendedores avanzado", included: true },
      { text: "Reportes detallados", included: true },
      { text: "Integración automática de códigos", included: true },
      { text: "Cupones de descuento para vendedores", included: true },
      { text: "Chat vendedor-empresa", included: true },
      { text: "Dominio personalizado (marca blanca)", included: true },
      { text: "Integraciones API personalizadas", included: true },
    ],
    fees: "Solo 3% + $1.000 COP por transferencia (costos de pasarela)",
    feesShort: "Solo costos de pasarela",
    cta: "Elegir Enterprise",
    variant: "default" as const,
  },
];

export const PricingSection = () => {
  const [currency, setCurrency] = useState<Currency>("EUR");

  const formatPrice = (plan: typeof plans[0]) => {
    if (plan.priceEUR === 0) return "Gratis";
    if (currency === "EUR") {
      return `€${plan.priceEUR}`;
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(plan.priceCOP);
  };

  return (
    <section id="planes" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            Planes y precios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Un plan para cada tipo de empresa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Desde negocios pequeños hasta empresas digitales con miles de vendedores.
          </p>
        </motion.div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4F0FA] border border-border">
            <button
              onClick={() => setCurrency("COP")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currency === "COP"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇨🇴 COP
            </button>
            <button
              onClick={() => setCurrency("EUR")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currency === "EUR"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇪🇺 EUR
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.id === "premium"
                  ? "border-2 border-primary shadow-xl bg-card scale-[1.02]"
                  : "card-premium"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FA] flex items-center justify-center">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">{formatPrice(plan)}</span>
                {plan.priceEUR > 0 && (
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-xs text-primary font-medium mb-4">{plan.feesShort}</p>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <Link to="/auth?mode=register&role=company">
                <Button
                  className="w-full group mb-6"
                  variant={plan.variant}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground">{plan.fees}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
