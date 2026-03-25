import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { companies, services as allServices, formatCOP, CURRENT_VENDOR_ID } from "@/data/mockData";
import { Search, Package, Star, RefreshCw, Zap, Lock, Clock, Shield, AlertTriangle, BookOpen, MessageCircle, Tag, ShoppingCart, RotateCcw, ChevronRight, Send, Copy, Percent, Info, Globe, Mail, Phone, MapPin, Building2, ExternalLink, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TransactionCard from "@/components/TransactionCard";

import insuranceImg from "@/assets/service-covers/insurance-ai.jpg";
import legalImg from "@/assets/service-covers/legal-ai.jpg";
import marketingImg from "@/assets/service-covers/marketing-ai.jpg";
import salesImg from "@/assets/service-covers/sales-ai.jpg";
import supportImg from "@/assets/service-covers/support-ai.jpg";
import accountingImg from "@/assets/service-covers/accounting-ai.jpg";
import hrImg from "@/assets/service-covers/hr-ai.jpg";
import securityImg from "@/assets/service-covers/security-ai.jpg";

const categoryCovers: Record<string, string> = {
  'IA para Seguros': insuranceImg,
  'IA Legal': legalImg,
  'IA para Marketing': marketingImg,
  'IA para Ventas': salesImg,
  'IA para Atención': supportImg,
  'IA para Contabilidad': accountingImg,
  'IA para RRHH': hrImg,
  'IA para Ciberseguridad': securityImg,
};

type CompanyTab = 'acerca' | 'servicios' | 'ventas' | 'devoluciones' | 'cupones' | 'chat';

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
  const vendorRefunds = refundRequests.filter(r => r.vendorId === vendorId && r.companyId === companyId);

  const vendorServices = companyServices.map(service => {
    const isActive = !service.requiresTraining || getTrainingStatus(service.id);
    const salesCount = vendorSales.filter(s => s.serviceId === service.id).length;
    return { ...service, isActive, salesCount };
  });

  const sortedServices = [...vendorServices].sort((a, b) => b.salesCount - a.salesCount);
  const topServiceIds = [...vendorServices].sort((a, b) => b.salesCount - a.salesCount).slice(0, 3).filter(s => s.salesCount > 0).map(s => s.id);

  const filteredServices = sortedServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalesAmount = vendorSales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + s.sellerCommissionAmount, 0);
  const inProgressTrainings = companyServices.filter(s => {
    const tp = trainingProgress.find(t => t.vendorId === vendorId && t.serviceId === s.id);
    return tp?.status === 'in_progress';
  }).length;

  const tabs: { id: CompanyTab; label: string; icon: React.ElementType; planRequired?: boolean }[] = [
    { id: 'acerca', label: 'Acerca de', icon: Info },
    { id: 'servicios', label: 'Servicios', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'devoluciones', label: 'Devoluciones', icon: RotateCcw },
    { id: 'cupones', label: 'Cupones', icon: Tag, planRequired: true },
    { id: 'chat', label: 'Chat', icon: MessageCircle, planRequired: true },
  ];

  const visibleTabs = tabs.filter(t => !t.planRequired || isPremiumOrHigher);

  return (
    <VendorTabLayout backTo="/vendor" backLabel="Empresas">
      <div className="space-y-5">
        {/* Company Header */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: company.primaryColor || 'hsl(var(--primary))' }}
          >
            <span className="text-white font-bold text-2xl">{company.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{company.name}</h1>
              <Badge variant="outline" className="text-[10px]">{company.plan}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Servicios</p>
            <p className="text-lg font-bold text-foreground">{companyServices.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mis ventas</p>
            <p className="text-lg font-bold text-foreground">{vendorSales.filter(s => s.status !== 'REFUNDED').length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Comisiones</p>
            <p className="text-lg font-bold text-primary">{formatCOP(totalSalesAmount)}</p>
          </div>
        </div>

        {/* In-progress trainings alert */}
        {inProgressTrainings > 0 && (
          <Link to="/vendor/trainings" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20">
            <BookOpen className="w-4 h-4" />
            {inProgressTrainings} capacitación{inProgressTrainings !== 1 ? 'es' : ''} en curso
          </Link>
        )}

        {/* Internal Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'acerca' && (
          <AcercaTab company={company} companyServices={companyServices} vendorSales={vendorSales} />
        )}

        {activeTab === 'servicios' && (
          <ServiciosTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredServices={filteredServices}
            topServiceIds={topServiceIds}
            onServiceClick={(serviceId: string, isActive: boolean) => {
              if (isActive) {
                navigate(`/vendor/company/${companyId}/service/${serviceId}`);
              } else {
                navigate(`/vendor/trainings/${serviceId}`);
              }
            }}
          />
        )}

        {activeTab === 'ventas' && (
          <VentasTab vendorSales={vendorSales} companyId={companyId!} />
        )}

        {activeTab === 'devoluciones' && (
          <DevolucionesTab vendorSales={vendorSales} vendorRefunds={vendorRefunds} />
        )}

        {activeTab === 'cupones' && (
          <CuponesTab companyName={company.name} />
        )}

        {activeTab === 'chat' && (
          <ChatTab companyName={company.name} />
        )}
      </div>
    </VendorTabLayout>
  );
}

/* =========== Sub-components =========== */

const companyDescriptions: Record<string, { tagline: string; description: string; founded: string; employees: string; highlights: string[] }> = {
  'company-001': { tagline: 'Transformando el sector asegurador con inteligencia artificial', description: 'Poliza.ai automatiza la cotización, emisión y gestión de pólizas usando modelos de IA entrenados con datos del mercado colombiano. Reducimos el tiempo de cotización de horas a segundos.', founded: '2023', employees: '45', highlights: ['Motor de cotización con IA', 'Integración con aseguradoras top', 'Dashboard de análisis predictivo', 'Soporte 24/7 en español'] },
  'company-002': { tagline: 'IA legal que simplifica lo complejo', description: 'LexIA utiliza procesamiento de lenguaje natural para analizar contratos, generar documentos legales y automatizar consultas jurídicas. Más de 500 firmas ya confían en nosotros.', founded: '2022', employees: '32', highlights: ['Análisis de contratos en segundos', 'Generación automática de documentos', 'Base de datos jurisprudencial', 'Cumplimiento normativo automatizado'] },
  'company-003': { tagline: 'Marketing potenciado por datos e inteligencia artificial', description: 'Kreativo genera contenido, optimiza campañas y analiza audiencias usando IA generativa adaptada al mercado latinoamericano.', founded: '2023', employees: '28', highlights: ['Generador de contenido multicanal', 'Optimización de campañas en tiempo real', 'Análisis de sentiment de marca', 'A/B testing automatizado'] },
  'company-004': { tagline: 'Cierra más ventas con asistencia inteligente', description: 'Cierro es un copiloto de ventas que analiza conversaciones, sugiere respuestas y predice el cierre de deals usando machine learning.', founded: '2024', employees: '15', highlights: ['Copiloto de ventas en tiempo real', 'Predicción de cierre de deals', 'Análisis de objeciones', 'CRM integrado con IA'] },
  'company-005': { tagline: 'Atención al cliente que nunca duerme', description: 'Asista despliega agentes de IA que atienden consultas, resuelven problemas y escalan inteligentemente. Reducimos costos de soporte un 60%.', founded: '2022', employees: '52', highlights: ['Agentes conversacionales 24/7', 'Escalamiento inteligente', 'Análisis de satisfacción', 'Integración omnicanal'] },
  'company-006': { tagline: 'Contabilidad inteligente para PyMEs', description: 'NumeroIA automatiza la contabilidad, facturación y reportes fiscales usando IA. Compatible con la normativa tributaria colombiana.', founded: '2023', employees: '20', highlights: ['Facturación electrónica automática', 'Reportes DIAN automatizados', 'Conciliación bancaria con IA', 'Alertas fiscales inteligentes'] },
  'company-007': { tagline: 'Reclutamiento inteligente y sin sesgos', description: 'Recruta analiza perfiles, filtra candidatos y programa entrevistas usando IA. Reduce el tiempo de contratación un 70%.', founded: '2023', employees: '25', highlights: ['Filtrado inteligente de CVs', 'Evaluaciones con IA sin sesgos', 'Programación automática de entrevistas', 'Analytics de diversidad'] },
  'company-008': { tagline: 'Ciberseguridad proactiva con IA', description: 'Blindaje detecta amenazas, analiza vulnerabilidades y responde a incidentes en tiempo real usando machine learning avanzado.', founded: '2022', employees: '38', highlights: ['Detección de amenazas en tiempo real', 'Análisis de vulnerabilidades', 'Respuesta automatizada a incidentes', 'Compliance y auditoría'] },
};

function AcercaTab({ company, companyServices, vendorSales }: { company: any; companyServices: Array<any>; vendorSales: Array<any> }) {
  const coverImg = categoryCovers[company.industry];
  const info = companyDescriptions[company.id] || { tagline: `Soluciones de ${company.industry}`, description: `${company.name} ofrece soluciones innovadoras en el sector de ${company.industry}.`, founded: '2023', employees: '20+', highlights: ['Tecnología de punta', 'Soporte dedicado', 'Resultados medibles'] };

  return (
    <div className="space-y-5">
      {/* Hero image */}
      {coverImg && (
        <div className="rounded-xl overflow-hidden aspect-[2.4/1] relative">
          <img src={coverImg} alt={company.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-white/80 text-xs font-medium">{company.industry}</p>
            <p className="text-white text-lg font-bold leading-tight mt-0.5">{info.tagline}</p>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <p className="text-sm text-foreground leading-relaxed">{info.description}</p>
      </div>

      {/* Company details grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fundada</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{info.founded}</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Equipo</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{info.employees} personas</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">País</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{company.country}</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plan</p>
          <p className="text-sm font-semibold text-foreground mt-0.5 capitalize">{company.plan}</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="p-3 rounded-xl border border-border bg-card space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Lo que ofrece</p>
        <div className="grid grid-cols-1 gap-1.5">
          {info.highlights.map((h: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p className="text-xs text-foreground">{h}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Contacto</p>
        <div className="space-y-1.5">
          {company.contactEmail && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">{company.contactEmail}</span>
            </div>
          )}
          {company.contactPhone && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">{company.contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Website link */}
      {company.websiteUrl && (
        <a
          href={company.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
              <p className="text-xs font-medium text-foreground">Visitar sitio web</p>
              <p className="text-[10px] text-muted-foreground">{company.websiteUrl}</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>
      )}
    </div>
  );
}

function ServiciosTab({ searchQuery, setSearchQuery, filteredServices, topServiceIds, onServiceClick }: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredServices: Array<any>;
  topServiceIds: string[];
  onServiceClick: (id: string, isActive: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-card border-border rounded-xl text-sm"
        />
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isPopular = topServiceIds.includes(service.id);
            const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
            const coverImg = categoryCovers[service.category];
            const availableCodes = service.activationCodes.filter((c: any) => c.status === 'available').length;

            return (
              <div
                key={service.id}
                onClick={() => onServiceClick(service.id, service.isActive)}
                className={`rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                  !service.isActive ? 'grayscale opacity-75' : ''
                }`}
              >
                <div className="relative h-36 sm:h-40 overflow-hidden">
                  <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {!service.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/70 text-white border border-white/20">
                        <Lock className="w-3.5 h-3.5" /> Sin activar
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {isPopular && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                        <Star className="w-2.5 h-2.5" fill="currentColor" /> Top
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-2 py-0.5 rounded-full shadow-sm ${
                      service.type === 'suscripción' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
                    }`}>
                      {service.type === 'suscripción' ? <><RefreshCw className="w-2.5 h-2.5" /> Recurrente</> : <><Zap className="w-2.5 h-2.5" /> Puntual</>}
                    </span>
                    {availableCodes === 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground shadow-sm">
                        <AlertTriangle className="w-2.5 h-2.5" /> Agotado
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 text-right">
                    <p className="text-[9px] text-white/70 uppercase tracking-wider">Tu comisión</p>
                    <p className="text-sm font-bold text-white drop-shadow-md">{formatCOP(earningsPerSale)}</p>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors flex-1">
                      {service.name}
                    </h3>
                    {service.salesCount > 0 && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {service.salesCount} venta{service.salesCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{service.description}</p>
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" /> {service.refundPolicy.refundWindowDays}d
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                        <Shield className="w-2.5 h-2.5" /> {service.refundPolicy.autoRefund ? 'Auto' : 'Aprob.'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{formatCOP(service.priceCOP)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin resultados</p>
          <p className="text-xs text-muted-foreground">Prueba con otra búsqueda</p>
        </div>
      )}
    </div>
  );
}

function VentasTab({ vendorSales, companyId }: { vendorSales: Array<any>; companyId: string }) {
  const activeSales = vendorSales.filter(s => s.status !== 'REFUNDED');

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{activeSales.length} venta{activeSales.length !== 1 ? 's' : ''} activa{activeSales.length !== 1 ? 's' : ''}</p>
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
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin ventas aún</p>
          <p className="text-xs text-muted-foreground">Tus ventas para esta empresa aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}

function DevolucionesTab({ vendorSales, vendorRefunds }: { vendorSales: Array<any>; vendorRefunds: Array<any> }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{vendorRefunds.length} devolución{vendorRefunds.length !== 1 ? 'es' : ''}</p>
      {vendorRefunds.length > 0 ? (
        <div className="space-y-2">
          {vendorRefunds.map(refund => {
            const sale = vendorSales.find(s => s.id === refund.saleId);
            const svc = sale ? allServices.find(s => s.id === sale.serviceId) : null;
            return (
              <TransactionCard
                key={refund.id}
                id={refund.id}
                clientName={sale?.clientName || 'Cliente'}
                clientEmail={sale?.clientEmail}
                serviceName={svc?.name}
                serviceCategory={svc?.category}
                amount={sale?.grossAmount || 0}
                commission={sale?.sellerCommissionAmount}
                status={refund.status}
                statusType="refund"
                date={refund.createdAt}
                refundReason={refund.reason}
                refundDecision={refund.decisionBy === 'sistema' ? 'Automática' : refund.decisionBy === 'empresa' ? 'Empresa' : undefined}
                role="vendor"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <RotateCcw className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Sin devoluciones</p>
          <p className="text-xs text-muted-foreground">No tienes devoluciones en esta empresa</p>
        </div>
      )}
    </div>
  );
}

function CuponesTab({ companyName }: { companyName: string }) {
  const mockCoupons = [
    { id: '1', code: 'NUEVO20', discount: 20, type: 'percent' as const, description: 'Para clientes nuevos', validUntil: '2026-04-30', usesLeft: 15 },
    { id: '2', code: 'PROMO50K', discount: 50000, type: 'fixed' as const, description: 'Descuento en plan anual', validUntil: '2026-05-15', usesLeft: 5 },
    { id: '3', code: 'LANZAMIENTO', discount: 10, type: 'percent' as const, description: 'Promoción de lanzamiento', validUntil: '2026-06-01', usesLeft: 50 },
  ];

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Cupón ${code} copiado`);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{mockCoupons.length} cupones disponibles</p>
      <div className="space-y-2">
        {mockCoupons.map(coupon => (
          <div key={coupon.id} className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Percent className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm font-semibold font-mono text-foreground">{coupon.code}</code>
                <Badge variant="outline" className="text-[9px] px-1.5 h-4">
                  {coupon.type === 'percent' ? `${coupon.discount}%` : formatCOP(coupon.discount)}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{coupon.description}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Válido hasta {new Date(coupon.validUntil).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {coupon.usesLeft} usos
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground flex-shrink-0" onClick={() => copyCoupon(coupon.code)}>
              <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatTab({ companyName }: { companyName: string }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: '1', from: 'company', text: `¡Hola! Bienvenido al equipo de ${companyName}. ¿En qué podemos ayudarte?`, time: '10:30' },
    { id: '2', from: 'vendor', text: 'Hola, tengo una duda sobre el servicio de cotizaciones.', time: '10:32' },
    { id: '3', from: 'company', text: 'Claro, cuéntame. Estoy aquí para ayudarte con lo que necesites.', time: '10:33' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      from: 'vendor',
      text: message.trim(),
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage("");

    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        from: 'company',
        text: 'Gracias por tu mensaje. Te responderemos pronto.',
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: '420px' }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'vendor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
              msg.from === 'vendor'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[9px] mt-1 ${msg.from === 'vendor' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex items-center gap-2">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe un mensaje..."
          className="flex-1 h-9 text-sm rounded-full bg-muted/50 border-0"
        />
        <Button size="icon" className="h-9 w-9 rounded-full flex-shrink-0" onClick={sendMessage} disabled={!message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
