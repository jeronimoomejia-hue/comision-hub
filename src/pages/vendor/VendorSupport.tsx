import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTutorial from "@/components/PageTutorial";
import { MessageCircle, Phone, Clock, HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vendors, CURRENT_VENDOR_ID } from "@/data/mockData";

const faqs = [
  { q: "¿Cuánto tarda en liberarse mi comisión?", a: "Las comisiones se liberan 14 días después de que la empresa aprueba la venta." },
  { q: "¿Cómo retiro mis comisiones?", a: "Ve a la sección Comisiones y haz clic en 'Retirar'. Puedes elegir entre transferencia bancaria o PayPal." },
  { q: "¿Qué pasa si rechazan mi venta?", a: "Recibirás una notificación con el motivo. Puedes corregir y volver a enviar si aplica." },
  { q: "¿Puedo vender varios servicios?", a: "Sí, puedes vender todos los servicios en los que hayas completado la capacitación requerida." }
];

export default function VendorSupport() {
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);
  const whatsappNumber = "5215512345678";
  const message = encodeURIComponent(`Hola Mensualista, soy ${vendor?.name} (ID ${CURRENT_VENDOR_ID}). Necesito ayuda con: `);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <DashboardLayout role="vendor" userName={vendor?.name}>
      <div className="space-y-6">
        <PageTutorial
          pageId="vendor-support"
          title="Soporte"
          description="Envía tus dudas o problemas y consulta las preguntas frecuentes."
          steps={[
            "Usa WhatsApp para soporte rápido durante horario de atención",
            "Revisa las preguntas frecuentes antes de contactarnos"
          ]}
        />

        <div>
          <h1 className="text-2xl font-bold">Soporte</h1>
          <p className="text-muted-foreground">¿Necesitas ayuda? Estamos para ti</p>
        </div>

        {/* WhatsApp Card */}
        <div className="card-premium p-5 text-center bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-bold mb-2">Soporte por WhatsApp</h2>
          <p className="text-muted-foreground mb-6">Respuesta rápida de nuestro equipo de soporte</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="w-5 h-5 mr-2" />
              Abrir WhatsApp
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
          <p className="text-xs text-muted-foreground mt-3">Horario Ciudad de México (GMT-6)</p>
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

        {/* Contacto alternativo */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Contacto alternativo</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            También puedes escribirnos a <a href="mailto:soporte@mensualista.com" className="text-primary hover:underline">soporte@mensualista.com</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
