import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Search, BookOpen, Eye, TrendingUp, Zap, ArrowRight, Users, RefreshCw, AlertTriangle,
  Star, Clock, Shield, Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { formatCOP, companies } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import ServiceDetailsModal from "@/components/ServiceDetailsModal";
import { Badge } from "@/components/ui/badge";

// Category gradient map for servicio header visuals
const categoryGradients: Record<string, string> = {
  'IA para Seguros': 'from-blue-500/20 to-indigo-500/20',
  'IA Legal': 'from-emerald-500/20 to-teal-500/20',
  'IA para Marketing': 'from-pink-500/20 to-rose-500/20',
  'IA para Ventas': 'from-amber-500/20 to-orange-500/20',
  'IA para Atención': 'from-violet-500/20 to-purple-500/20',
  'IA para Contabilidad': 'from-cyan-500/20 to-blue-500/20',
  'IA para RRHH': 'from-fuchsia-500/20 to-pink-500/20',
  'IA para Ciberseguridad': 'from-green-500/20 to-emerald-500/20',
};

const categoryIcons: Record<string, string> = {
  'IA para Seguros': '🛡️',
  'IA Legal': '⚖️',
  'IA para Marketing': '📢',
  'IA para Ventas': '🎯',
  'IA para Atención': '💬',
  'IA para Contabilidad': '📊',
  'IA para RRHH': '👥',
  'IA para Ciberseguridad': '🔒',
};

export default function VendorGigs() {
  const navigate = useNavigate();
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

  const getTrainingId = (serviceId: string) => {
    const training = trainingProgress.find(
      tp => tp.vendorId === currentVendorId && tp.serviceId === serviceId
    );
    return training?.id || serviceId;
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
            {filteredServices.length} gig{filteredServices.length !== 1 ? 's' : ''} disponibles
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

        {/* Gigs Grid - Fiverr style */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const isPopular = topServiceIds.includes(service.id);
              const earningsPerSale = Math.round(service.priceCOP * service.vendorCommissionPct / 100);
              const gradient = categoryGradients[service.category] || 'from-primary/20 to-primary/10';
              const icon = categoryIcons[service.category] || '📦';
              const availableCodes = service.activationCodes.filter(c => c.status === 'available').length;

              return (
                <div
                  key={service.id}
                  className={`rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                    !service.isActive ? 'opacity-70' : ''
                  }`}
                >
                  {/* Gig Header / Cover */}
                  <div className={`relative h-28 sm:h-36 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between`}>
                    {/* Category icon */}
                    <div className="text-3xl sm:text-4xl">{icon}</div>
                    
                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isPopular && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                          <Star className="w-2.5 h-2.5" fill="currentColor" />
                          Top Seller
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full ${
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
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                          <AlertTriangle className="w-2.5 h-2.5" /> Agotado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gig Body */}
                  <div className="p-3 sm:p-4 space-y-3">
                    {/* Company info row */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
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
                    <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {service.description}
                    </p>

                    {/* Info pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        <Clock className="w-2.5 h-2.5" />
                        {service.refundPolicy.refundWindowDays}d devolución
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        <Shield className="w-2.5 h-2.5" />
                        {service.refundPolicy.autoRefund ? 'Auto-refund' : 'Aprobación'}
                      </span>
                      {availableCodes > 0 && availableCodes < 5 && (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {availableCodes} códigos
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border" />

                    {/* Pricing footer - Fiverr style */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">Tu comisión</p>
                        <p className="text-sm sm:text-lg font-bold text-primary">{formatCOP(earningsPerSale)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">Precio al cliente</p>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{formatCOP(service.priceCOP)}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    {service.isActive ? (
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 sm:h-9 text-xs"
                          onClick={() => setSelectedServiceId(service.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Detalles
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 sm:h-9 text-xs"
                          onClick={() => navigate(`/vendor/gigs/${service.id}`)}
                        >
                          Vender
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 sm:h-9 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => navigate(`/vendor/trainings/${getTrainingId(service.id)}`)}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        Completar capacitación para desbloquear
                      </Button>
                    )}
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
