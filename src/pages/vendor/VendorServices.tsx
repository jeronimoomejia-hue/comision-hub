import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Search, Zap, RefreshCw, AlertTriangle,
  Star, Clock, Shield, Package, Lock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, companies } from "@/data/mockData";
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

export default function VendorServices() {
  const { services, sales, trainingProgress, currentVendorId, currentCompanyId } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const company = companies.find(c => c.id === currentCompanyId);

  const getTrainingStatus = (serviceId: string) => {
    const training = trainingProgress.find(
      tp => tp.vendorId === currentVendorId && tp.serviceId === serviceId
    );
    return training?.status === 'declared_completed';
  };

  const companyServices = services.filter(s => s.status === 'activo' && s.companyId === currentCompanyId);
  const vendorSales = sales.filter(s => s.vendorId === currentVendorId);

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

  const totalActive = vendorServices.filter(s => s.isActive).length;
  const totalPending = vendorServices.filter(s => !s.isActive).length;

  return (
    <DashboardLayout role="vendor" userName="Carlos Mendoza">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">
              Servicios de {company?.name || 'la empresa'}
            </h1>
            <p className="text-[11px] sm:text-sm text-muted-foreground">
              {totalActive} listos para vender · {totalPending} pendientes de capacitación
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="w-3.5 h-3.5" />
            {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} disponibles
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 sm:h-11 bg-card border-border rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Services Grid */}
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
                  {/* Cover Image */}
                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={service.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Inactive overlay */}
                    {!service.isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/70 text-white border border-white/20">
                          <Lock className="w-3.5 h-3.5" />
                          Sin activar
                        </span>
                      </div>
                    )}

                    {/* Badges on image */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {isPopular && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                          <Star className="w-2.5 h-2.5" fill="currentColor" />
                          Top
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm ${
                        service.type === 'suscripción' 
                          ? 'bg-blue-500/90 text-white' 
                          : 'bg-purple-500/90 text-white'
                      }`}>
                        {service.type === 'suscripción' ? (
                          <><RefreshCw className="w-2.5 h-2.5" /> Recurrente</>
                        ) : (
                          <><Zap className="w-2.5 h-2.5" /> Puntual</>
                        )}
                      </span>
                      {availableCodes === 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground shadow-sm">
                          <AlertTriangle className="w-2.5 h-2.5" /> Agotado
                        </span>
                      )}
                    </div>

                    {/* Price on bottom-right of image */}
                    <div className="absolute bottom-3 right-3 text-right">
                      <p className="text-[9px] text-white/70 uppercase tracking-wider">Tu comisión</p>
                      <p className="text-sm sm:text-base font-bold text-white drop-shadow-md">{formatCOP(earningsPerSale)}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 sm:p-4 space-y-2">
                    {/* Company row */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                        style={{ backgroundColor: company?.primaryColor || 'hsl(var(--primary))' }}
                      >
                        {company?.name?.[0] || 'E'}
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{company?.name}</span>
                      {service.salesCount > 0 && (
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {service.salesCount} venta{service.salesCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {service.description}
                    </p>

                    {/* Footer */}
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />
                          {service.refundPolicy.refundWindowDays}d
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Shield className="w-2.5 h-2.5" />
                          {service.refundPolicy.autoRefund ? 'Auto' : 'Aprob.'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatCOP(service.priceCOP)}
                      </p>
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

      {selectedServiceId && (
        <ServiceDetailsModal
          serviceId={selectedServiceId}
          isOpen={!!selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </DashboardLayout>
  );
}
