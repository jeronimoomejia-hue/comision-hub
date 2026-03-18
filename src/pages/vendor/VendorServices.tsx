import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Search,
  BookOpen,
  Eye,
  Sparkles,
  Star,
  Flag,
  TrendingUp,
  Zap,
  ArrowRight,
  Users,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import ServiceDetailsModal from "@/components/ServiceDetailsModal";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { label: "Todos", value: "all" },
  { label: "IA para Seguros", value: "IA para Seguros" },
  { label: "IA Legal", value: "IA Legal" },
  { label: "IA Marketing", value: "IA para Marketing" },
  { label: "IA Ventas", value: "IA para Ventas" },
  { label: "IA Atención", value: "IA para Atención" },
  { label: "IA Contabilidad", value: "IA para Contabilidad" },
  { label: "IA RRHH", value: "IA para RRHH" },
  { label: "Ciberseguridad", value: "IA para Ciberseguridad" },
];

export default function VendorServices() {
  const navigate = useNavigate();
  const { services, sales, trainingProgress, currentVendorId, pinnedServices, togglePinService } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

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

  const activeServices = services.filter(s => s.status === 'activo');
  const vendorSales = sales.filter(s => s.vendorId === currentVendorId);

  const vendorServices = activeServices.map(service => {
    const isActive = !service.requiresTraining || getTrainingStatus(service.id);
    const salesCount = vendorSales.filter(s => s.serviceId === service.id).length;
    return { ...service, isActive, salesCount };
  });

  // Sort: pinned first, then by sales count
  const sortedServices = [...vendorServices].sort((a, b) => {
    const aPinned = pinnedServices.includes(a.id) ? 1 : 0;
    const bPinned = pinnedServices.includes(b.id) ? 1 : 0;
    if (bPinned !== aPinned) return bPinned - aPinned;
    return b.salesCount - a.salesCount;
  });

  // Top 3 most sold for "Popular" badge
  const topServiceIds = [...vendorServices]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 3)
    .filter(s => s.salesCount > 0)
    .map(s => s.id);

  const filteredServices = sortedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalActive = vendorServices.filter(s => s.isActive).length;
  const totalPending = vendorServices.filter(s => !s.isActive).length;

  return (
    <DashboardLayout role="vendor" userName="Carlos Mendoza">
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground">
            {totalActive} listos · {totalPending} pendientes
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 sm:h-11 bg-card border-border rounded-xl text-xs sm:text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''}
        </p>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4">
            {filteredServices.map((service) => {
              const isPinned = pinnedServices.includes(service.id);
              const isPopular = topServiceIds.includes(service.id);
              const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);

              return (
                <div
                  key={service.id}
                  className={`card-premium p-3 sm:p-5 flex flex-col relative group transition-all duration-200 ${
                    !service.isActive ? 'opacity-75' : ''
                  }`}
                >
                  {/* Top badges row */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 flex-wrap">
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
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePinService(service.id); }}
                      className={`p-1 rounded-lg transition-colors ${
                        isPinned
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/5'
                      }`}
                      title={isPinned ? 'Quitar del menú' : 'Fijar al menú'}
                    >
                      <Flag className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isPinned ? 'fill-primary' : ''}`} />
                    </button>
                  </div>

                  {/* Service Name & Category */}
                  <h3 className="font-semibold text-[11px] sm:text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors leading-tight">
                    {service.name}
                  </h3>
                  <p className="text-[9px] sm:text-[11px] text-muted-foreground mb-1.5 sm:mb-2">{service.category}</p>

                  {/* Description - hidden on mobile for compactness */}
                  <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                    {service.description}
                  </p>
                  <div className="flex-1 sm:hidden" />

                  {/* Pricing Block */}
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

                  {/* Active subscriptions indicator */}
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
            <p className="text-xs text-muted-foreground">Prueba con otra búsqueda o categoría</p>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
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
