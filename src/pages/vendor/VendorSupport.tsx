import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, HelpCircle } from "lucide-react";
import { vendors, CURRENT_VENDOR_ID } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "vendor" | "support";
  text: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  { id: "m1", sender: "vendor", text: "Hola, tengo una pregunta sobre mi comisión del servicio IronHaus", time: "10:30" },
  { id: "m2", sender: "support", text: "Hola Juan, claro. Cuéntame, ¿qué necesitas saber?", time: "10:32" },
  { id: "m3", sender: "vendor", text: "Mi comisión del mes pasado aparece como retenida pero ya pasaron los 14 días", time: "10:33" },
  { id: "m4", sender: "support", text: "Déjame revisar... Tienes razón, voy a escalar esto al equipo financiero. Te aviso en máximo 24 horas.", time: "10:35" },
];

const faqs = [
  { q: "¿Cuánto tarda en liberarse mi comisión?", a: "Depende del tiempo de devolución de cada producto (7, 14 o 30 días)." },
  { q: "¿Cómo retiro mis comisiones?", a: "Las transferencias son automáticas a tu cuenta bancaria." },
  { q: "¿Puedo usar cupones de descuento?", a: "Sí, si la empresa tiene plan Premium o Enterprise." },
];

export default function VendorSupport() {
  const { currentVendorId } = useDemo();
  const vendor = vendors.find(v => v.id === (currentVendorId || CURRENT_VENDOR_ID));
  const firstName = vendor?.name.split(" ")[0] || "Vendedor";

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "vendor",
      text: newMessage,
      time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage("");

    // Simulate support response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `m-${Date.now()}-r`,
          sender: "support",
          text: "Gracias por tu mensaje. Un agente de soporte revisará tu consulta pronto.",
          time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  return (
    <VendorTabLayout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-foreground">Soporte Mensualista</h1>
            <p className="text-[10px] text-muted-foreground">Escríbenos y te responderemos lo antes posible</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">En línea</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.sender === "vendor" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2.5",
                  msg.sender === "vendor"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-foreground border border-border/50"
                )}
              >
                <p className="text-xs leading-relaxed">{msg.text}</p>
                <p className={cn("text-[9px] mt-1", msg.sender === "vendor" ? "opacity-60" : "text-muted-foreground")}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-9 h-9 flex-shrink-0 text-muted-foreground">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Escribe un mensaje..."
              className="h-10 text-xs rounded-xl bg-muted/20 border-border/40"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" className="w-10 h-10 rounded-xl flex-shrink-0" onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* FAQs collapsed */}
        <div className="flex-shrink-0 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Preguntas frecuentes</span>
          </div>
          <div className="space-y-1.5">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg bg-muted/20 p-2.5">
                <p className="text-[11px] font-medium text-foreground">{faq.q}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorTabLayout>
  );
}
