import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Crown, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Currency = "EUR" | "COP";

const plans = [
  {
    id: "freemium",
    name: "Freemium",
    icon: Zap,
    priceEUR: 0,
    priceCOP: 0,
    period: "Gratis siempre",
    badge: null,
    feesShort: "15% + pasarela",
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
    badge: "Más popular",
    feesShort: "Solo pasarela",
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
    badge: "Más completo",
    feesShort: "Solo pasarela",
    cta: "Elegir Enterprise",
    variant: "default" as const,
  },
];

type FeatureValue = boolean | string;

interface ComparisonRow {
  feature: string;
  freemium: FeatureValue;
  premium: FeatureValue;
  enterprise: FeatureValue;
}

interface ComparisonGroup {
  category: string;
  rows: ComparisonRow[];
}

const comparisonData: ComparisonGroup[] = [
  {
    category: "Servicios",
    rows: [
      { feature: "Límite de servicios", freemium: "5", premium: "Ilimitados", enterprise: "Ilimitados" },
      { feature: "Códigos de activación manuales", freemium: true, premium: true, enterprise: true },
      { feature: "Códigos automáticos (API)", freemium: false, premium: false, enterprise: true },
    ],
  },
  {
    category: "Vendedores",
    rows: [
      { feature: "Panel de vendedores", freemium: "Básico", premium: "Avanzado", enterprise: "Avanzado" },
      { feature: "Cupones de descuento", freemium: false, premium: true, enterprise: true },
      { feature: "Chat vendedor-empresa", freemium: false, premium: true, enterprise: true },
    ],
  },
  {
    category: "Marca",
    rows: [
      { feature: "Personalización", freemium: "Básica", premium: "Completa", enterprise: "Completa" },
      { feature: "Dominio personalizado", freemium: false, premium: false, enterprise: true },
      { feature: "Integraciones API", freemium: false, premium: false, enterprise: true },
    ],
  },
  {
    category: "Comisiones",
    rows: [
      { feature: "Fee Mensualista", freemium: "15%", premium: "0%", enterprise: "0%" },
      { feature: "Costos de pasarela", freemium: "3% + $1.000", premium: "3% + $1.000", enterprise: "3% + $1.000" },
    ],
  },
];

const CellValue = ({ value }: { value: FeatureValue }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-success mx-auto" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
};

export const PricingSection = () => {
  const [currency, setCurrency] = useState<Currency>("COP");

  const formatPrice = (plan: (typeof plans)[0]) => {
    if (plan.priceEUR === 0) return "Gratis";
    if (currency === "EUR") return `€${plan.priceEUR}`;
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-4 border border-border">
            Planes y precios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Elige tu plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Sin contratos. Cancela cuando quieras.
          </p>
        </motion.div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
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

        {/* Compact Plan Cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`relative rounded-2xl p-6 text-center ${
                plan.id === "premium"
                  ? "border-2 border-primary shadow-xl bg-card scale-[1.03]"
                  : "card-premium"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-3">
                <plan.icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-1">
                <span className="text-3xl font-bold text-foreground">{formatPrice(plan)}</span>
                {plan.priceEUR > 0 && (
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-xs text-primary font-medium mb-5">{plan.feesShort}</p>

              <Link to="/auth?mode=register&role=company">
                <Button className="w-full group" variant={plan.variant} size="default">
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Compara los planes
          </h3>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[600px]">
              {/* Table Header */}
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-4 pr-4 w-[40%]" />
                  <th className="text-center text-sm font-semibold text-foreground pb-4 px-3 w-[20%]">Freemium</th>
                  <th className="text-center text-sm font-semibold pb-4 px-3 w-[20%]">
                    <span className="text-primary">Premium</span>
                  </th>
                  <th className="text-center text-sm font-semibold text-foreground pb-4 px-3 w-[20%]">Enterprise</th>
                </tr>
              </thead>

              <tbody>
                {comparisonData.map((group) => (
                  <>
                    {/* Category header */}
                    <tr key={`cat-${group.category}`}>
                      <td
                        colSpan={4}
                        className="pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {group.category}
                      </td>
                    </tr>

                    {/* Rows */}
                    {group.rows.map((row) => (
                      <tr key={row.feature} className="border-t border-border/50">
                        <td className="py-3 pr-4 text-sm text-foreground">{row.feature}</td>
                        <td className="py-3 px-3 text-center">
                          <CellValue value={row.freemium} />
                        </td>
                        <td className="py-3 px-3 text-center bg-primary/5 border-x border-primary/10">
                          <CellValue value={row.premium} />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <CellValue value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
