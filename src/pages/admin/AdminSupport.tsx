import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Search, User, Building2, ExternalLink, Phone } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  userName: string;
  userRole: "vendor" | "company";
  lastMessage: string;
  unread: number;
  messages: ChatMessage[];
}

const mockConversations: Conversation[] = [
  {
    id: "conv-1", userName: "Juan Pérez", userRole: "vendor", lastMessage: "Mi comisión aparece como retenida", unread: 2,
    messages: [
      { id: "m1", sender: "user", text: "Hola, tengo una pregunta sobre mi comisión del servicio IronHaus", time: "10:30" },
      { id: "m2", sender: "support", text: "Hola Juan, claro. Cuéntame, ¿qué necesitas saber?", time: "10:32" },
      { id: "m3", sender: "user", text: "Mi comisión del mes pasado aparece como retenida pero ya pasaron los 14 días", time: "10:33" },
      { id: "m4", sender: "support", text: "Déjame revisar... Tienes razón, voy a escalar esto al equipo financiero. Te aviso en máximo 24 horas.", time: "10:35" },
    ],
  },
  {
    id: "conv-2", userName: "IronHaus", userRole: "company", lastMessage: "¿Cómo agrego más códigos?", unread: 1,
    messages: [
      { id: "m5", sender: "user", text: "Buenos días, necesito agregar más códigos de activación a mi servicio Plan Full Gym", time: "09:15" },
      { id: "m6", sender: "support", text: "Buenos días. Puedes hacerlo desde tu panel: Productos > Plan Full Gym > Códigos > Agregar códigos.", time: "09:18" },
      { id: "m7", sender: "user", text: "¿Cómo agrego más códigos?", time: "09:20" },
    ],
  },
  {
    id: "conv-3", userName: "Ana Martínez", userRole: "vendor", lastMessage: "Gracias por la ayuda", unread: 0,
    messages: [
      { id: "m8", sender: "user", text: "No puedo completar el quiz del servicio de Prana Studio", time: "14:00" },
      { id: "m9", sender: "support", text: "¿Te aparece algún error? ¿Ya usaste tus 3 intentos del mes?", time: "14:05" },
      { id: "m10", sender: "user", text: "Ah sí, ya usé los 3. ¿Cuándo se reinician?", time: "14:06" },
      { id: "m11", sender: "support", text: "Se reinician el primer día del próximo mes. Mientras, puedes repasar el material de capacitación.", time: "14:08" },
      { id: "m12", sender: "user", text: "Gracias por la ayuda", time: "14:10" },
    ],
  },
];

export default function AdminSupport() {
  const [selectedConv, setSelectedConv] = useState<string>(mockConversations[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv = conversations.find(c => c.id === selectedConv);
  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);

  const filteredConvs = conversations.filter(c =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!newMessage.trim() || !activeConv) return;
    const msg: ChatMessage = { id: `m-${Date.now()}`, sender: "support", text: newMessage, time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) };
    setConversations(prev => prev.map(c => c.id === selectedConv ? { ...c, messages: [...c.messages, msg], lastMessage: newMessage, unread: 0 } : c));
    setNewMessage("");
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Soporte</h1>
          <p className="text-xs text-muted-foreground">Gestiona las conversaciones de soporte</p>
        </div>

        <Tabs defaultValue="support">
          <TabsList>
            <TabsTrigger value="support" className="gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              Chats de soporte {totalUnread > 0 && <Badge className="text-[8px] h-4 px-1 bg-primary">{totalUnread}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="mt-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: "calc(100vh - 260px)" }}>
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-72 border-r border-border flex flex-col">
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input placeholder="Buscar..." className="h-8 pl-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredConvs.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => { setSelectedConv(conv.id); setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)); }}
                        className={`w-full p-3 text-left border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedConv === conv.id ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {conv.userRole === "vendor" ? <User className="w-3.5 h-3.5 text-primary" /> : <Building2 className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-foreground truncate">{conv.userName}</p>
                              {conv.unread > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">{conv.unread}</span>}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{conv.lastMessage}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col">
                  {activeConv ? (
                    <>
                      <div className="p-3 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{activeConv.userName}</p>
                          <Badge variant="outline" className="text-[9px]">
                            {activeConv.userRole === "vendor" ? "Vendedor" : "Empresa"}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => toast.info("Abriendo WhatsApp...")}>
                          <Phone className="w-3 h-3" /> WhatsApp
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {activeConv.messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 ${msg.sender === "support" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <p className="text-xs">{msg.text}</p>
                              <p className={`text-[9px] mt-1 ${msg.sender === "support" ? "opacity-60" : "text-muted-foreground"}`}>{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 border-t border-border">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Escribe un mensaje..."
                            className="h-9 text-xs"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                          />
                          <Button size="sm" className="h-9 px-3" onClick={handleSend}>
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                      Selecciona una conversación
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
