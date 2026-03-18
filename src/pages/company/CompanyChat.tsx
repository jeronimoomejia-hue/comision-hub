import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/contexts/DemoContext";
import { companies, vendors, CURRENT_COMPANY_ID } from "@/data/mockData";

interface Message {
  id: string;
  from: 'company' | 'vendor';
  vendorId: string;
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  { id: '1', from: 'vendor', vendorId: 'vendor-001', text: '¿Cómo funciona el código de activación para Poliza Cotizador?', time: '10:30 AM' },
  { id: '2', from: 'company', vendorId: 'vendor-001', text: 'Hola Juan, el código se genera automáticamente al registrar la venta. Lo recibes por email.', time: '10:35 AM' },
  { id: '3', from: 'vendor', vendorId: 'vendor-001', text: 'Perfecto, gracias! Ya tengo un cliente interesado.', time: '10:36 AM' },
  { id: '4', from: 'vendor', vendorId: 'vendor-002', text: 'Tengo una duda sobre la comisión del Claims Bot', time: '11:00 AM' },
];

export default function CompanyChat() {
  const { currentCompanyPlan } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>('vendor-001');

  if (currentCompanyPlan === 'freemium') {
    return (
      <DashboardLayout role="company" userName={company?.name}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Chat no disponible</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            El chat con vendedores no está disponible en el plan Freemium. Mejora a Premium para habilitarlo.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const vendorChats = [...new Set(messages.map(m => m.vendorId))];
  const filteredMessages = messages.filter(m => m.vendorId === selectedVendor);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      from: 'company',
      vendorId: selectedVendor,
      text: newMessage,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage("");
  };

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Chat con vendedores</h1>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
          {/* Vendor list */}
          <div className="col-span-4 rounded-xl border border-border bg-card overflow-y-auto">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conversaciones</p>
            </div>
            {vendorChats.map(vendorId => {
              const vendor = vendors.find(v => v.id === vendorId);
              const lastMsg = [...messages].reverse().find(m => m.vendorId === vendorId);
              const isActive = selectedVendor === vendorId;
              return (
                <button
                  key={vendorId}
                  onClick={() => setSelectedVendor(vendorId)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{vendor?.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{vendor?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{lastMsg?.text}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">{lastMsg?.time}</span>
                </button>
              );
            })}
          </div>

          {/* Chat area */}
          <div className="col-span-8 rounded-xl border border-border bg-card flex flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 p-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{vendors.find(v => v.id === selectedVendor)?.name}</p>
                <p className="text-[10px] text-muted-foreground">Vendedor activo</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'company' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.from === 'company'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.from === 'company' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
