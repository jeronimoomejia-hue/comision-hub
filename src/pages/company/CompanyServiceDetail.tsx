import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Package, Key, Info, Users, BookOpen, Tag, Shield,
  ArrowLeft, RefreshCw, Zap, Check, Pause
} from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { CURRENT_COMPANY_ID, companies } from "@/data/mockData";
import { categoryCovers } from "@/data/coverImages";
import ResumenTab from "./service-tabs/ResumenTab";
import VentasTab from "./service-tabs/VentasTab";
import VendedoresTab from "./service-tabs/VendedoresTab";
import CapacitacionTab from "./service-tabs/CapacitacionTab";
import CuponesTab from "./service-tabs/CuponesTab";
import CodigosTab from "./service-tabs/CodigosTab";
import ConfigTab from "./service-tabs/ConfigTab";

type ServiceTab = 'resumen' | 'ventas' | 'vendedores' | 'capacitacion' | 'cupones' | 'codigos' | 'config';

export default function CompanyServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const {
    services, sales, commissions, refundRequests, trainingProgress,
    updateService, addActivationCodes, updateRefundRequest, currentCompanyPlan
  } = useDemo();

  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  const service = services.find(s => s.id === serviceId);
  const [activeTab, setActiveTab] = useState<ServiceTab>('resumen');

  if (!service) {
    return (
      <DashboardLayout role="company" userName={company?.name}>
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Producto no encontrado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/company/services')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const coverImg = categoryCovers[service.category];
  const serviceSales = sales.filter(s => s.serviceId === serviceId && s.companyId === CURRENT_COMPANY_ID);
  const codesAvailable = service.activationCodes.filter(c => c.status === 'available').length;

  const activeSubscriptions = service.type === 'suscripción'
    ? serviceSales.filter(s => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length
    : 0;

  const serviceVendorIds = new Set(serviceSales.map(s => s.vendorId));
  const serviceTrainingVendorIds = new Set(trainingProgress.filter(tp => tp.serviceId === serviceId).map(tp => tp.vendorId));
  const allVendorIds = new Set([...serviceVendorIds, ...serviceTrainingVendorIds]);

  const tabs: { id: ServiceTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'resumen', label: 'Resumen', icon: Info },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, badge: serviceSales.length },
    { id: 'vendedores', label: 'Vendedores', icon: Users, badge: allVendorIds.size },
    { id: 'capacitacion', label: 'Entrenamiento', icon: BookOpen },
    { id: 'cupones', label: 'Cupones', icon: Tag },
    { id: 'codigos', label: 'Códigos', icon: Key, badge: codesAvailable },
    { id: 'config', label: 'Config', icon: Shield },
  ];

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-5">
        <button onClick={() => navigate('/company/services')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Mis Productos
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={coverImg} alt={service.category} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground leading-tight">{service.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{service.category}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[9px]">
                {service.type === 'suscripción' ? <><RefreshCw className="w-2.5 h-2.5 mr-0.5" /> Recurrente</> : <><Zap className="w-2.5 h-2.5 mr-0.5" /> Puntual</>}
              </Badge>
              <Badge className={`text-[9px] border-0 ${service.status === 'activo' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {service.status === 'activo' ? <><Check className="w-2.5 h-2.5 mr-0.5" /> Activo</> : <><Pause className="w-2.5 h-2.5 mr-0.5" /> Pausado</>}
              </Badge>
              {service.type === 'suscripción' && activeSubscriptions > 0 && (
                <Badge className="text-[9px] border-0 bg-blue-500/10 text-blue-600">
                  <RefreshCw className="w-2.5 h-2.5 mr-0.5" /> {activeSubscriptions} suscripciones activas
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[9px] font-semibold">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'resumen' && <ResumenTab service={service} sales={serviceSales} activeSubscriptions={activeSubscriptions} vendorCount={allVendorIds.size} updateService={updateService} />}
        {activeTab === 'ventas' && <VentasTab service={service} serviceSales={serviceSales} commissions={commissions} refundRequests={refundRequests} updateRefundRequest={updateRefundRequest} />}
        {activeTab === 'vendedores' && <VendedoresTab service={service} serviceSales={serviceSales} trainingProgress={trainingProgress} allVendorIds={allVendorIds} />}
        {activeTab === 'capacitacion' && <CapacitacionTab service={service} trainingProgress={trainingProgress} />}
        {activeTab === 'cupones' && <CuponesTab service={service} currentPlan={currentCompanyPlan} />}
        {activeTab === 'codigos' && <CodigosTab service={service} addActivationCodes={addActivationCodes} currentPlan={currentCompanyPlan} />}
        {activeTab === 'config' && <ConfigTab service={service} updateService={updateService} />}
      </div>
    </DashboardLayout>
  );
}
