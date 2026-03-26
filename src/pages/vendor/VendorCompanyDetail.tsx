import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { companies, services as allServices, formatCOP, CURRENT_VENDOR_ID } from "@/data/mockData";
import { Search, Package, Star, RefreshCw, Zap, Lock, Clock, Shield, BookOpen, MessageCircle, Tag, ShoppingCart, ChevronRight, ChevronDown, Send, Copy, Info, Globe, Mail, Phone, Building2, ExternalLink, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TransactionCard from "@/components/TransactionCard";
import StatusGuide from "@/components/StatusGuide";
import { categoryCovers, industryCover } from "@/data/coverImages";

type CompanyTab = 'acerca' | 'productos' | 'ventas' | 'cupones' | 'chat';

export default function VendorCompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const { sales, trainingProgress, commissions, refundRequests, currentVendorId, addSale } = useDemo();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CompanyTab>('acerca');
  const [saleDialogService, setSaleDialogService] = useState<string | null>(null);

  const company = companies.find(c => c.id === companyId);
  if (!company) return <VendorTabLayout backTo="/vendor" backLabel="Inicio"><p>Empresa no encontrada</p></VendorTabLayout>;

  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const isPremiumOrHigher = company.plan !== 'freemium';

  const getTrainingStatus = (serviceId: string) => {
    const training = trainingProgress.find(tp => tp.vendorId === vendorId && tp.serviceId === serviceId);
    return training?.status === 'declared_completed';
  };

  const companyServices = allServices.filter(s => s.status === 'activo' && s.companyId === companyId);
  const vendorSales = sales.filter(s => s.vendorId === vendorId && s.companyId === companyId);

  const vendorServices = companyServices.map(service => {
    const isActive = !service.requiresTraining || getTrainingStatus(service.id);
    const salesCount = vendorSales.filter(s => s.serviceId === service.id).length;
    return { ...service, isActive, salesCount };
  });

  const sortedServices = [...vendorServices].sort((a, b) => b.salesCount - a.salesCount);
  const topServiceIds = sortedServices.slice(0, 3).filter(s => s.salesCount > 0).map(s => s.id);

  const filteredServices = sortedServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalesAmount = vendorSales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + s.sellerCommissionAmount, 0);

  // Check if vendor has ANY trained product
  const hasAnyTrainedProduct = vendorServices.some(s => s.isActive);

  const tabs: { id: CompanyTab; label: string; icon: React.ElementType; planRequired?: boolean }[] = [
    { id: 'acerca', label: 'Acerca de', icon: Info },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'cupones', label: 'Cupones', icon: Tag, planRequired: true },
    { id: 'chat', label: 'Chat', icon: MessageCircle, planRequired: true },
  ];

  const visibleTabs = tabs.filter(t => !t.planRequired || isPremiumOrHigher);

  return (
    <VendorTabLayout backTo="/vendor" backLabel="Empresas">
      <div className="space-y-4">
        {/* Company Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
          >
            <span className="text-white font-bold text-xl">{company.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">{company.name}</h1>
              <Badge variant="outline" className="text-[9px]">{company.plan}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{company.industry}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Productos</p>
            <p className="text-base font-bold text-foreground">{companyServices.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Mis ventas</p>
            <p className="text-base font-bold text-foreground">{vendorSales.filter(s => s.status !== 'REFUNDED').length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Comisiones</p>
            <p className="text-base font-bold text-primary">{formatCOP(totalSalesAmount)}</p>
          </div>
        </div>

        {/* Internal Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'acerca' && (
          <AcercaTab company={company} companyServices={companyServices} />
        )}

        {activeTab === 'productos' && (
          <ProductosTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredServices={filteredServices}
            topServiceIds={topServiceIds}
            companyId={companyId!}
          />
        )}

        {activeTab === 'ventas' && (
          <VentasTab vendorSales={vendorSales} companyId={companyId!} />
        )}

        {activeTab === 'cupones' && (
          <CuponesTab companyName={company.name} companyServices={companyServices} />
        )}

        {activeTab === 'chat' && (
          <ChatTab companyName={company.name} />
        )}
      </div>

      {/* Sticky bottom: Register sale or Train */}
      <div className="sticky bottom-16 z-40 pt-3 pb-1 bg-gradient-to-t from-background via-background to-transparent -mx-4 px-4 sm:-mx-6 sm:px-6">
        {hasAnyTrainedProduct ? (
          <Button
            className="w-full h-10 text-xs font-semibold rounded-xl"
            onClick={() => {
              const firstActive = vendorServices.find(s => s.isActive);
              if (firstActive) navigate(`/vendor/company/${companyId}/service/${firstActive.id}`);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Registrar venta
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button className="flex-1 h-10 text-xs rounded-xl" disabled>
              <Lock className="w-3 h-3 mr-1.5" /> Registrar venta
            </Button>
            <Button
              variant="outline"
              className="h-10 text-xs rounded-xl border-amber-400 text-amber-700"
              onClick={() => {
                const firstService = companyServices[0];
                if (firstService) navigate(`/vendor/trainings/${firstService.id}`);
              }}
            >
              <BookOpen className="w-3 h-3 mr-1.5" /> Capacitarse
            </Button>
          </div>
        )}
      </div>
    </VendorTabLayout>
  );
}

/* =========== Sub-components =========== */

const companyDescriptions: Record<string, { tagline: string; description: string; founded: string; employees: string; highlights: string[]; communication: string; communicationNote: string }> = {
  'company-001': { tagline: 'Transformando el sector asegurador con IA', description: 'Poliza.ai automatiza la cotización, emisión y gestión de pólizas usando modelos de IA entrenados con datos del mercado colombiano. Reducimos el tiempo de cotización de horas a segundos.', founded: '2023', employees: '45', highlights: ['Motor de cotización con IA', 'Integración con aseguradoras top', 'Dashboard de análisis predictivo'], communication: 'WhatsApp', communicationNote: 'Los clientes prefieren WhatsApp para consultas rápidas de cotización' },
  'company-004': { tagline: 'Cierra más ventas con asistencia inteligente', description: 'Cierro es un copiloto de ventas que analiza conversaciones, sugiere respuestas y predice el cierre de deals usando machine learning.', founded: '2024', employees: '15', highlights: ['Copiloto de ventas en tiempo real', 'Predicción de cierre de deals', 'CRM integrado con IA'], communication: 'Email', communicationNote: 'Los prospectos corporativos responden mejor por email profesional' },
  'company-005': { tagline: 'Atención al cliente que nunca duerme', description: 'Asista despliega agentes de IA que atienden consultas, resuelven problemas y escalan inteligentemente. Reducimos costos de soporte un 60%.', founded: '2022', employees: '52', highlights: ['Agentes conversacionales 24/7', 'Escalamiento inteligente', 'Integración omnicanal'], communication: 'Video llamada', communicationNote: 'Demos en vivo por video aumentan la conversión un 40%' },
  'company-009': { tagline: 'El gimnasio boutique que transforma', description: 'IronHaus es un gimnasio premium con equipos de última generación, entrenadores certificados y programas personalizados. Más de 2,000 miembros activos en Bogotá.', founded: '2020', employees: '35', highlights: ['Equipos Technogym de última generación', 'Entrenadores certificados NSCA', 'Clases grupales y personalizadas'], communication: 'WhatsApp', communicationNote: 'Los clientes del gimnasio prefieren WhatsApp para agendar clases y membresías' },
  'company-010': { tagline: 'Conecta con tu cuerpo, transforma tu vida', description: 'Prana Studio ofrece clases de yoga, meditación y bienestar en espacios diseñados para la calma. Retiros en la naturaleza y formación de profesores certificada Yoga Alliance.', founded: '2019', employees: '22', highlights: ['Clases: Vinyasa, Hatha, Yin, Meditación', 'Retiros wellness de 3 y 7 días', 'Teacher Training 200h certificado'], communication: 'Instagram DM', communicationNote: 'La comunidad de yoga se mueve mayormente por Instagram' },
  'company-011': { tagline: 'Tu santuario de bienestar y relajación', description: 'Vitalik Wellness combina terapias ancestrales con tecnología moderna. Circuitos de spa, masajes terapéuticos y programas de desintoxicación en un ambiente de lujo.', founded: '2021', employees: '28', highlights: ['Circuito spa completo', 'Masajes terapéuticos y relajantes', 'Programas de detox y nutrición'], communication: 'Teléfono', communicationNote: 'Los clientes de spa prefieren llamar para agendar citas' },
  'company-012': { tagline: 'Belleza premium, experiencia única', description: 'Salón Élite redefine la experiencia de belleza con estilistas internacionales, productos de lujo y un ambiente exclusivo. Especialistas en novias, color y tratamientos capilares.', founded: '2018', employees: '18', highlights: ['Estilistas con formación internacional', 'Productos Wella y L\'Oréal Professionnel', 'Experiencia VIP para novias'], communication: 'WhatsApp', communicationNote: 'Agendamiento rápido por WhatsApp para citas de belleza' },
  'company-013': { tagline: 'Deporte, sol y arena', description: 'Arena Beach Club ofrece canchas de vóley playa y fútbol playa con bar y zona lounge. Torneos semanales y clases para principiantes.', founded: '2022', employees: '12', highlights: ['Canchas profesionales', 'Torneos semanales', 'Bar y zona lounge'], communication: 'WhatsApp', communicationNote: 'Reservas de canchas rápidas por WhatsApp' },
};

function AcercaTab({ company, companyServices }: { company: any; companyServices: Array<any> }) {
  const info = companyDescriptions[company.id] || { tagline: `Soluciones de ${company.industry}`, description: `${company.name} ofrece soluciones innovadoras en el sector de ${company.industry}.`, founded: '2023', employees: '20+', highlights: ['Tecnología de punta', 'Soporte dedicado', 'Resultados medibles'], communication: 'WhatsApp', communicationNote: 'Canal principal de comunicación' };
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (id: string) => setExpandedSection(prev => prev === id ? null : id);
  const coverImg = industryCover[company.industry];

  return (
    <div className="space-y-3">
      {/* Hero image + description */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="relative h-36 overflow-hidden">
          <img src={coverImg} alt={company.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white/60 text-[9px] uppercase tracking-widest">{company.industry}</p>
            <p className="text-white text-sm font-semibold leading-snug">{info.tagline}</p>
          </div>
        </div>
        <div className="p-3.5">
          <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
        </div>
      </div>

      {/* Communication mode */}
      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3.5">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Canal de comunicación preferido</p>
        <p className="text-sm font-semibold text-foreground mt-1">{info.communication}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{info.communicationNote}</p>
      </div>

      {/* Products overview */}
      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Productos disponibles</p>
        <div className="space-y-2">
          {companyServices.slice(0, 4).map(s => {
            const isRecurring = s.type === 'suscripción';
            const earn = Math.round(s.priceCOP * s.vendorCommissionPct / 100);
            return (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isRecurring ? <RefreshCw className="w-3 h-3 text-blue-500 flex-shrink-0" /> : <Zap className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  <span className="text-xs text-foreground truncate">{s.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-primary flex-shrink-0 ml-2">{formatCOP(earn)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company details - collapsible */}
      <button
        onClick={() => toggleSection('details')}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Detalles</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedSection === 'details' ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === 'details' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Fundada', value: info.founded },
              { label: 'Equipo', value: `${info.employees} personas` },
              { label: 'País', value: company.country },
              { label: 'Plan', value: company.plan },
            ].map(item => (
              <div key={item.label} className="p-2.5 rounded-xl border border-border bg-card">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Destacados</p>
            {info.highlights.map((h: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-[11px] text-foreground">{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact - collapsible */}
      <button
        onClick={() => toggleSection('contact')}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Contacto</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedSection === 'contact' ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === 'contact' && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {company.contactEmail && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-foreground">{company.contactEmail}</span>
            </div>
          )}
          {company.contactPhone && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-foreground">{company.contactPhone}</span>
            </div>
          )}
          {company.websiteUrl && (
            <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                <span className="text-[11px] text-foreground">{company.websiteUrl}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ProductosTab({ searchQuery, setSearchQuery, filteredServices, topServiceIds, companyId }: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredServices: Array<any>;
  topServiceIds: string[];
  companyId: string;
}) {
  const navigate = useNavigate();
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-card border-border rounded-xl text-sm"
        />
      </div>

      {filteredServices.length > 0 ? (
        <div className="space-y-2.5">
          {filteredServices.map((service) => {
            const isPopular = topServiceIds.includes(service.id);
            const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
            const coverImg = categoryCovers[service.category];
            const isRecurring = service.type === 'suscripción';
            const isPreviewOpen = expandedPreview === service.id;

            return (
              <div key={service.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div
                  onClick={() => {
                    if (service.isActive) {
                      navigate(`/vendor/company/${companyId}/service/${service.id}`);
                    } else {
                      setExpandedPreview(isPreviewOpen ? null : service.id);
                    }
                  }}
                  className={`flex gap-0 cursor-pointer group hover:bg-muted/20 transition-colors ${
                    !service.isActive ? 'opacity-80' : ''
                  }`}
                >
                  <div className="relative w-20 sm:w-24 flex-shrink-0 overflow-hidden">
                    <img src={coverImg} alt={service.category} className="w-full h-full object-cover min-h-[72px]" loading="lazy" />
                    {!service.isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{service.name}</h3>
                      {isPopular && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                          <Star className="w-2 h-2" fill="currentColor" /> Top
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{service.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {isRecurring ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                          <RefreshCw className="w-2 h-2" /> Mensual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          <Zap className="w-2 h-2" /> Único
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-primary">{formatCOP(earningsPerSale)}</span>
                      <span className="text-[9px] text-muted-foreground">/venta</span>
                    </div>
                  </div>
                  <div className="flex items-center pr-3">
                    {service.isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    ) : (
                      <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${isPreviewOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </div>

                {/* Expanded preview for inactive products */}
                {!service.isActive && isPreviewOpen && (
                  <div className="border-t border-border p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200 bg-muted/10">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{service.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg border border-border bg-card">
                        <p className="text-[9px] text-muted-foreground uppercase">Precio</p>
                        <p className="text-xs font-semibold text-foreground">{formatCOP(service.priceCOP)}{isRecurring ? '/mes' : ''}</p>
                      </div>
                      <div className="p-2 rounded-lg border border-border bg-card">
                        <p className="text-[9px] text-muted-foreground uppercase">Tu comisión</p>
                        <p className="text-xs font-semibold text-primary">{formatCOP(earningsPerSale)} ({service.vendorCommissionPct}%)</p>
                      </div>
                      <div className="p-2 rounded-lg border border-border bg-card">
                        <p className="text-[9px] text-muted-foreground uppercase">Devolución</p>
                        <p className="text-xs font-medium text-foreground">{service.refundPolicy.refundWindowDays} días · {service.refundPolicy.autoRefund ? 'Auto' : 'Manual'}</p>
                      </div>
                      <div className="p-2 rounded-lg border border-border bg-card">
                        <p className="text-[9px] text-muted-foreground uppercase">Entrenamiento</p>
                        <p className="text-xs font-medium text-foreground">{service.trainingType === 'video' ? 'Video' : 'PDF'}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full h-8 text-[11px] rounded-lg"
                      onClick={(e) => { e.stopPropagation(); navigate(`/vendor/trainings/${service.id}`); }}
                    >
                      <BookOpen className="w-3 h-3 mr-1.5" /> Iniciar capacitación
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs font-medium text-foreground">Sin resultados</p>
        </div>
      )}
    </div>
  );
}

function VentasTab({ vendorSales, companyId }: { vendorSales: Array<any>; companyId: string }) {
  const activeSales = vendorSales.filter(s => s.status !== 'REFUNDED');

  return (
    <div className="space-y-3">
      <StatusGuide />
      <p className="text-[11px] text-muted-foreground">{activeSales.length} venta{activeSales.length !== 1 ? 's' : ''} activa{activeSales.length !== 1 ? 's' : ''}</p>
      {vendorSales.length > 0 ? (
        <div className="space-y-2">
          {vendorSales.map(sale => {
            const svc = allServices.find(s => s.id === sale.serviceId);
            return (
              <TransactionCard
                key={sale.id}
                id={sale.id}
                clientName={sale.clientName}
                clientEmail={sale.clientEmail}
                serviceName={svc?.name}
                serviceCategory={svc?.category}
                amount={sale.grossAmount}
                commission={sale.sellerCommissionAmount}
                platformFee={sale.mensualistaFeeAmount}
                netAmount={sale.providerNetAmount}
                status={sale.status}
                statusType="sale"
                date={sale.createdAt}
                holdEndDate={sale.holdEndAt}
                releasedDate={sale.releasedAt}
                activationCode={sale.activationCode}
                isSubscription={sale.isSubscription}
                paymentId={sale.mpPaymentId}
                role="vendor"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 rounded-xl border border-border bg-card">
          <ShoppingCart className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs font-medium text-foreground">Sin ventas aún</p>
        </div>
      )}
    </div>
  );
}

function CuponesTab({ companyName, companyServices }: { companyName: string; companyServices: Array<any> }) {
  const mockCoupons = [
    { id: '1', code: 'NUEVO20', discount: 20, type: 'percent' as const, validUntil: '2026-04-30', usesLeft: 15, maxUses: 50, serviceId: companyServices[0]?.id },
    { id: '2', code: 'PROMO50K', discount: 50000, type: 'fixed' as const, validUntil: '2026-05-15', usesLeft: 5, maxUses: 10, serviceId: companyServices[1]?.id },
    { id: '3', code: 'LANZAMIENTO', discount: 10, type: 'percent' as const, validUntil: '2026-06-01', usesLeft: 50, maxUses: 100 },
  ];

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código copiado`);
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">{mockCoupons.length} cupones de {companyName}</p>
      <div className="space-y-2">
        {mockCoupons.map(coupon => {
          const linkedService = coupon.serviceId ? companyServices.find((s: any) => s.id === coupon.serviceId) : null;
          const usagePercent = Math.round(((coupon.maxUses - coupon.usesLeft) / coupon.maxUses) * 100);
          const discountLabel = coupon.type === 'percent' ? `${coupon.discount}%` : formatCOP(coupon.discount);

          return (
            <div key={coupon.id} className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-bold text-foreground tracking-wide">{coupon.code}</code>
                  <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{discountLabel} off</span>
                </div>
                <button onClick={() => copyCoupon(coupon.code)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                  <span>{coupon.maxUses - coupon.usesLeft}/{coupon.maxUses} usos</span>
                  <span>Hasta {new Date(coupon.validUntil).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${usagePercent}%` }} />
                </div>
              </div>
              {linkedService && <p className="text-[10px] text-muted-foreground">Aplica a: {linkedService.name}</p>}
              <button
                onClick={() => toast.success(`Venta con cupón ${coupon.code}`, { description: 'Dirígete al producto para registrar la venta' })}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <ShoppingCart className="w-3 h-3" /> Registrar venta con cupón
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatTab({ companyName }: { companyName: string }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: '1', from: 'company', text: `Bienvenido al equipo de ${companyName}. ¿Podemos ayudarte?`, time: '10:30' },
    { id: '2', from: 'vendor', text: 'Hola, tengo una duda sobre el producto de cotizaciones.', time: '10:32' },
    { id: '3', from: 'company', text: 'Claro, cuéntame. Estoy aquí para ayudarte.', time: '10:33' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(), from: 'vendor', text: message.trim(),
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), from: 'company', text: 'Gracias por tu mensaje. Te responderemos pronto.',
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: '380px' }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'vendor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 ${
              msg.from === 'vendor' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              <p className="text-xs leading-relaxed">{msg.text}</p>
              <p className={`text-[8px] mt-0.5 ${msg.from === 'vendor' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-2.5 flex items-center gap-2">
        <Input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe un mensaje..." className="flex-1 h-8 text-xs rounded-full bg-muted/50 border-0" />
        <Button size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={sendMessage} disabled={!message.trim()}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
