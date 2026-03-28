import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { companies, services as allServices, formatCOP, CURRENT_VENDOR_ID } from "@/data/mockData";
import { Search, Package, Star, RefreshCw, Zap, Lock, Clock, Shield, BookOpen, MessageCircle, Tag, ShoppingCart, ChevronRight, ChevronDown, Send, Copy, Info, Globe, MapPin, Instagram, Facebook, Building2, ExternalLink, Crown } from "lucide-react";
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
  const { sales, trainingProgress, commissions, refundRequests, currentVendorId } = useDemo();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CompanyTab>('acerca');

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
    </VendorTabLayout>
  );
}

/* =========== Sub-components =========== */

const companyInfo: Record<string, {
  tagline: string; description: string; founded: string; employees: string;
  highlights: string[]; communication: string; communicationNote: string;
  address?: string; socialLinks: { type: string; url: string; label: string }[];
}> = {
  'company-001': { tagline: 'Transformando el sector asegurador con IA', description: 'Poliza.ai automatiza la cotización, emisión y gestión de pólizas usando modelos de IA entrenados con datos del mercado colombiano.', founded: '2023', employees: '45', highlights: ['Motor de cotización con IA', 'Integración con aseguradoras top', 'Dashboard predictivo'], communication: 'WhatsApp', communicationNote: 'Consultas rápidas de cotización', address: undefined, socialLinks: [{ type: 'web', url: 'https://poliza.ai', label: 'poliza.ai' }, { type: 'instagram', url: 'https://instagram.com/poliza.ai', label: '@poliza.ai' }] },
  'company-004': { tagline: 'Cierra más ventas con asistencia inteligente', description: 'Cierro es un copiloto de ventas que analiza conversaciones, sugiere respuestas y predice el cierre de deals.', founded: '2024', employees: '15', highlights: ['Copiloto en tiempo real', 'Predicción de cierre', 'CRM con IA'], communication: 'Email', communicationNote: 'Prospectos corporativos', address: undefined, socialLinks: [{ type: 'web', url: 'https://cierro.co', label: 'cierro.co' }, { type: 'instagram', url: 'https://instagram.com/cierro.co', label: '@cierro.co' }] },
  'company-005': { tagline: 'Atención al cliente que nunca duerme', description: 'Asista despliega agentes de IA para atención al cliente. Reducimos costos de soporte un 60%.', founded: '2022', employees: '52', highlights: ['Agentes 24/7', 'Escalamiento inteligente', 'Omnicanal'], communication: 'Video llamada', communicationNote: 'Demos en vivo por video', address: undefined, socialLinks: [{ type: 'web', url: 'https://asista.co', label: 'asista.co' }, { type: 'facebook', url: 'https://facebook.com/asista', label: 'Asista' }] },
  'company-009': { tagline: 'El gimnasio boutique que transforma', description: 'IronHaus es un gimnasio premium con equipos de última generación, entrenadores certificados y programas personalizados. Más de 2,000 miembros activos.', founded: '2020', employees: '35', highlights: ['Equipos Technogym', 'Entrenadores NSCA', 'Clases grupales'], communication: 'WhatsApp', communicationNote: 'Agendamiento de clases y membresías', address: 'Calle 85 #11-53, Bogotá', socialLinks: [{ type: 'web', url: 'https://ironhaus.co', label: 'ironhaus.co' }, { type: 'instagram', url: 'https://instagram.com/ironhaus.co', label: '@ironhaus.co' }, { type: 'facebook', url: 'https://facebook.com/ironhausgym', label: 'IronHaus Gym' }] },
  'company-010': { tagline: 'Conecta con tu cuerpo, transforma tu vida', description: 'Prana Studio ofrece clases de yoga, meditación y bienestar. Retiros en la naturaleza y formación certificada Yoga Alliance.', founded: '2019', employees: '22', highlights: ['Vinyasa, Hatha, Yin', 'Retiros de 3 y 7 días', 'Teacher Training 200h'], communication: 'Instagram DM', communicationNote: 'La comunidad se mueve por Instagram', address: 'Carrera 7 #67-21, Bogotá', socialLinks: [{ type: 'web', url: 'https://pranastudio.co', label: 'pranastudio.co' }, { type: 'instagram', url: 'https://instagram.com/pranastudio', label: '@pranastudio' }] },
  'company-011': { tagline: 'Tu santuario de bienestar', description: 'Vitalik Wellness combina terapias ancestrales con tecnología moderna. Spa, masajes y programas de desintoxicación en ambiente de lujo.', founded: '2021', employees: '28', highlights: ['Circuito spa completo', 'Masajes terapéuticos', 'Programas detox'], communication: 'Teléfono', communicationNote: 'Citas por llamada telefónica', address: 'Calle 93 #14-20, Bogotá', socialLinks: [{ type: 'web', url: 'https://vitalik.co', label: 'vitalik.co' }, { type: 'instagram', url: 'https://instagram.com/vitalikwellness', label: '@vitalikwellness' }] },
  'company-012': { tagline: 'Belleza premium, experiencia única', description: 'Salón Élite redefine la experiencia de belleza con estilistas internacionales y productos de lujo. Especialistas en novias y color.', founded: '2018', employees: '18', highlights: ['Formación internacional', 'Wella y L\'Oréal Pro', 'VIP para novias'], communication: 'WhatsApp', communicationNote: 'Citas de belleza por WhatsApp', address: 'Av. 19 #120-71, Bogotá', socialLinks: [{ type: 'web', url: 'https://salonelite.co', label: 'salonelite.co' }, { type: 'instagram', url: 'https://instagram.com/salonelite', label: '@salonelite' }, { type: 'facebook', url: 'https://facebook.com/salonelitebog', label: 'Salón Élite' }] },
  'company-013': { tagline: 'Deporte, sol y arena', description: 'Arena Beach Club ofrece canchas de vóley playa y fútbol playa con bar y zona lounge. Torneos semanales y clases.', founded: '2022', employees: '12', highlights: ['Canchas profesionales', 'Torneos semanales', 'Bar y lounge'], communication: 'WhatsApp', communicationNote: 'Reservas rápidas por WhatsApp', address: 'Km 5 vía La Calera', socialLinks: [{ type: 'web', url: 'https://arenabeach.co', label: 'arenabeach.co' }, { type: 'instagram', url: 'https://instagram.com/arenabeachclub', label: '@arenabeachclub' }] },
};

