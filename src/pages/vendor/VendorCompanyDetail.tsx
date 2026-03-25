import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import VendorTabLayout from "@/components/layout/VendorTabLayout";
import { useDemo } from "@/contexts/DemoContext";
import { companies, services as allServices, formatCOP, CURRENT_VENDOR_ID } from "@/data/mockData";
import { Search, Package, Star, RefreshCw, Zap, Lock, Clock, Shield, AlertTriangle, BookOpen, MessageCircle, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ServiceDetailsModal from "@/components/ServiceDetailsModal";

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

export default function VendorCompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const { sales, trainingProgress, currentVendorId } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const company = companies.find(c => c.id === companyId);
  if (!company) return <VendorTabLayout backTo="/vendor" backLabel="Inicio"><p>Empresa no encontrada</p></VendorTabLayout>;

  const vendorId = currentVendorId || CURRENT_VENDOR_ID;

  const getTrainingStatus = (serviceId: string) => {
    const training = trainingProgress.find(
      tp => tp.vendorId === vendorId && tp.serviceId === serviceId
    );
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
  const pendingTrainings = companyServices.filter(s => s.requiresTraining && !getTrainingStatus(s.id)).length;

  // Plan-dependent features
  const isPremiumOrHigher = company.plan !== 'freemium';

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

        {/* Plan-dependent quick actions */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {pendingTrainings > 0 && (
            <Link to="/vendor/trainings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium whitespace-nowrap flex-shrink-0 border border-amber-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              {pendingTrainings} capacitación{pendingTrainings !== 1 ? 'es' : ''} pendiente{pendingTrainings !== 1 ? 's' : ''}
            </Link>
          )}
          {isPremiumOrHigher && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium whitespace-nowrap flex-shrink-0 border border-primary/20">
                <Tag className="w-3.5 h-3.5" />
                Cupones
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium whitespace-nowrap flex-shrink-0 border border-primary/20">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-card border-border rounded-xl text-sm"
          />
        </div>

        {/* Services Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((service) => {
                const isPopular = topServiceIds.includes(service.id);
                const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
                const coverImg = categoryCovers[service.category];
                const availableCodes = service.activationCodes.filter(c => c.status === 'available').length;

                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                      !service.isActive ? 'grayscale opacity-75' : ''
                    }`}
                  >
                    <div className="relative h-36 sm:h-40 overflow-hidden">
                      <img src={coverImg} alt={service.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
