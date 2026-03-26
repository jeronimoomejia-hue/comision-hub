import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { MessageCircle, Clock, HelpCircle, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vendors, companies, CURRENT_VENDOR_ID, CURRENT_COMPANY_ID } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

const faqs = [
  { q: "¿Cuánto tarda en liberarse mi comisión?", a: "Cada producto tiene su propio tiempo de devolución (7, 14 o 30 días), configurado por la empresa. El pago se transfiere automáticamente al cumplirse." },
  { q: "¿Cómo retiro mis comisiones?", a: "Las transferencias son automáticas a tu cuenta bancaria configurada en tu perfil." },
  { q: "¿Qué pasa si rechazan mi venta?", a: "Recibirás una notificación con el motivo. Puedes corregir y volver a enviar." },
  { q: "¿Puedo usar cupones de descuento?", a: "Si la empresa tiene plan Premium o Enterprise, podrás aplicar cupones al registrar ventas." }
];

export default function VendorSupport() {
  const { currentCompanyPlan } = useDemo();
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);

  // Chat only available for Premium/Enterprise
  if (currentCompanyPlan === 'freemium') {
    return (
      <VendorTabLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Chat no disponible</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            El chat con la empresa no está disponible en el plan Freemium. 
            Contacta a {company?.name} directamente.
          </p>
        </div>
      </VendorTabLayout>
    );
  }

  const whatsappNumber = company?.contactPhone?.replace(/\D/g, '') || "573001234567";
  const message = encodeURIComponent(`Hola ${company?.name}, soy ${vendor?.name} (vendedor). Tengo una consulta: `);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <VendorTabLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Chat con {company?.name}</h1>
          <p className="text-muted-foreground">Comunícate directamente con tu empresa</p>
        </div>

        {/* Chat placeholder */}
        <div className="card-premium p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-base font-bold mb-2">Chat en vivo</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Escribe directamente a {company?.name} para resolver dudas sobre productos, ventas o comisiones.
          </p>
          <div className="rounded-xl border border-border bg-card p-8 mb-4">
            <p className="text-xs text-muted-foreground">💬 El chat se habilitará con la integración real. Por ahora, usa WhatsApp:</p>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp con {company?.name}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        {/* Horarios */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Horarios de atención</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
              <span>Lunes a Viernes</span>
              <span className="font-medium">9:00 AM - 7:00 PM</span>
            </div>
            <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
              <span>Sábados</span>
              <span className="font-medium">10:00 AM - 2:00 PM</span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Preguntas frecuentes</h3>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <p className="font-medium mb-1">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorTabLayout>
  );
}