function AcercaTab({ company, companyServices }: { company: any; companyServices: Array<any> }) {
  const info = companyInfo[company.id] || {
    tagline: `Soluciones de ${company.industry}`,
    description: `${company.name} ofrece soluciones innovadoras en el sector de ${company.industry}.`,
    founded: '2023', employees: '20+',
    highlights: ['Tecnología de punta', 'Soporte dedicado', 'Resultados medibles'],
    communication: 'WhatsApp', communicationNote: 'Canal principal',
    address: undefined as string | undefined,
    socialLinks: company.websiteUrl ? [{ type: 'web', url: company.websiteUrl, label: company.websiteUrl.replace('https://', '') }] : [],
  };
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (id: string) => setExpandedSection(prev => prev === id ? null : id);
  const coverImg = industryCover[company.industry];

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      default: return Globe;
    }
  };

  return (
    <div className="space-y-3">
      {/* Hero image + description */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="relative h-32 overflow-hidden">
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

      {/* Social links + address */}
      <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Redes y presencia</p>
        
        <div className="flex flex-wrap gap-1.5">
          {info.socialLinks.map((link, i) => {
            const Icon = getSocialIcon(link.type);
            return (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:border-primary/30 hover:text-primary transition-colors text-[11px] text-foreground"
              >
                <Icon className="w-3 h-3" />
                {link.label}
                <ExternalLink className="w-2 h-2 opacity-40" />
              </a>
            );
          })}
        </div>

        {info.address && (
          <div className="flex items-start gap-2 pt-1.5 border-t border-border/50">
            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground">{info.address}</span>
          </div>
        )}
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
          <span className="text-xs font-medium text-foreground">Detalles de la empresa</span>
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
  const { getVendorTier, currentVendorId } = useDemo();
  const vendorId = currentVendorId || 'vendor-001';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredServices.map((service) => {
            const isPopular = topServiceIds.includes(service.id);
            const vendorTier = getVendorTier(vendorId, service.id);
            const earningsPerSale = vendorTier 
              ? Math.round(service.priceCOP * vendorTier.commissionPct / 100)
              : Math.round(service.priceCOP * service.vendorCommissionPct / 100);
            const coverImg = categoryCovers[service.category];
            const availableCodes = service.activationCodes.filter((c: any) => c.status === 'available').length;
            const isRecurring = service.type === 'suscripción';

            return (
              <div
                key={service.id}
                onClick={() => {
                  if (service.isActive) {
                    navigate(`/vendor/company/${companyId}/service/${service.id}`);
                  } else {
                    navigate(`/vendor/company/${companyId}/service/${service.id}`);
                  }
                }}
                className={`rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:shadow-md hover:border-primary/20 transition-all duration-300 ${
                  !service.isActive ? 'grayscale opacity-75' : ''
                }`}
              >
                <div className="relative h-28 overflow-hidden">
                  <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {!service.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white border border-white/20">
                        <Lock className="w-2.5 h-2.5" /> Sin activar
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap">
                    {isPopular && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                        <Star className="w-2 h-2" fill="currentColor" /> Top
                      </span>
                    )}
                    {vendorTier && vendorTier.tierOrder === 3 && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                        <Crown className="w-2 h-2" /> Elite
                      </span>
                    )}
                    {vendorTier && vendorTier.tierOrder === 2 && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white">
                        <Star className="w-2 h-2" /> Premium
                      </span>
                    )}
                    {isRecurring ? (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/90 text-white">
                        <RefreshCw className="w-2 h-2" /> Mensual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <Zap className="w-2 h-2" /> Único
                      </span>
                    )}
                  </div>

                  {availableCodes === 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">Agotado</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 text-right">
                    <p className="text-xs font-bold text-white drop-shadow-md">{formatCOP(earningsPerSale)}</p>
                  </div>
                </div>

                <div className="p-2.5 space-y-1">
                  <h3 className="font-semibold text-xs text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {service.refundPolicy.refundWindowDays}d</span>
                      <span className="flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> {service.refundPolicy.autoRefund ? 'Auto' : 'Aprob.'}</span>
                      {service.salesCount > 0 && <span>{service.salesCount} venta{service.salesCount !== 1 ? 's' : ''}</span>}
                    </div>
                    <p className="text-[9px] text-muted-foreground">{formatCOP(service.priceCOP)}{isRecurring ? '/mes' : ''}</p>
                  </div>
                </div>
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
