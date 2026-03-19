import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Users, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    name: "Poliza IA",
    logo: "B",
    logoGradient: "from-[#5B6FE0] to-[#4A5BC7]",
    industry: "Atención al cliente",
    price: 299000,
    commission: 15,
    description: "Asistente virtual con IA para negocios. Responde preguntas, agenda citas y mejora la atención 24/7.",
    features: ["Chat en tiempo real", "Integración WhatsApp", "Panel de métricas", "Soporte prioritario"],
  },
  {
    id: 2,
    name: "DataSync Pro",
    logo: "D",
    logoGradient: "from-[#00B87A] to-[#009965]",
    industry: "Productividad",
    price: 189000,
    commission: 12,
    description: "Sincronización automática de datos entre aplicaciones empresariales.",
    features: ["500+ integraciones", "Sincronización en tiempo real", "Backups automáticos", "API personalizada"],
  },
  {
    id: 3,
    name: "CRM Plus",
    logo: "C",
    logoGradient: "from-primary to-[hsl(287,100%,19%)]",
    industry: "Ventas",
    price: 449000,
    commission: 18,
    description: "Sistema CRM completo para equipos de ventas con automatización de pipelines.",
    features: ["Gestión de leads", "Automatización de emails", "Reportes avanzados", "App móvil"],
  },
  {
    id: 4,
    name: "FacturaYA",
    logo: "F",
    logoGradient: "from-[#F59E0B] to-[#D97706]",
    industry: "Contabilidad",
    price: 99000,
    commission: 10,
    description: "Facturación electrónica DIAN simplificada para empresas colombianas.",
    features: ["Facturación DIAN", "Reportes tributarios", "Multi-usuario", "Soporte contable"],
  },
  {
    id: 5,
    name: "Nómina Express",
    logo: "N",
    logoGradient: "from-[#E5294A] to-[#C91D3D]",
    industry: "Recursos Humanos",
    price: 249000,
    commission: 14,
    description: "Gestión de nómina y recursos humanos automatizada.",
    features: ["Liquidación automática", "Portal empleados", "Control de asistencia", "Reportes legales"],
  },
  {
    id: 6,
    name: "MarketBot",
    logo: "M",
    logoGradient: "from-[#5B6FE0] to-[#3D4FC2]",
    industry: "Marketing",
    price: 349000,
    commission: 16,
    description: "Automatización de marketing digital con IA para redes sociales.",
    features: ["Programación posts", "Análisis de audiencia", "Generación de contenido", "Multi-plataforma"],
  },
];

export const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section id="gigs" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F4F0FA] text-primary text-sm font-medium mb-4 border border-border">
            Mensualista Servicios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Comisiones recurrentes vendiendo suscripciones
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elige entre docenas de gigs digitales de empresas verificadas y gana cada mes.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 text-primary" />
            <span>Comisión mensual</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>Clientes recurrentes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Seguimiento en dashboard</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium p-6 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.logoGradient} flex items-center justify-center text-white font-bold text-lg`}
                >
                  {service.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <p className="text-xs text-muted-foreground">{service.industry}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Precio mensual</span>
                  <span className="font-medium text-foreground">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tu comisión</span>
                  <span className="font-bold text-primary">{service.commission}% recurrente</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedService(service)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver detalles
              </Button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/auth?mode=register&role=vendor">
            <Button size="lg" className="px-10 group">
              Entrar a Servicios
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Service Details Modal */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-4">
              {selectedService && (
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedService.logoGradient} flex items-center justify-center text-white font-bold text-xl`}
                >
                  {selectedService.logo}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl">{selectedService?.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedService?.industry}</p>
              </div>
            </div>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-6">
              <p className="text-muted-foreground">{selectedService.description}</p>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#F4F0FA]">
                <div>
                  <p className="text-sm text-muted-foreground">Precio mensual</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(selectedService.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tu comisión</p>
                  <p className="text-xl font-bold text-primary">{selectedService.commission}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-foreground">Qué incluye</h4>
                <ul className="space-y-2">
                  {selectedService.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/auth?mode=register&role=vendor" className="block">
                <Button className="w-full">
                  Elegir este servicio
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ServicesSection;