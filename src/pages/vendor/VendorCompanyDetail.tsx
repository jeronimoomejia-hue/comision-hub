import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { companies, services as allServices, formatCOP, CURRENT_VENDOR_ID } from "@/data/mockData";
import { Search, Package, Star, RefreshCw, Zap, Lock, Clock, Shield, AlertTriangle, BookOpen, MessageCircle, Tag, ShoppingCart, RotateCcw, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

type CompanyTab = 'servicios' | 'ventas' | 'devoluciones' | 'cupones' | 'chat';

export default function VendorCompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const { sales, trainingProgress, commissions, currentVendorId } = useDemo();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CompanyTab>('servicios');

  const company = companies.find(c => c.id === companyId);
  if (!company) return <VendorTabLayout backTo="/vendor" backLabel="Inicio"><p>Empresa no encontrada</p></VendorTabLayout>;

  const vendorId = currentVendorId || CURRENT_VENDOR_ID;
  const isPremiumOrHigher = company.plan !== 'freemium';

  const getTrainingStatus = (serviceId: string) => {
    const training = trainingProgress.find(
      tp => tp.vendorId === vendorId && tp.serviceId === serviceId
    );
    return training?.status === 'declared_completed';
  };

  const companyServices = allServices.filter(s => s.status === 'activo' && s.companyId === companyId);
  const vendorSales = sales.filter(s => s.vendorId === vendorId && s.companyId === companyId);
  const vendorComms = commissions.filter(c => c.vendorId === vendorId);

  const vendorServices = companyServices.map(service => {
    const isActive = !service.requiresTraining || getTrainingStatus(service.id);
    const salesCount = vendorSales.filter(s => s.serviceId === service.id).length;
    return { ...service, isActive, salesCount };
  });

  const sortedServices = [...vendorServices].sort((a, b) => b.salesCount - a.salesCount);
  const topServiceIds = [...vendorServices]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 3)
    .filter(s => s.salesCount > 0)
    .map(s => s.id);

  const filteredServices = sortedServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalesAmount = vendorSales.filter(s => s.status !== 'REFUNDED').reduce((a, s) => a + s.sellerCommissionAmount, 0);
  const inProgressTrainings = companyServices.filter(s => {
    const tp = trainingProgress.find(t => t.vendorId === vendorId && t.serviceId === s.id);
    return tp?.status === 'in_progress';
  }).length;

  // Tabs config (plan-dependent)
  const tabs: { id: CompanyTab; label: string; icon: React.ElementType; planRequired?: boolean }[] = [
    { id: 'servicios', label: 'Servicios', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'devoluciones', label: 'Devoluciones', icon: RotateCcw },
    { id: 'cupones', label: 'Cupones', icon: Tag, planRequired: true },
    { id: 'chat', label: 'Chat', icon: MessageCircle, planRequired: true },
  ];

  const visibleTabs = tabs.filter(t => !t.planRequired || isPremiumOrHigher);

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      'HELD': { cls: "bg-amber-50 text-amber-600", label: "Retenida" },
      'RELEASED': { cls: "bg-emerald-50 text-emerald-600", label: "Liberada" },
      'REFUNDED': { cls: "bg-red-50 text-red-600", label: "Devuelta" },
    };
    return map[status] || { cls: "bg-muted text-muted-foreground", label: status };
  };

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
            <p className="text-lg font-bold" style={{ color: company.primaryColor || 'hsl(var(--primary))' }}>{formatCOP(totalSalesAmount)}</p>
          </div>
        </div>

        {/* Pending trainings alert */}
        {pendingTrainings > 0 && (
          <Link to="/vendor/trainings" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20">
            <BookOpen className="w-4 h-4" />
            {pendingTrainings} capacitación{pendingTrainings !== 1 ? 'es' : ''} pendiente{pendingTrainings !== 1 ? 's' : ''}
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
        {activeTab === 'servicios' && (
          <ServiciosTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredServices={filteredServices}
            topServiceIds={topServiceIds}
            setSelectedServiceId={setSelectedServiceId}
            companyIndustry={company.industry}
          />
        )}

        {activeTab === 'ventas' && (
          <VentasTab vendorSales={vendorSales} getStatusConfig={getStatusConfig} />
        )}

        {activeTab === 'devoluciones' && (
          <DevolucionesTab vendorSales={vendorSales} />
        )}

        {activeTab === 'cupones' && (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Cupones de descuento</p>
            <p className="text-xs text-muted-foreground">Los cupones disponibles de esta empresa aparecerán aquí</p>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Chat con {company.name}</p>
            <p className="text-xs text-muted-foreground">El chat con la empresa estará disponible aquí</p>
          </div>
        )}
      </div>

      {selectedServiceId && (
        <ServiceDetailsModal
          serviceId={selectedServiceId}
          isOpen={!!selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </VendorTabLayout>
  );
}

/* =========== Sub-components =========== */

function ServiciosTab({ searchQuery, setSearchQuery, filteredServices, topServiceIds, setSelectedServiceId, companyIndustry }: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredServices: Array<any>;
  topServiceIds: string[];
  setSelectedServiceId: (id: string) => void;
  companyIndustry: string;
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
                onClick={() => setSelectedServiceId(service.id)}
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

function VentasTab({ vendorSales, getStatusConfig }: {
  vendorSales: Array<any>;
  getStatusConfig: (status: string) => { cls: string; label: string };
}) {
  const activeSales = vendorSales.filter(s => s.status !== 'REFUNDED');
  
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{activeSales.length} venta{activeSales.length !== 1 ? 's' : ''} activa{activeSales.length !== 1 ? 's' : ''}</p>
      {vendorSales.length > 0 ? (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {vendorSales.map(sale => {
            const svc = allServices.find(s => s.id === sale.serviceId);
            const sc = getStatusConfig(sale.status);
            return (
              <div key={sale.id} className="flex items-center justify-between p-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{sale.clientName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{svc?.name} · {new Date(sale.createdAt).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold">{formatCOP(sale.sellerCommissionAmount)}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                </div>
              </div>
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

function DevolucionesTab({ vendorSales }: { vendorSales: Array<any> }) {
  const refundedSales = vendorSales.filter(s => s.status === 'REFUNDED');
  
  return (
    <div className="space-y-3">
      {refundedSales.length > 0 ? (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {refundedSales.map(sale => {
            const svc = allServices.find(s => s.id === sale.serviceId);
            return (
              <div key={sale.id} className="flex items-center justify-between p-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{sale.clientName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{svc?.name}</p>
                </div>
                <span className="text-xs text-destructive font-medium flex-shrink-0">{formatCOP(sale.sellerCommissionAmount)}</span>
              </div>
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
