import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Search, BookOpen, Eye, TrendingUp, Zap, ArrowRight, Users, RefreshCw, AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, companies } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import ServiceDetailsModal from "@/components/ServiceDetailsModal";
import { Badge } from "@/components/ui/badge";

export default function VendorServices() {
  const navigate = useNavigate();
  const { services, sales, trainingProgress, currentVendorId, currentCompanyId, currentCompanyPlan } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const company = companies.find(c => c.id === currentCompanyId);

  const getTrainingStatus = (serviceId: string) => {
    const training = trainingProgress.find(
      tp => tp.vendorId === currentVendorId && tp.serviceId === serviceId
    );
    return training?.status === 'declared_completed';
  };

  const getTrainingId = (serviceId: string) => {
    const training = trainingProgress.find(
      tp => tp.vendorId === currentVendorId && tp.serviceId === serviceId
    );
    return training?.id || serviceId;
  };

  // Only show services from the vendor's company (private network)
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

  const filteredServices = sortedServices.filter(service => {
    return service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           service.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalActive = vendorServices.filter(s => s.isActive).length;
  const totalPending = vendorServices.filter(s => !s.isActive).length;

  return (
    <DashboardLayout role="vendor" userName="Carlos Mendoza">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">
            Servicios de {company?.name || 'la empresa'}
          </h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground">
            {totalActive} listos para vender · {totalPending} pendientes de capacitación
          </p>
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

        {/* Results */}
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} disponibles
        </p>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4">
            {filteredServices.map((service) => {
              const isPopular = topServiceIds.includes(service.id);
              const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);

              return (
                <div
                  key={service.id}
                  className={`card-premium p-3 sm:p-5 flex flex-col relative group transition-all duration-200 ${
                    !service.isActive ? 'opacity-75' : ''
                  }`}
                >
                  {/* Top badges */}
                  <div className="flex items-center gap-1 flex-wrap mb-2 sm:mb-3">
                    {isPopular && (
                      <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1.5 py-0 sm:px-2 sm:py-0.5 bg-amber-50 text-amber-700 border-amber-200">
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                        Popular
                      </Badge>
                    )}
                    {service.type === 'suscripción' ? (
                      <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1.5 py-0 sm:px-2 sm:py-0.5 bg-blue-50 text-blue-600 border-blue-200">
                        <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                        Recurrente
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1.5 py-0 sm:px-2 sm:py-0.5 bg-purple-50 text-purple-600 border-purple-200">
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                        Puntual
                      </Badge>
                    )}
                  </div>

                  {/* Name & Category */}
                  <h3 className="font-semibold text-[11px] sm:text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors leading-tight">
                    {service.name}
                  </h3>
                  <p className="text-[9px] sm:text-[11px] text-muted-foreground mb-1.5 sm:mb-2">{service.category}</p>

                  <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                    {service.description}
                  </p>
                  <div className="flex-1 sm:hidden" />

                  {/* Pricing */}
                  <div className="bg-secondary/60 rounded-lg p-2 sm:p-3 mb-2.5 sm:mb-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Precio</p>
                        <p className="text-[11px] sm:text-base font-bold text-foreground">{formatCOP(service.priceCOP)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ganas</p>
                        <p className="text-[11px] sm:text-base font-bold text-primary">{formatCOP(earningsPerSale)}</p>
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 sm:mt-2 sm:pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground">Comisión</span>
                      <span className="text-[10px] sm:text-xs font-semibold text-primary">{service.vendorCommissionPct}%{service.type === 'suscripción' ? '/mes' : ''}</span>
                    </div>
                  </div>

                  {/* Activation codes availability */}
                  {(() => {
                    const availableCodes = service.activationCodes.filter(c => c.status === 'available').length;
                    const noStock = availableCodes === 0;
                    return noStock ? (
                      <div className="flex items-center gap-1 mb-2 sm:mb-3 text-[9px] sm:text-[11px] text-destructive">
                        <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>Sin códigos disponibles</span>
                      </div>
                    ) : availableCodes < 5 ? (
                      <div className="flex items-center gap-1 mb-2 sm:mb-3 text-[9px] sm:text-[11px] text-amber-600">
                        <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{availableCodes} códigos restantes</span>
                      </div>
                    ) : null;
                  })()}

                  {/* Active subscriptions */}
                  {service.type === 'suscripción' && service.activeSubscriptions && service.isActive && (
                    <div className="flex items-center gap-1 mb-2 sm:mb-3 text-[9px] sm:text-[11px] text-muted-foreground">
                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{service.activeSubscriptions} activos</span>
                    </div>
                  )}

                  {/* CTA */}
                  {service.isActive ? (
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 sm:h-9 text-[10px] sm:text-xs px-2"
                        onClick={() => setSelectedServiceId(service.id)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 sm:h-9 text-[10px] sm:text-xs px-2"
                        onClick={() => navigate(`/vendor/services/${service.id}`)}
                      >
                        Vender
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 sm:h-9 text-[10px] sm:text-xs border-amber-300 text-amber-700 hover:bg-amber-50 px-2"
                      onClick={() => navigate(`/vendor/trainings/${getTrainingId(service.id)}`)}
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Capacitarse
                    </Button>
                  )}
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
